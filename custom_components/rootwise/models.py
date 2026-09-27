"""Typed view of a plant subentry."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from homeassistant.config_entries import ConfigSubentry

from .const import (
    CONF_AREA,
    CONF_BATTERY_SENSOR,
    CONF_CONDUCTIVITY_SENSOR,
    CONF_DRAINAGE,
    CONF_HUMIDITY_SENSOR,
    CONF_ILLUMINANCE_SENSOR,
    CONF_LOCATION,
    CONF_MOISTURE_SENSOR,
    CONF_POT_DIAMETER,
    CONF_POT_MATERIAL,
    CONF_RANGES,
    CONF_SPECIES,
    CONF_SPECIES_INFO,
    CONF_TEMPERATURE_SENSOR,
    CONF_WINDOW,
)


@dataclass(frozen=True, slots=True)
class PlantConfig:
    """Structure of one plant (changes rarely, lives in the subentry)."""

    plant_id: str
    name: str
    species_id: str
    area_id: str | None
    moisture_sensor: str | None
    temperature_sensor: str | None
    humidity_sensor: str | None
    illuminance_sensor: str | None
    conductivity_sensor: str | None
    battery_sensor: str | None
    pot_diameter: float
    pot_material: str
    drainage: bool
    window: str
    location: str
    species_info: Mapping[str, Any] | None = None
    ranges: Mapping[str, Mapping[str, float | None]] = field(default_factory=dict)

    @classmethod
    def from_subentry(cls, subentry: ConfigSubentry) -> PlantConfig:
        """Build the config from a plant subentry."""
        return cls.from_data(subentry.subentry_id, subentry.title, subentry.data)

    @classmethod
    def from_data(
        cls, plant_id: str, name: str, data: Mapping[str, Any]
    ) -> PlantConfig:
        """Build the config from flattened subentry data."""
        return cls(
            plant_id=plant_id,
            name=name,
            species_id=str(data.get(CONF_SPECIES, "")),
            area_id=data.get(CONF_AREA) or None,
            moisture_sensor=data.get(CONF_MOISTURE_SENSOR) or None,
            temperature_sensor=data.get(CONF_TEMPERATURE_SENSOR) or None,
            humidity_sensor=data.get(CONF_HUMIDITY_SENSOR) or None,
            illuminance_sensor=data.get(CONF_ILLUMINANCE_SENSOR) or None,
            conductivity_sensor=data.get(CONF_CONDUCTIVITY_SENSOR) or None,
            battery_sensor=data.get(CONF_BATTERY_SENSOR) or None,
            pot_diameter=float(data.get(CONF_POT_DIAMETER, 18)),
            pot_material=str(data.get(CONF_POT_MATERIAL, "plastic")),
            drainage=bool(data.get(CONF_DRAINAGE, True)),
            window=str(data.get(CONF_WINDOW, "none")),
            location=str(data.get(CONF_LOCATION, "indoor")),
            species_info=data.get(CONF_SPECIES_INFO) or None,
            ranges=data.get(CONF_RANGES) or {},
        )
