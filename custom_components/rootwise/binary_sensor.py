"""Binary sensors: needs water, problem."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .entity import RootwisePlantEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add binary sensors for each plant."""
    for plant_id, runtime in entry.runtime_data.plants.items():
        async_add_entities(
            [NeedsWaterBinarySensor(runtime), ProblemBinarySensor(runtime)],
            config_subentry_id=plant_id,
        )


class NeedsWaterBinarySensor(RootwisePlantEntity, BinarySensorEntity):
    """On when the plant should be watered (and is not snoozed)."""

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init."""
        super().__init__(runtime, "needs_water")

    def _refresh(self) -> Hashable:
        state = self._runtime.state
        self._attr_is_on = bool(state and state.needs_water)
        return self._attr_is_on


class ProblemBinarySensor(RootwisePlantEntity, BinarySensorEntity):
    """On when the plant is too wet or its sensor is offline."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init."""
        super().__init__(runtime, "problem")

    def _refresh(self) -> Hashable:
        state = self._runtime.state
        self._attr_is_on = bool(state and state.problem)
        return self._attr_is_on
