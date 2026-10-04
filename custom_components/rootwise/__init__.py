"""Rootwise: houseplant care with real sensor data."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    config_validation as cv,
    entity_registry as er,
    issue_registry as ir,
)
from homeassistant.helpers.typing import ConfigType

from .config_flow import async_get_species_db
from .const import DOMAIN
from .frontend import async_register_cards, async_register_panel, async_remove_panel
from .hub import RootwiseHub
from .photos import async_register_views
from .repairs import async_check_sources
from .services import async_setup_services
from .store import RootwiseStorage
from .websocket import async_setup_websocket

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.CALENDAR,
    Platform.IMAGE,
    Platform.NUMBER,
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.TODO,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type RootwiseConfigEntry = ConfigEntry[RootwiseHub]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the actions, the card API, the photo views and the cards."""
    async_setup_services(hass)
    async_setup_websocket(hass)
    async_register_views(hass)
    await async_register_cards(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: RootwiseConfigEntry) -> bool:
    """Load plants, create entities, start listening."""
    storage = RootwiseStorage(hass)
    await storage.async_load()
    hub = RootwiseHub(hass, entry, storage, await async_get_species_db(hass))
    entry.runtime_data = hub
    _async_remove_orphans(hass, entry, hub)
    async_check_sources(hass, entry)
    # Evaluate before the entities exist so they start with a real state.
    for plant in hub.plants.values():
        plant.async_evaluate()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    hub.async_start()
    await async_register_panel(hass)
    # Plant added, changed or removed (or options changed): rebuild everything.
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: RootwiseConfigEntry) -> bool:
    """Unload platforms and flush data."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_shutdown()
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: RootwiseConfigEntry) -> None:
    """Drop the panel and open repair issues together with the entry."""
    async_remove_panel(hass)
    for domain, issue_id in list(ir.async_get(hass).issues):
        if domain == DOMAIN:
            ir.async_delete_issue(hass, DOMAIN, issue_id)


async def _async_reload(hass: HomeAssistant, entry: RootwiseConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


def _async_remove_orphans(
    hass: HomeAssistant, entry: RootwiseConfigEntry, hub: RootwiseHub
) -> None:
    """Drop entities left over from sensors or options that no longer exist."""
    expected = hub.expected_unique_ids()
    ent_reg = er.async_get(hass)
    for entity in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
        if entity.unique_id not in expected:
            ent_reg.async_remove(entity.entity_id)
