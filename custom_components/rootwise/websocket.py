"""WebSocket API for the Rootwise cards.

Reading is open to every user. Logging needs control permission on the plant
(read-only users can't); deleting is for admins, or for the user who logged
the entry.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import websocket_command
from homeassistant.components.websocket_api.messages import event_message
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    config_validation as cv,
    device_registry as dr,
)
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .const import (
    CARE_FERTILIZED,
    CARE_SENSOR_MOVED,
    CARE_TYPES,
    CARE_WATERED,
    DOMAIN,
    SIGNAL_UPDATE,
    SOURCE_AUTO,
)
from .engine.amount import watering_amount
from .engine.chart import resample, step_for
from .engine.measure import round_value
from .hub import FutureTimeError, species_range
from .permissions import may_log, plant_entity_ids

if TYPE_CHECKING:
    from .hub import PlantRuntime, RootwiseHub

RECENT = 5
# Climate values whose species range the plant page shows, with or without sensor.
CARE_RANGES = ("temperature", "air_humidity", "illuminance")
# Journal entries the chart marks.
CHART_EVENTS = (CARE_WATERED, CARE_FERTILIZED, CARE_SENSOR_MOVED)


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register the commands once per Home Assistant instance."""
    for command in (
        ws_plants,
        ws_subscribe,
        ws_log_care,
        ws_delete_care,
        ws_journal,
        ws_reset_thresholds,
        ws_history,
        ws_photos,
        ws_set_cover,
    ):
        async_register_command(hass, command)


def _hub(hass: HomeAssistant) -> RootwiseHub | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


def _device(
    hass: HomeAssistant, hub: RootwiseHub, plant_id: str
) -> dict[str, str | None]:
    """Return the plant device's id and its area."""
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, plant_id), hub.entry.entry_id
    )
    area_id = device.area_id if device else None
    area = ar.async_get(hass).async_get_area(area_id) if area_id else None
    return {
        "device_id": device.id if device else None,
        "area_id": area_id,
        "area": area.name if area else None,
    }


def _species(hass: HomeAssistant, plant: PlantRuntime) -> dict[str, Any]:
    info = plant.config.species_info or {}
    species = plant.species
    common = info.get("common")
    if not common and species is not None:
        common = species.common.get(hass.config.language[:2]) or species.common["en"]
    ranges = {}
    for key in CARE_RANGES:
        target, _ = species_range(key, plant.config.species_info, species)
        if target is not None:
            ranges[key] = {"min": target.min, "max": target.max}
    return {
        "scientific": info.get("scientific")
        or (species.scientific if species else None),
        "common": common,
        "image_url": plant.image_url,
        "source": info.get("source") or ("offline" if species else None),
        "watering_style": species.watering_style if species else None,
        "fertilize_weeks": species.fertilize_weeks if species else None,
        "toxicity": {
            **species.toxicity,
            "note": species.toxicity_note,
            "source": species.toxicity_source,
        }
        if species
        else None,
        "ranges": ranges,
        # Daily light integral the species wants, mol/m² per day.
        "dli": {"min": species.dli_min, "max": species.dli_max} if species else None,
    }


def _cover(plant: PlantRuntime) -> dict[str, Any] | None:
    cover = plant.cover_photo
    if cover is None:
        return None
    data = cover["data"]
    return {
        "id": data["photo_id"],
        "ts": cover["ts"],
        "width": data["width"],
        "height": data["height"],
    }


