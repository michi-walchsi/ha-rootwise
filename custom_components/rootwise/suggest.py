"""Suggest a plant's further sensors from its soil sensor's device and its room."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import (
    CONF_BATTERY_SENSOR,
    CONF_CONDUCTIVITY_SENSOR,
    CONF_HUMIDITY_SENSOR,
    CONF_ILLUMINANCE_SENSOR,
    CONF_TEMPERATURE_SENSOR,
    SENSOR_DEVICE_CLASSES,
)

# Where to look first: the soil sensor's own device, then the room.
_FROM_DEVICE = (
    CONF_TEMPERATURE_SENSOR,
    CONF_ILLUMINANCE_SENSOR,
    CONF_CONDUCTIVITY_SENSOR,
    CONF_BATTERY_SENSOR,
)
_FROM_ROOM = (CONF_TEMPERATURE_SENSOR, CONF_HUMIDITY_SENSOR, CONF_ILLUMINANCE_SENSOR)


def _device_class(entry: er.RegistryEntry) -> str | None:
    return entry.device_class or entry.original_device_class


def _usable(entry: er.RegistryEntry) -> bool:
    return entry.domain == "sensor" and entry.disabled_by is None


def _room_entities(
    ent_reg: er.EntityRegistry, dev_reg: dr.DeviceRegistry, area_id: str
) -> list[er.RegistryEntry]:
    entries = list(er.async_entries_for_area(ent_reg, area_id))
    for device in dr.async_entries_for_area(dev_reg, area_id):
        entries.extend(
            e
            for e in er.async_entries_for_device(ent_reg, device.id)
            if e.area_id is None
        )
    return entries


def suggest_sensors(
    hass: HomeAssistant, moisture_sensor: str | None, area_id: str | None
) -> dict[str, str]:
    """Return {field: entity_id} for sensors that fit the plant."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)

    own: list[er.RegistryEntry] = []
    soil_device = None
    if moisture_sensor and (soil := ent_reg.async_get(moisture_sensor)):
        soil_device = soil.device_id
        if soil_device:
            own = [
                e
                for e in er.async_entries_for_device(ent_reg, soil_device)
                if e.entity_id != moisture_sensor and _usable(e)
            ]
    room = (
        [
            e
            for e in _room_entities(ent_reg, dev_reg, area_id)
            if _usable(e)
            and e.entity_id != moisture_sensor
            # A soil sensor's own humidity-like values are not room climate.
            and e.device_id != soil_device
        ]
        if area_id
        else []
    )

    result: dict[str, str] = {}
    for key, device_class in SENSOR_DEVICE_CLASSES.items():
        candidates = []
        if key in _FROM_DEVICE:
            candidates += [e for e in own if _device_class(e) == device_class]
        if key in _FROM_ROOM:
            candidates += [e for e in room if _device_class(e) == device_class]
        if candidates:
            result[key] = candidates[0].entity_id
    return result
