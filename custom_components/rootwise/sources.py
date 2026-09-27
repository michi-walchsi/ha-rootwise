"""Recognize mirror sensors and find the real sensor behind them.

Plant Monitor (platform "plant") and Rootwise itself create sensors that only
copy another sensor. A plant should read the real one: mirrors add a delay, a
second history and break as soon as the mirroring integration is removed.
"""

from __future__ import annotations

from typing import Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

MIRROR_PLATFORMS: Final = ("plant", DOMAIN)
# Plant Monitor names its source "external_sensor", Rootwise "source".
_SOURCE_ATTRIBUTES: Final = ("external_sensor", "source")
_MAX_HOPS: Final = 3


@callback
def is_mirror(hass: HomeAssistant, entity_id: str) -> bool:
    """Return True if the sensor only mirrors another one."""
    entry = er.async_get(hass).async_get(entity_id)
    return (
        entry is not None
        and entry.domain == "sensor"
        and entry.platform in MIRROR_PLATFORMS
    )


@callback
def mirror_entities(hass: HomeAssistant) -> list[str]:
    """Return all mirror sensors, to keep them out of sensor pickers."""
    return sorted(
        entry.entity_id
        for entry in er.async_get(hass).entities.values()
        if entry.domain == "sensor" and entry.platform in MIRROR_PLATFORMS
    )


def _mirrored(hass: HomeAssistant, entity_id: str) -> str | None:
    state = hass.states.get(entity_id)
    if state is None:
        return None
    for attribute in _SOURCE_ATTRIBUTES:
        value = state.attributes.get(attribute)
        if isinstance(value, str) and value.startswith("sensor."):
            return value
    return None


@callback
def resolve(hass: HomeAssistant, entity_id: str) -> str | None:
    """Return the real sensor: itself, the one it mirrors, or None if unknown."""
    current = entity_id
    for _ in range(_MAX_HOPS):
        if not is_mirror(hass, current):
            # A mirrored sensor must exist; the plant's own choice may be offline.
            if current != entity_id and hass.states.get(current) is None:
                return None
            return current
        source = _mirrored(hass, current)
        if source is None:
            return None
        current = source
    return None
