"""Diagnostics download (no secrets, no journal notes)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

if TYPE_CHECKING:
    from . import RootwiseConfigEntry

TO_REDACT = {"api_key", "plantnet_api_key", "notify_devices"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: RootwiseConfigEntry
) -> dict[str, Any]:
    """Return plant structure and current status."""
    hub = entry.runtime_data
    plants = []
    for plant_id, runtime in hub.plants.items():
        state = runtime.state
        plants.append(
            {
                "title": runtime.config.name,
                "data": dict(entry.subentries[plant_id].data),
                "species_known": runtime.species is not None,
                "status": state.status.value if state else None,
                "reasons": [r.code for r in state.reasons] if state else [],
                "needs_water": state.needs_water if state else None,
                "thresholds": runtime.thresholds(),
                "interval_days": runtime.interval_days(),
                "journal_entries": hub.storage.count_entries(plant_id),
            }
        )
    return {
        "options": async_redact_data(dict(entry.options), TO_REDACT),
        "vacation": hub.vacation,
        "status_counts": hub.status_counts(),
        "plants": plants,
    }
