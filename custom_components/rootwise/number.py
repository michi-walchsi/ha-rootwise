"""Numbers (configuration): moisture thresholds, watering interval."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import PERCENTAGE, EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .entity import RootwisePlantEntity
from .hub import THRESHOLD_HIGH, THRESHOLD_LOW

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Thresholds for plants with a sensor, an interval for plants without."""
    for plant_id, runtime in entry.runtime_data.plants.items():
        if runtime.config.moisture_sensor:
            entities: list[NumberEntity] = [
                ThresholdNumber(runtime, "dry_threshold", THRESHOLD_LOW),
                ThresholdNumber(runtime, "wet_threshold", THRESHOLD_HIGH),
            ]
        else:
            entities = [IntervalNumber(runtime)]
        async_add_entities(entities, config_subentry_id=plant_id)


class ThresholdNumber(RootwisePlantEntity, NumberEntity):
    """Dry or wet threshold on the sensor's scale."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_mode = NumberMode.BOX
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = PERCENTAGE

    def __init__(self, runtime: PlantRuntime, key: str, which: str) -> None:
        """Init."""
        super().__init__(runtime, key)
        self._which = which

    def _refresh(self) -> Hashable:
        low, high = self._runtime.thresholds()
        self._attr_native_value = low if self._which == THRESHOLD_LOW else high
        return self._attr_native_value

    async def async_set_native_value(self, value: float) -> None:
        """Store the new threshold."""
        self._runtime.async_set_threshold(self._which, value)


class IntervalNumber(RootwisePlantEntity, NumberEntity):
    """Watering interval in days for plants without a moisture sensor."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_mode = NumberMode.BOX
    _attr_native_min_value = 1
    _attr_native_max_value = 60
    _attr_native_step = 1
    _attr_native_unit_of_measurement = UnitOfTime.DAYS

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init."""
        super().__init__(runtime, "watering_interval")

    def _refresh(self) -> Hashable:
        self._attr_native_value = self._runtime.interval_days()
        return self._attr_native_value

    async def async_set_native_value(self, value: float) -> None:
        """Store the new interval."""
        self._runtime.async_set_interval(value)
