"""Sensors: plant status, measurements, last watering, and the global count."""

from __future__ import annotations

from collections.abc import Hashable
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.const import EntityCategory
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from .const import MEASUREMENTS, MIRROR_THROTTLE
from .engine.measure import round_value
from .engine.status import Status
from .entity import RootwiseHubEntity, RootwisePlantEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime, RootwiseHub

DEVICE_CLASSES = {key: SensorDeviceClass(dc) for key, _, dc in MEASUREMENTS}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add sensors for the hub and each plant."""
    hub = entry.runtime_data
    async_add_entities([PlantsNeedingWaterSensor(hub)])
    for plant_id, runtime in hub.plants.items():
        entities: list[SensorEntity] = [
            StatusSensor(runtime),
            LastWateredSensor(runtime),
        ]
        entities += [MeasurementSensor(runtime, key) for key in runtime.sources()]
        async_add_entities(entities, config_subentry_id=plant_id)


class StatusSensor(RootwisePlantEntity, SensorEntity):
    """Overall plant status with reason codes and hints."""

    _attr_device_class = SensorDeviceClass.ENUM
    _unrecorded_attributes = frozenset({"reasons"})

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init the status sensor."""
        super().__init__(runtime, "status")
        self._attr_options = [s.value for s in Status]
        self._attr_entity_picture = runtime.image_url

    def _refresh(self) -> Hashable:
        state = self._runtime.state
        if state is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            return None
        reasons = [
            {"code": r.code, **dict(r.params)}
            for r in (*state.reasons, *self._runtime.hints)
        ]
        attributes: dict[str, Any] = {"reasons": reasons}
        if state.moisture_level is not None:
            attributes["moisture_level"] = state.moisture_level.value
        self._attr_native_value = state.status.value
        self._attr_extra_state_attributes = attributes
        return (
            state.status,
            state.moisture_level,
            tuple(r["code"] for r in reasons),
        )


class MeasurementSensor(RootwisePlantEntity, SensorEntity):
    """Mirror of a source sensor with the plant's target range and a rating.

    No state_class: the source already keeps long-term statistics. Value-only
    changes are written at most once per minute to spare the recorder.
    """

    _unrecorded_attributes = frozenset({"min", "max", "range_source", "source"})

    def __init__(self, runtime: PlantRuntime, key: str) -> None:
        """Init the mirror for one measurement."""
        super().__init__(runtime, key)
        self._key = key
        self._attr_device_class = DEVICE_CLASSES[key]
        if key == "battery":
            self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._last_write: datetime | None = None
        self._written_flags: Hashable = None
        self._pending: CALLBACK_TYPE | None = None

    def _refresh(self) -> Hashable:
        measurement = self._runtime.measurements.get(self._key)
        if measurement is None:
            self._attr_available = False
            return None
        value = measurement.value
        self._attr_available = value is not None
        self._attr_native_value = (
            round_value(self._key, value) if value is not None else None
        )
        self._attr_native_unit_of_measurement = measurement.unit
        attributes: dict[str, Any] = {"source": measurement.source}
        if measurement.rating is not None:
            attributes["rating"] = measurement.rating.value
        if measurement.level is not None:
            attributes["level"] = measurement.level.value
        if measurement.target is not None:
            attributes["min"] = measurement.target.min
            attributes["max"] = measurement.target.max
            attributes["range_source"] = measurement.range_source
        self._attr_extra_state_attributes = attributes
        return (self._attr_native_value, self._flags())

    def _flags(self) -> Hashable:
        """Things that are written immediately when they change."""
        attributes = self._attr_extra_state_attributes or {}
        return (
            self._attr_available,
            attributes.get("rating"),
            attributes.get("level"),
            attributes.get("min"),
            attributes.get("max"),
            self._attr_native_unit_of_measurement,
        )

    @callback
    def _handle_update(self) -> None:
        signature = self._refresh()
        if signature == self._last_signature:
            return
        now = dt_util.utcnow()
        urgent = self._flags() != self._written_flags
        last = self._last_write
        if urgent or last is None or now - last >= MIRROR_THROTTLE:
            self._write(signature, now)
        elif self._pending is None:
            wait = MIRROR_THROTTLE - (now - last)
            self._pending = async_call_later(self.hass, wait, self._flush)

    @callback
    def _flush(self, _now: datetime) -> None:
        self._pending = None
        signature = self._refresh()
        if signature != self._last_signature:
            self._write(signature, dt_util.utcnow())

    def _write(self, signature: Hashable, now: datetime) -> None:
        if self._pending is not None:
            self._pending()
            self._pending = None
        self._last_signature = signature
        self._last_write = now
        self._written_flags = self._flags()
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Remember the first state as written."""
        await super().async_added_to_hass()
        self._last_write = dt_util.utcnow()
        self._written_flags = self._flags()

    async def async_will_remove_from_hass(self) -> None:
        """Cancel a pending write."""
        if self._pending is not None:
            self._pending()
            self._pending = None


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
