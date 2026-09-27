"""Sensors: plant status, last watering, and the global count."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .engine.status import Status
from .entity import RootwiseHubEntity, RootwisePlantEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime, RootwiseHub


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add sensors for the hub and each plant."""
    hub = entry.runtime_data
    async_add_entities([PlantsNeedingWaterSensor(hub)])
    for plant_id, runtime in hub.plants.items():
        async_add_entities(
            [StatusSensor(runtime), LastWateredSensor(runtime)],
            config_subentry_id=plant_id,
        )


class StatusSensor(RootwisePlantEntity, SensorEntity):
    """Overall plant status with reason codes."""

    _attr_device_class = SensorDeviceClass.ENUM
    _unrecorded_attributes = frozenset({"reasons"})

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init the status sensor."""
        super().__init__(runtime, "status")
        self._attr_options = [s.value for s in Status]

    def _refresh(self) -> Hashable:
        state = self._runtime.state
        if state is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return None
        reasons = [{"code": r.code, **dict(r.params)} for r in state.reasons]
        self._attr_native_value = state.status.value
        self._attr_extra_state_attributes = {"reasons": reasons}
        return (state.status, tuple(r.code for r in state.reasons))


class LastWateredSensor(RootwisePlantEntity, SensorEntity):
    """Time of the last logged watering."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init the last-watered sensor."""
        super().__init__(runtime, "last_watered")

    def _refresh(self) -> Hashable:
        self._attr_native_value = self._runtime.last_watered
        return self._attr_native_value


class PlantsNeedingWaterSensor(RootwiseHubEntity, SensorEntity):
    """How many plants need water right now."""

    _unrecorded_attributes = frozenset({"plants"})

    def __init__(self, hub: RootwiseHub) -> None:
        """Init the counter."""
        super().__init__(hub, "plants_needing_water")

    def _refresh(self) -> Hashable:
        names = sorted(p.config.name for p in self._hub.plants_needing_water())
        self._attr_native_value = len(names)
        self._attr_extra_state_attributes = {"plants": names}
        return tuple(names)
