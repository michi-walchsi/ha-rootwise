"""WebSocket API for the Rootwise cards.

Reading is open to every user. Logging needs control permission on the plant
(read-only users can't); deleting is for admins, or for the user who logged
the entry.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import websocket_command
from homeassistant.components.websocket_api.messages import event_message
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    config_validation as cv,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.dispatcher import async_dispatcher_connect
import voluptuous as vol

from .const import CARE_TYPES, CARE_WATERED, DOMAIN, SIGNAL_UPDATE
from .engine.measure import round_value
from .hub import FutureTimeError

if TYPE_CHECKING:
    from .hub import PlantRuntime, RootwiseHub

RECENT = 5


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register the commands once per Home Assistant instance."""
    for command in (
        ws_plants,
        ws_subscribe,
        ws_log_care,
        ws_delete_care,
        ws_journal,
    ):
        async_register_command(hass, command)


def _hub(hass: HomeAssistant) -> RootwiseHub | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


def _entity_ids(hass: HomeAssistant, hub: RootwiseHub, plant_id: str) -> dict[str, str]:
    prefix = f"{plant_id}_"
    return {
        entity.unique_id.removeprefix(prefix): entity.entity_id
        for entity in er.async_entries_for_config_entry(
            er.async_get(hass), hub.entry.entry_id
        )
        if entity.config_subentry_id == plant_id and entity.unique_id.startswith(prefix)
    }


def _device(
    hass: HomeAssistant, hub: RootwiseHub, plant_id: str
) -> tuple[str | None, str | None]:
    """Return the plant device's id and its area name."""
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, plant_id), hub.entry.entry_id
    )
    if device is None:
        return None, None
    area = ar.async_get(hass).async_get_area(device.area_id) if device.area_id else None
    return device.id, area.name if area else None


def _species(hass: HomeAssistant, plant: PlantRuntime) -> dict[str, Any]:
    info = plant.config.species_info or {}
    species = plant.species
    common = info.get("common")
    if not common and species is not None:
        common = species.common.get(hass.config.language[:2]) or species.common["en"]
    return {
        "scientific": info.get("scientific")
        or (species.scientific if species else None),
        "common": common,
        "image_url": plant.image_url,
        "source": info.get("source") or ("offline" if species else None),
    }


def _measurements(plant: PlantRuntime) -> dict[str, dict[str, Any]]:
    result = {}
    for key, reading in plant.measurements.items():
        target = reading.target
        result[key] = {
            "value": round_value(key, reading.value)
            if reading.value is not None
            else None,
            "unit": reading.unit,
            "min": target.min if target else None,
            "max": target.max if target else None,
            "rating": reading.rating.value if reading.rating else None,
            "level": reading.level.value if reading.level else None,
            "range_source": reading.range_source,
            "source": reading.source,
        }
    return result


def _plant(
    hass: HomeAssistant, hub: RootwiseHub, plant: PlantRuntime
) -> dict[str, Any]:
    state = plant.state
    plant_id = plant.config.plant_id
    reasons = (*state.reasons, *plant.hints) if state else ()
    snoozed = plant.snoozed_until
    watered = plant.last_watered
    device_id, area = _device(hass, hub, plant_id)
    return {
        "id": plant_id,
        "name": plant.config.name,
        "device_id": device_id,
        "area": area,
        "entity_ids": _entity_ids(hass, hub, plant_id),
        "status": state.status.value if state else None,
        "moisture_level": state.moisture_level.value
        if state and state.moisture_level
        else None,
        "needs_water": bool(state and state.needs_water),
        "reasons": [{"code": r.code, **dict(r.params)} for r in reasons],
        "snoozed_until": snoozed.isoformat() if snoozed else None,
        "last_watered": watered.isoformat() if watered else None,
        "species": _species(hass, plant),
        "measurements": _measurements(plant),
        "recent": hub.storage.entries(plant_id, RECENT),
    }


