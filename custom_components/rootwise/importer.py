"""Read plants from Plant Monitor (Olen's "plant" integration) for import.

Everything comes from the entity and device registries plus current states,
keyed by the translation keys Plant Monitor gives its entities. Rootwise
never reads another integration's stored config.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util

from .const import (
    CONF_AREA,
    CONF_BATTERY_SENSOR,
    CONF_CONDUCTIVITY_SENSOR,
    CONF_HUMIDITY_SENSOR,
    CONF_ILLUMINANCE_SENSOR,
    CONF_MOISTURE_SENSOR,
    CONF_SPECIES,
    CONF_SPECIES_INFO,
    CONF_TEMPERATURE_SENSOR,
    SENSOR_KEYS,
    SUBENTRY_PLANT,
)
from .sources import is_mirror, resolve
from .species.db import SpeciesDb
from .suggest import suggest_sensors

PLANT_MONITOR = "plant"
SOURCE = "plant_monitor"

# Plant Monitor mirror translation key → Rootwise field (soil temperature
# only if no temperature is set).
_SENSORS = {
    "moisture": CONF_MOISTURE_SENSOR,
    "temperature": CONF_TEMPERATURE_SENSOR,
    "soil_temperature": CONF_TEMPERATURE_SENSOR,
    "humidity": CONF_HUMIDITY_SENSOR,
    "illuminance": CONF_ILLUMINANCE_SENSOR,
    "conductivity": CONF_CONDUCTIVITY_SENSOR,
}
# Plant Monitor limit → Rootwise range key. Its moisture limits use the
# Mi Flora scale and are left out.
_RANGES = {
    "temperature": "temperature",
    "humidity": "air_humidity",
    "illuminance": "illuminance",
    "conductivity": "conductivity",
    "dli": "dli",
}


@dataclass(slots=True)
class ImportedPlant:
    """A Plant Monitor plant, translated to Rootwise subentry data."""

    entity_id: str
    name: str
    data: dict[str, Any]
    mirrors: set[str] = field(default_factory=set)


def _number(hass: HomeAssistant, entity_id: str) -> float | None:
    state = hass.states.get(entity_id)
    try:
        return float(state.state) if state else None
    except ValueError:
        return None


def _read_plant(
    hass: HomeAssistant, plant: er.RegistryEntry, db: SpeciesDb
) -> ImportedPlant:
    ent_reg, dev_reg = er.async_get(hass), dr.async_get(hass)
    state = hass.states.get(plant.entity_id)
    attrs: Mapping[str, Any] = state.attributes if state else {}
    name = str(attrs.get("friendly_name") or plant.name or plant.original_name or "")
    data: dict[str, Any] = {}

    device = dev_reg.async_get(plant.device_id) if plant.device_id else None
    if area := plant.area_id or (device.area_id if device else None):
        data[CONF_AREA] = area

    mirrors: set[str] = set()
    ranges: dict[str, dict[str, float | None]] = {}
    siblings = (
        er.async_entries_for_config_entry(ent_reg, plant.config_entry_id)
        if plant.config_entry_id
        else []
    )
    for entity in siblings:
        key = entity.translation_key or ""
        if entity.domain == "sensor" and key in _SENSORS:
            mirrors.add(entity.entity_id)
            target = _SENSORS[key]
            real = resolve(hass, entity.entity_id)
            if real and not (key == "soil_temperature" and target in data):
                data[target] = real
        elif entity.domain == "number" and key[:4] in ("min_", "max_"):
            if (range_key := _RANGES.get(key[4:])) is None:
                continue
            if (value := _number(hass, entity.entity_id)) is not None:
                ranges.setdefault(range_key, {"min": None, "max": None})
                ranges[range_key][key[:3]] = value

    scientific = str(attrs.get("species") or "")
    info: dict[str, Any] = {
        "source": SOURCE,
        "pid": scientific.casefold(),
        "scientific": scientific,
        "common": None,
    }
    if picture := attrs.get("entity_picture"):
        info["image_url"] = str(picture)
    info["ranges"] = ranges
    info["fetched"] = dt_util.utcnow().isoformat()
    data[CONF_SPECIES_INFO] = info
    if scientific and (species := db.find_scientific(scientific)):
        data[CONF_SPECIES] = species.id
    return ImportedPlant(plant.entity_id, name or plant.entity_id, data, mirrors)


@callback
def plant_monitor_plants(hass: HomeAssistant, db: SpeciesDb) -> list[ImportedPlant]:
    """Return all Plant Monitor plants, sorted by name."""
    plants = [
        _read_plant(hass, entity, db)
        for entity in er.async_get(hass).entities.values()
        if entity.domain == PLANT_MONITOR and entity.platform == PLANT_MONITOR
    ]
    return sorted(plants, key=lambda p: p.name.casefold())


def find_existing(entry: ConfigEntry, plant: ImportedPlant) -> ConfigSubentry | None:
    """Return the Rootwise plant reading this Plant Monitor plant's soil sensor."""
    moisture = plant.data.get(CONF_MOISTURE_SENSOR)
    for subentry in entry.subentries.values():
        if subentry.subentry_type != SUBENTRY_PLANT:
            continue
        own = subentry.data.get(CONF_MOISTURE_SENSOR)
        if own and (own == moisture or own in plant.mirrors):
            return subentry
    return None


def merge(
    hass: HomeAssistant, current: Mapping[str, Any], plant: ImportedPlant
) -> dict[str, Any]:
    """Merge an import into a plant: real sensors, species data; keep the rest."""
    data = dict(current)
    for key in (CONF_MOISTURE_SENSOR, *SENSOR_KEYS):
        own = data.get(key)
        if own and not is_mirror(hass, own):
            continue
        if new := plant.data.get(key) or (own and resolve(hass, own)):
            data[key] = new
        else:
            data.pop(key, None)
    # Plant Monitor has no battery; take the soil sensor's own.
    moisture = data.get(CONF_MOISTURE_SENSOR)
    if moisture and not data.get(CONF_BATTERY_SENSOR):
        suggestions = suggest_sensors(hass, moisture, None)
        if battery := suggestions.get(CONF_BATTERY_SENSOR):
            data[CONF_BATTERY_SENSOR] = battery
    for key in (CONF_SPECIES_INFO, CONF_SPECIES, CONF_AREA):
        if not data.get(key) and plant.data.get(key):
            data[key] = plant.data[key]
    return data
