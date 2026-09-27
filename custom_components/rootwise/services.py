"""Actions: rootwise.log_care, rootwise.snooze, rootwise.set_vacation."""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import (
    config_validation as cv,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.target import (
    TargetSelection,
    async_extract_referenced_entity_ids,
)
import voluptuous as vol

from .const import CARE_TYPES, DOMAIN

if TYPE_CHECKING:
    from .hub import PlantRuntime, RootwiseHub

SERVICE_LOG_CARE = "log_care"
SERVICE_SNOOZE = "snooze"
SERVICE_SET_VACATION = "set_vacation"

LOG_CARE_SCHEMA = vol.Schema(
    {
        **cv.ENTITY_SERVICE_FIELDS,
        vol.Required("care_type"): vol.In(CARE_TYPES),
        vol.Optional("note"): cv.string,
        vol.Optional("when"): cv.datetime,
    }
)
SNOOZE_SCHEMA = vol.Schema(
    {
        **cv.ENTITY_SERVICE_FIELDS,
        vol.Optional("days", default=1): vol.All(
            vol.Coerce(float), vol.Range(min=0.1, max=60)
        ),
    }
)
SET_VACATION_SCHEMA = vol.Schema(
    {vol.Required("enabled"): cv.boolean, vol.Optional("until"): cv.datetime}
)


def _hub(hass: HomeAssistant) -> RootwiseHub:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="not_loaded"
        )
    hub: RootwiseHub = entries[0].runtime_data
    return hub


def _plants(hass: HomeAssistant, call: ServiceCall) -> list[PlantRuntime]:
    """Resolve targeted devices/entities/areas to plants."""
    hub = _hub(hass)
    selected = async_extract_referenced_entity_ids(hass, TargetSelection(call.data))
    entry_id = hub.entry.entry_id
    plant_ids: set[str] = set()

    dev_reg = dr.async_get(hass)
    for device_id in selected.referenced_devices:
        device = dev_reg.async_get(device_id)
        if device and device.config_entry_id == entry_id and device.config_subentry_id:
            plant_ids.add(device.config_subentry_id)

    ent_reg = er.async_get(hass)
    for entity_id in selected.referenced | selected.indirectly_referenced:
        entity = ent_reg.async_get(entity_id)
        if entity and entity.config_entry_id == entry_id and entity.config_subentry_id:
            plant_ids.add(entity.config_subentry_id)

    plants = [hub.plants[pid] for pid in sorted(plant_ids) if pid in hub.plants]
    if not plants:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="no_plant_selected"
        )
    return plants


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register the actions once per Home Assistant instance."""

    async def log_care(call: ServiceCall) -> None:
        for plant in _plants(hass, call):
            plant.async_log_care(
                call.data["care_type"],
                source="service",
                when=call.data.get("when"),
                note=call.data.get("note"),
            )

    async def snooze(call: ServiceCall) -> None:
        for plant in _plants(hass, call):
            plant.async_snooze(timedelta(days=call.data["days"]))

    async def set_vacation(call: ServiceCall) -> None:
        _hub(hass).async_set_vacation(call.data["enabled"], call.data.get("until"))

    hass.services.async_register(DOMAIN, SERVICE_LOG_CARE, log_care, LOG_CARE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_SNOOZE, snooze, SNOOZE_SCHEMA)
    async_register_admin_service(
        hass, DOMAIN, SERVICE_SET_VACATION, set_vacation, SET_VACATION_SCHEMA
    )
