"""Vacation mode switch."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING, Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .entity import RootwiseHubEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import RootwiseHub


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the vacation switch."""
    async_add_entities([VacationSwitch(entry.runtime_data)])


class VacationSwitch(RootwiseHubEntity, SwitchEntity):
    """While on, no watering to-dos (reminders follow in phase 2)."""

    def __init__(self, hub: RootwiseHub) -> None:
        """Init."""
        super().__init__(hub, "vacation_mode")

    def _refresh(self) -> Hashable:
        self._attr_is_on = self._hub.vacation
        return self._attr_is_on

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Start vacation mode."""
        self._hub.async_set_vacation(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """End vacation mode."""
        self._hub.async_set_vacation(False)
