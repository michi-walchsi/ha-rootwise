"""Buttons: watered, fertilized, snooze one day."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CARE_FERTILIZED, CARE_WATERED
from .entity import RootwisePlantEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add buttons for each plant."""
    for plant_id, runtime in entry.runtime_data.plants.items():
        async_add_entities(
            [
                CareButton(runtime, CARE_WATERED),
                CareButton(runtime, CARE_FERTILIZED),
                SnoozeButton(runtime),
            ],
            config_subentry_id=plant_id,
        )


class _PlantButton(RootwisePlantEntity, ButtonEntity):
    def _refresh(self) -> Hashable:
        return None


class CareButton(_PlantButton):
    """Log a care action with one tap."""

    def __init__(self, runtime: PlantRuntime, care_type: str) -> None:
        """Init."""
        super().__init__(runtime, care_type)
        self._care_type = care_type

    async def async_press(self) -> None:
        """Log the care action."""
        self._runtime.async_log_care(self._care_type, source="button")


class SnoozeButton(_PlantButton):
    """Postpone 'needs water' by one day."""

    def __init__(self, runtime: PlantRuntime) -> None:
        """Init."""
        super().__init__(runtime, "snooze")

    async def async_press(self) -> None:
        """Snooze the plant."""
        self._runtime.async_snooze()