def plants_payload(hass: HomeAssistant, hub: RootwiseHub | None) -> dict[str, Any]:
    """Return everything the cards show, for all plants."""
    if hub is None:
        return {"loaded": False, "vacation": False, "plants": []}
    plants = sorted(hub.plants.values(), key=lambda p: p.config.name.casefold())
    return {
        "loaded": True,
        "vacation": hub.vacation,
        "plants": [_plant(hass, hub, p) for p in plants],
    }


@websocket_command({vol.Required("type"): "rootwise/plants"})
@callback
def ws_plants(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return all plants once."""
    connection.send_result(msg["id"], plants_payload(hass, _hub(hass)))


@websocket_command({vol.Required("type"): "rootwise/plants/subscribe"})
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Push all plants now and whenever something changes."""
    last: list[dict[str, Any] | None] = [None]

    @callback
    def push(hub: RootwiseHub | None) -> None:
        # The hub comes with the signal: while it starts, its entry is not
        # "loaded" yet.
        payload = plants_payload(hass, hub)
        if payload != last[0]:
            last[0] = payload
            connection.send_message(event_message(msg["id"], payload))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, SIGNAL_UPDATE, push
    )
    connection.send_result(msg["id"])
    push(_hub(hass))


def _plant_or_error(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> tuple[RootwiseHub, PlantRuntime] | None:
    hub = _hub(hass)
    plant = hub.plants.get(msg["plant_id"]) if hub else None
    if hub is None or plant is None:
        connection.send_error(msg["id"], "not_found", "Unknown plant")
        return None
    return hub, plant


def _may_log(
    hass: HomeAssistant,
    connection: ActiveConnection,
    hub: RootwiseHub,
    plant_id: str,
) -> bool:
    user = connection.user
    if user.is_admin:
        return True
    entity_id = _entity_ids(hass, hub, plant_id).get(CARE_WATERED)
    return entity_id is not None and user.permissions.check_entity(
        entity_id, POLICY_CONTROL
    )


@websocket_command(
    {
        vol.Required("type"): "rootwise/care/log",
        vol.Required("plant_id"): str,
        vol.Required("care_type"): vol.In(CARE_TYPES),
        vol.Optional("when"): cv.datetime,
        vol.Optional("note"): vol.All(str, vol.Length(max=500)),
    }
)
@callback
def ws_log_care(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Log care, optionally for an earlier time ('watered yesterday')."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    hub, plant = found
    if not _may_log(hass, connection, hub, plant.config.plant_id):
        connection.send_error(msg["id"], "unauthorized", "Not allowed")
        return
    try:
        entry = plant.async_log_care(
            msg["care_type"],
            source="card",
            when=msg.get("when"),
            note=msg.get("note"),
            user_id=connection.user.id,
        )
    except FutureTimeError:
        connection.send_error(msg["id"], "when_in_future", "Time is in the future")
        return
    connection.send_result(msg["id"], {"entry": entry})


@websocket_command(
    {vol.Required("type"): "rootwise/care/delete", vol.Required("entry_id"): str}
)
@callback
def ws_delete_care(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Delete a journal entry: admins any, others only their own."""
    hub = _hub(hass)
    entry = hub.storage.get_entry(msg["entry_id"]) if hub else None
    plant = hub.plants.get(entry["plant_id"]) if hub and entry else None
    if hub is None or entry is None or plant is None:
        connection.send_error(msg["id"], "not_found", "Unknown entry")
        return
    user = connection.user
    own = entry.get("user_id") == user.id and _may_log(
        hass, connection, hub, plant.config.plant_id
    )
    if not (user.is_admin or own):
        connection.send_error(msg["id"], "unauthorized", "Not allowed")
        return
    plant.async_delete_entry(entry["id"])
    connection.send_result(msg["id"])


@websocket_command(
    {
        vol.Required("type"): "rootwise/journal",
        vol.Required("plant_id"): str,
        vol.Optional("limit", default=20): vol.All(int, vol.Range(min=1, max=1000)),
    }
)
@callback
def ws_journal(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return a plant's journal, newest first."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    hub, plant = found
    connection.send_result(
        msg["id"],
        {"entries": hub.storage.entries(plant.config.plant_id, msg["limit"])},
    )