def _pot(plant: PlantRuntime) -> dict[str, Any]:
    config = plant.config
    style = plant.species.watering_style if plant.species else ""
    amount = watering_amount(config.pot_diameter, style)
    return {
        "diameter": config.pot_diameter,
        "material": config.pot_material,
        "drainage": config.drainage,
        "window": config.window,
        "location": config.location,
        "amount": list(amount) if amount else None,
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
    return {
        "id": plant_id,
        "name": plant.config.name,
        **_device(hass, hub, plant_id),
        "entity_ids": plant_entity_ids(hass, hub, plant_id),
        "status": state.status.value if state else None,
        "moisture_level": state.moisture_level.value
        if state and state.moisture_level
        else None,
        "needs_water": bool(state and state.needs_water),
        "reasons": [{"code": r.code, **dict(r.params)} for r in reasons],
        "snoozed_until": snoozed.isoformat() if snoozed else None,
        "last_watered": watered.isoformat() if watered else None,
        "species": _species(hass, plant),
        "pot": _pot(plant),
        "photo": _cover(plant),
        "measurements": _measurements(plant),
        "next_watering": _next_watering(plant),
        "thresholds": _thresholds(plant),
        "recent": hub.storage.entries(plant_id, RECENT),
    }


def _next_watering(plant: PlantRuntime) -> dict[str, Any] | None:
    result = plant.next_watering()
    if result is None:
        return None
    return {
        key: value.isoformat() if isinstance(value, datetime) else value
        for key, value in result.items()
    }


def _thresholds(plant: PlantRuntime) -> dict[str, Any] | None:
    if not plant.config.moisture_sensor:
        return None
    low, high = plant.thresholds()
    learned = plant.tracker.learned
    return {
        "low": low,
        "high": high,
        "source": plant.threshold_source(),
        "learned": list(learned) if learned else None,
        "waterings": len(plant.tracker.waterings),
    }


def _history(
    hub: RootwiseHub, plant: PlantRuntime, days: int, now: datetime
) -> dict[str, Any]:
    span = timedelta(days=days)
    step = step_for(span)
    # Bins on whole hours: "02:00-04:00" reads better than "02:22-04:22".
    seconds = step.total_seconds()
    start = dt_util.utc_from_timestamp((now - span).timestamp() // seconds * seconds)
    sensor = plant.config.moisture_sensor
    points = resample(plant.tracker.buckets(), start, now, step) if sensor else []
    forecast = plant.tracker.forecast if sensor else None
    return {
        "start": start.isoformat(),
        "end": now.isoformat(),
        "step": int(step.total_seconds()),
        # [epoch ms, mean, min, max]: compact, a 30-day chart has 180 of them.
        "points": [
            [
                int(p.at.timestamp() * 1000),
                round(p.mean, 1),
                round(p.low, 1),
                round(p.high, 1),
            ]
            for p in points
        ],
        "thresholds": _thresholds(plant),
        "forecast": {
            "due": forecast.due.isoformat(),
            "earliest": forecast.earliest.isoformat(),
            "latest": forecast.latest.isoformat(),
            "level": round(forecast.level, 1),
            "rate": round(forecast.rate, 2),
            "confidence": forecast.confidence.value,
        }
        if forecast
        else None,
        "events": [
            {key: e[key] for key in ("id", "ts", "type", "source", "data") if key in e}
            for e in hub.storage.entries_between(plant.config.plant_id, start, now)
            if e["type"] in CHART_EVENTS
        ],
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
    return may_log(hass, connection.user, hub, plant_id)


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
    """Delete a journal entry: admins any, others their own or a detected one."""
    hub = _hub(hass)
    entry = hub.storage.get_entry(msg["entry_id"]) if hub else None
    plant = hub.plants.get(entry["plant_id"]) if hub and entry else None
    if hub is None or entry is None or plant is None:
        connection.send_error(msg["id"], "not_found", "Unknown entry")
        return
    user = connection.user
    # A detected watering belongs to no one: whoever may log may reject it.
    mine = entry.get("user_id") == user.id or entry["source"] == SOURCE_AUTO
    allowed = mine and _may_log(hass, connection, hub, plant.config.plant_id)
    if not (user.is_admin or allowed):
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


@websocket_command(
    {vol.Required("type"): "rootwise/thresholds/reset", vol.Required("plant_id"): str}
)
@callback
def ws_reset_thresholds(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Drop own thresholds: learned ones (or species defaults) apply again."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    hub, plant = found
    if not _may_log(hass, connection, hub, plant.config.plant_id):
        connection.send_error(msg["id"], "unauthorized", "Not allowed")
        return
    plant.async_reset_thresholds()
    connection.send_result(msg["id"])


@websocket_command(
    {
        vol.Required("type"): "rootwise/plant/history",
        vol.Required("plant_id"): str,
        vol.Optional("days", default=14): vol.All(int, vol.Range(min=1, max=60)),
    }
)
@callback
def ws_history(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the soil moisture of the last days, with care and forecast."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    hub, plant = found
    connection.send_result(
        msg["id"], _history(hub, plant, msg["days"], dt_util.utcnow())
    )


@websocket_command(
    {vol.Required("type"): "rootwise/photos/list", vol.Required("plant_id"): str}
)
@callback
def ws_photos(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return a plant's photos, newest first, and the cover photo."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    _, plant = found
    cover = plant.cover_photo
    connection.send_result(
        msg["id"],
        {
            "photos": [
                {
                    "entry_id": e["id"],
                    "photo_id": e["data"]["photo_id"],
                    "ts": e["ts"],
                    "width": e["data"]["width"],
                    "height": e["data"]["height"],
                    "note": e.get("note"),
                    "user_id": e.get("user_id"),
                }
                for e in plant.photos()
            ],
            "cover": cover["data"]["photo_id"] if cover else None,
        },
    )


@websocket_command(
    {
        vol.Required("type"): "rootwise/photos/cover",
        vol.Required("plant_id"): str,
        vol.Required("photo_id"): vol.Any(None, str),
    }
)
@callback
def ws_set_cover(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Choose the cover photo, or None for the newest."""
    if (found := _plant_or_error(hass, connection, msg)) is None:
        return
    hub, plant = found
    if not _may_log(hass, connection, hub, plant.config.plant_id):
        connection.send_error(msg["id"], "unauthorized", "Not allowed")
        return
    photo_id = msg["photo_id"]
    if photo_id is not None and plant.photo_entry(photo_id) is None:
        connection.send_error(msg["id"], "not_found", "Unknown photo")
        return
    plant.async_set_cover(photo_id)
    connection.send_result(msg["id"])
