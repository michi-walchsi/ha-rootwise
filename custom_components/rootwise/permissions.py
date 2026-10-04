"""Who may log care for a plant: admins, and users who may press its buttons.

Read-only users can look but not log; the same rule covers photos.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.auth.models import User
from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import CARE_WATERED

if TYPE_CHECKING:
    from .hub import RootwiseHub


def plant_entity_ids(
    hass: HomeAssistant, hub: RootwiseHub, plant_id: str
) -> dict[str, str]:
    """Return {key: entity_id} of a plant's entities."""
    prefix = f"{plant_id}_"
    return {
        entity.unique_id.removeprefix(prefix): entity.entity_id
        for entity in er.async_entries_for_config_entry(
            er.async_get(hass), hub.entry.entry_id
        )
        if entity.config_subentry_id == plant_id and entity.unique_id.startswith(prefix)
    }


def may_log(hass: HomeAssistant, user: User, hub: RootwiseHub, plant_id: str) -> bool:
    """Return whether the user may log care (or add photos) for the plant."""
    if user.is_admin:
        return True
    entity_id = plant_entity_ids(hass, hub, plant_id).get(CARE_WATERED)
    return entity_id is not None and user.permissions.check_entity(
        entity_id, POLICY_CONTROL
    )
