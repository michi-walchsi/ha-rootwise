"""Base entities with a write guard (only write state when it changed)."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.core import callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN

if TYPE_CHECKING:
    from .hub import PlantRuntime, RootwiseHub


class _GuardedEntity(Entity):
    """Writes its state only if the value signature changed (SD card)."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _last_signature: Hashable = None

    def _refresh(self) -> Hashable:
        """Update _attr_* values and return a signature of what is shown."""
        raise NotImplementedError

    @callback
    def _handle_update(self) -> None:
        signature = self._refresh()
        if signature != self._last_signature:
            self._last_signature = signature
            self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Compute the first state."""
        self._last_signature = self._refresh()


class RootwisePlantEntity(_GuardedEntity):
    """An entity that belongs to one plant device."""

    def __init__(self, runtime: PlantRuntime, key: str) -> None:
        """Set identity and device."""
        self._runtime = runtime
        config = runtime.config
        self._attr_translation_key = key
        self._attr_unique_id = f"{config.plant_id}_{key}"
        area_name = None
        if config.area_id and (
            area := ar.async_get(runtime.hass).async_get_area(config.area_id)
        ):
            area_name = area.name
        language = runtime.hass.config.language
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config.plant_id)},
            name=config.name,
            manufacturer="Rootwise",
            model=runtime.species.label(language) if runtime.species else None,
            suggested_area=area_name,
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to plant updates."""
        await super().async_added_to_hass()
        self.async_on_remove(self._runtime.add_listener(self._handle_update))


class RootwiseHubEntity(_GuardedEntity):
    """An entity on the global Rootwise device."""

    def __init__(self, hub: RootwiseHub, key: str) -> None:
        """Set identity and hub device."""
        self._hub = hub
        self._attr_translation_key = key
        self._attr_unique_id = f"{hub.entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, hub.entry.entry_id)},
            name="Rootwise",
            manufacturer="Rootwise",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to hub updates."""
        await super().async_added_to_hass()
        self.async_on_remove(self._hub.add_listener(self._handle_update))
