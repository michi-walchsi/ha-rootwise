"""A plant's data from the panel's wizard, checked like the HA dialog does.

The dialog (config_flow.PlantSubentryFlow) and the wizard
(rootwise/plants/create) share these rules: real sensors instead of mirrors,
a soil sensor for one plant only, known species, rooms and sensors.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Final

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)

from .const import (
    CONF_AREA,
    CONF_DRAINAGE,
    CONF_LOCATION,
    CONF_MOISTURE_SENSOR,
    CONF_POT_DIAMETER,
    CONF_POT_MATERIAL,
    CONF_SPECIES,
    CONF_SPECIES_INFO,
    CONF_WINDOW,
    SENSOR_DEVICE_CLASSES,
    SENSOR_KEYS,
)
from .opb import OpbError, async_search, async_species_info, opb_available
from .sources import mirror_entities, resolve
from .species.db import SpeciesDb
from .suggest import suggest_sensors

# The dialog's defaults for pot and place.
POT_DEFAULTS: Final[dict[str, Any]] = {
    CONF_POT_DIAMETER: 18,
    CONF_POT_MATERIAL: "plastic",
    CONF_DRAINAGE: True,
    CONF_WINDOW: "none",
    CONF_LOCATION: "indoor",
}
# Some soil probes report as humidity; those come after the moisture ones.
SOIL_CLASSES: Final = ("moisture", "humidity")
MAX_CANDIDATES: Final = 40
MAX_MATCHES: Final = 8


class PlantDataError(ValueError):
    """Data the wizard sent that can't become a plant (code for the UI)."""

    def __init__(self, code: str) -> None:
        """Keep the code for the WebSocket error."""
        super().__init__(code)
        self.code = code


def real_sensors(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Replace mirror sensors by the real ones; drop mirrors of unknown origin."""
    result = dict(data)
    for key in (CONF_MOISTURE_SENSOR, *SENSOR_KEYS):
        if entity_id := result.get(key):
            if (real := resolve(hass, entity_id)) is None:
                result.pop(key)
            else:
                result[key] = real
    return result


def sensor_in_use(
    entry: ConfigEntry, entity_id: str, current: ConfigSubentry | None
) -> bool:
    """Return whether another plant already has this soil sensor."""
    return any(
        sub.data.get(CONF_MOISTURE_SENSOR) == entity_id
        for sub in entry.subentries.values()
        if current is None or sub.subentry_id != current.subentry_id
    )


async def async_species_choice(
    hass: HomeAssistant, db: SpeciesDb, pid: str
) -> tuple[dict[str, Any], str | None]:
    """Return the OpenPlantbook snapshot and the matching offline species id."""
    try:
        info = await async_species_info(hass, pid)
    except OpbError as err:
        raise PlantDataError("opb_failed") from err
    match = db.find_scientific(str(info.get("scientific", "")))
    return info, match.id if match else None


async def async_build_plant(
    hass: HomeAssistant, entry: ConfigEntry, db: SpeciesDb, wizard: Mapping[str, Any]
) -> tuple[str, dict[str, Any]]:
    """Return (title, subentry data) for a new plant from the wizard."""
    name = str(wizard["name"]).strip()
    if not name:
        raise PlantDataError("name_missing")
    data: dict[str, Any] = {}
    if area_id := wizard.get("area_id"):
        if ar.async_get(hass).async_get_area(area_id) is None:
            raise PlantDataError("unknown_area")
        data[CONF_AREA] = area_id
    if pid := wizard.get("opb_pid"):
        info, species_id = await async_species_choice(hass, db, pid)
        data[CONF_SPECIES_INFO] = info
        if species_id:
            data[CONF_SPECIES] = species_id
    elif species_id := wizard.get("species"):
        if db.get(species_id) is None:
            raise PlantDataError("unknown_species")
        data[CONF_SPECIES] = species_id
    for key, entity_id in (wizard.get("sensors") or {}).items():
        if not entity_id:
            continue
        if not entity_id.startswith("sensor.") or hass.states.get(entity_id) is None:
            raise PlantDataError("unknown_sensor")
        data[key] = entity_id
    data = real_sensors(hass, data)
    moisture = data.get(CONF_MOISTURE_SENSOR)
    if moisture and sensor_in_use(entry, moisture, None):
        raise PlantDataError("sensor_in_use")
    data.update({**POT_DEFAULTS, **(wizard.get("pot") or {})})
    return name, data


async def async_search_species(
    hass: HomeAssistant, db: SpeciesDb, query: str
) -> dict[str, Any]:
    """Return OpenPlantbook hits (if the integration is there) and offline ones."""
    wanted = query.strip().casefold()
    species: list[dict[str, Any]] = []
    failed = False
    available = opb_available(hass)
    if available and wanted:
        try:
            hits = await async_search(hass, query)
        except OpbError:
            failed = True
        else:
            species += [
                {"source": "openplantbook", "pid": pid, "label": label}
                for pid, label in hits[:MAX_MATCHES]
            ]
    language = hass.config.language[:2]
    for item in db.all():
        names = [item.scientific, *item.common.values(), *item.aliases]
        if wanted and any(wanted in n.casefold() for n in names):
            species.append(
                {
                    "source": "offline",
                    "id": item.id,
                    "label": item.label(language),
                    "scientific": item.scientific,
                    "common": item.common.get(language) or item.common["en"],
                }
            )
    return {"opb": available, "opb_failed": failed, "species": species}


def _area_of(entry: er.RegistryEntry | None, dev_reg: dr.DeviceRegistry) -> str | None:
    if entry is None:
        return None
    if entry.area_id:
        return entry.area_id
    device = dev_reg.async_get(entry.device_id) if entry.device_id else None
    return device.area_id if device else None


def sensor_candidates(
    hass: HomeAssistant, entry: ConfigEntry, area_id: str | None
) -> dict[str, list[dict[str, Any]]]:
    """Return, per role, sensors that fit, with their live values.

    The room's sensors come first; mirrors are left out; a soil sensor that
    another plant already has is marked.
    """
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    areas = ar.async_get(hass)
    mirrors = set(mirror_entities(hass))
    used = {
        sub.data.get(CONF_MOISTURE_SENSOR)
        for sub in entry.subentries.values()
        if sub.data.get(CONF_MOISTURE_SENSOR)
    }
    roles: dict[str, tuple[str, ...]] = {
        CONF_MOISTURE_SENSOR: SOIL_CLASSES,
        **{key: (device_class,) for key, device_class in SENSOR_DEVICE_CLASSES.items()},
    }
    ranked: dict[str, list[tuple[tuple[bool, int, str], dict[str, Any]]]] = {
        key: [] for key in roles
    }
    for state in hass.states.async_all("sensor"):
        if state.entity_id in mirrors:
            continue
        device_class = state.attributes.get("device_class")
        sensor_area = _area_of(ent_reg.async_get(state.entity_id), dev_reg)
        area = areas.async_get_area(sensor_area) if sensor_area else None
        name = str(state.attributes.get("friendly_name") or state.entity_id)
        for key, classes in roles.items():
            if device_class not in classes:
                continue
            # The plant's room first, then the better device class, then by name.
            rank = (
                bool(area_id) and sensor_area != area_id,
                classes.index(device_class),
                name.casefold(),
            )
            ranked[key].append(
                (
                    rank,
                    {
                        "entity_id": state.entity_id,
                        "name": name,
                        "state": state.state,
                        "unit": state.attributes.get("unit_of_measurement"),
                        "area": area.name if area else None,
                        "in_use": key == CONF_MOISTURE_SENSOR
                        and state.entity_id in used,
                    },
                )
            )
    return {
        key: [item for _, item in sorted(items, key=lambda pair: pair[0])][
            :MAX_CANDIDATES
        ]
        for key, items in ranked.items()
    }


def suggestions(
    hass: HomeAssistant, entry: ConfigEntry, moisture: str | None, area_id: str | None
) -> dict[str, Any]:
    """Return the dialog's suggestions and all candidates for the wizard."""
    return {
        "suggested": suggest_sensors(hass, moisture, area_id),
        "candidates": sensor_candidates(hass, entry, area_id),
    }
