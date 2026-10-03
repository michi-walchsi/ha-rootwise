"""Push notifications to the companion app.

- Daily digest at the chosen time: who needs water today, with
  "Watered" and "+1 day" buttons.
- "Watering detected" right after a detection, with "That wasn't me".
- Critical warnings (too wet for days, very dry) at once, even in quiet
  hours or on vacation; at most every 12 hours per plant.

Buttons answer through the app's mobile_app_notification_action event. Any
registered phone can fire that event, so each button carries a one-time code
and only users whose phone is a chosen target may use it.
"""

from __future__ import annotations

from datetime import datetime, time, timedelta
import logging
import secrets
from typing import TYPE_CHECKING, Any, Final

from homeassistant.const import Platform
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_track_time_change
from homeassistant.util import dt as dt_util, slugify

from .const import (
    CARE_WATERED,
    CONF_DIGEST_TIME,
    CONF_NOTIFY_DETECTED,
    CONF_NOTIFY_DEVICES,
    CONF_QUIET_END,
    CONF_QUIET_START,
    DEFAULT_DIGEST_TIME,
    DEFAULT_QUIET_END,
    DEFAULT_QUIET_START,
    SOURCE_AUTO,
)

if TYPE_CHECKING:
    from .engine.detect import Watering
    from .hub import PlantRuntime, RootwiseHub

_LOGGER = logging.getLogger(__name__)

EVENT_ACTION: Final = "mobile_app_notification_action"
ACTION_PREFIX: Final = "ROOTWISE_"
NONCE_TTL: Final = timedelta(hours=48)
CRITICAL_PAUSE: Final = timedelta(hours=12)
SOURCE_NOTIFICATION: Final = "notification"
TAG_DIGEST: Final = "rootwise_digest"

TEXTS: Final[dict[str, dict[str, str]]] = {
    "en": {
        "digest_one": "Water today: {name}",
        "digest_many": "Water today: {count} plants",
        "due": "due",
        "watered": "Watered ✓",
        "all_watered": "All watered ✓",
        "snooze": "+1 day",
        "detected_title": "Watering detected: {name}",
        "detected": "{before} % → {after} %. If that wasn't you, tap below.",
        "reject": "That wasn't me",
        "too_wet_title": "{name} is too wet",
        "too_wet": "{value} % for two days. Skip watering and empty the saucer.",
        "very_dry_title": "{name} is very dry",
        "very_dry": "Only {value} %. Water soon.",
    },
    "de": {
        "digest_one": "Heute gießen: {name}",
        "digest_many": "Heute gießen: {count} Pflanzen",
        "due": "fällig",
        "watered": "Gegossen ✓",
        "all_watered": "Alle gegossen ✓",
        "snooze": "+1 Tag",
        "detected_title": "Gießen erkannt: {name}",
        "detected": "{before} % → {after} %. Warst du das nicht, tippe unten.",
        "reject": "War ich nicht",
        "too_wet_title": "{name} ist zu nass",
        "too_wet": "Seit zwei Tagen {value} %. Nicht gießen, Untersetzer leeren.",
        "very_dry_title": "{name} ist sehr trocken",
        "very_dry": "Nur noch {value} %. Bald gießen.",
    },
}


def _time(value: str | None, default: str) -> time:
    parsed = dt_util.parse_time(value or default)
    return parsed if parsed is not None else dt_util.parse_time(default) or time()


def in_quiet_hours(now: time, start: time, end: time) -> bool:
    """Return True if now is in the quiet window (it may span midnight)."""
    if start == end:
        return False
    if start < end:
        return start <= now < end
    return now >= start or now < end


class Notifier:
    """Sends Rootwise pushes and handles their buttons."""

    def __init__(self, hub: RootwiseHub) -> None:
        """Keep a reference to the hub."""
        self.hub = hub
        self.hass: HomeAssistant = hub.hass
        self._unsubs: list[CALLBACK_TYPE] = []

    @property
    def _options(self) -> dict[str, Any]:
        return dict(self.hub.entry.options)

    def _text(self, key: str, **values: Any) -> str:
        lang = self.hass.config.language[:2]
        template = TEXTS.get(lang, TEXTS["en"]).get(key) or TEXTS["en"][key]
        return template.format(**values)

    # ---- lifecycle ---------------------------------------------------------

    @callback
    def async_start(self) -> None:
        """Listen for button presses and schedule the digest."""
        self._unsubs.append(self.hass.bus.async_listen(EVENT_ACTION, self._on_action))
        at = _time(self._options.get(CONF_DIGEST_TIME), DEFAULT_DIGEST_TIME)
        self._unsubs.append(
            async_track_time_change(
                self.hass,
                self._on_digest,
                hour=at.hour,
                minute=at.minute,
                second=at.second,
            )
        )

    @callback
    def async_stop(self) -> None:
        """Stop listening."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    # ---- targets ---------------------------------------------------------

    def _targets(self) -> list[tuple[str, str | None]]:
        """Return (notify service, user id) for each chosen phone that is set up."""
        dev_reg = dr.async_get(self.hass)
        targets = []
        for device_id in self._options.get(CONF_NOTIFY_DEVICES) or []:
            device = dev_reg.async_get(device_id)
            if device is None:
                continue
            for entry_id in device.config_entries:
                entry = self.hass.config_entries.async_get_entry(entry_id)
                if entry is None or entry.domain != "mobile_app":
                    continue
                name = entry.data.get("device_name")
                service = f"mobile_app_{slugify(str(name))}"
                if name and self.hass.services.has_service(Platform.NOTIFY, service):
                    targets.append((service, entry.data.get("user_id")))
        return targets

    def _quiet(self) -> bool:
        options = self._options
        return in_quiet_hours(
            dt_util.now().time(),
            _time(options.get(CONF_QUIET_START), DEFAULT_QUIET_START),
            _time(options.get(CONF_QUIET_END), DEFAULT_QUIET_END),
        )

    async def _send(self, title: str, message: str, data: dict[str, Any]) -> None:
        for service, _ in self._targets():
            try:
                await self.hass.services.async_call(
                    Platform.NOTIFY,
                    service,
                    {"title": title, "message": message, "data": data},
                    blocking=True,
                )
            except HomeAssistantError as err:
                _LOGGER.warning(
                    "Could not send a Rootwise push via %s: %s", service, err
                )

    def _send_later(self, title: str, message: str, data: dict[str, Any]) -> None:
        self.hub.entry.async_create_background_task(
            self.hass, self._send(title, message, data), "rootwise_push"
        )

    # ---- one-time codes ---------------------------------------------------------

    def _nonce(self, action: str, plants: list[str], **extra: Any) -> str:
        store = self.hub.storage
        nonces: dict[str, dict[str, Any]] = store.data.setdefault("nonces", {})
        now = dt_util.utcnow()
        for key in [k for k, v in nonces.items() if _expired(v, now)]:
            del nonces[key]
        code = secrets.token_urlsafe(12)
        nonces[code] = {
            "action": action,
            "plants": plants,
            "expires": (now + NONCE_TTL).isoformat(),
            **extra,
        }
        store.async_save_data()
        return f"{ACTION_PREFIX}{code}"

    # ---- digest ---------------------------------------------------------

    @callback
    def _on_digest(self, _now: datetime) -> None:
        self.async_send_digest()

    def due_today(self) -> list[PlantRuntime]:
        """Return plants to water today: thirsty now, or due before tonight."""
        end_of_day = dt_util.start_of_local_day() + timedelta(days=1)
        due = []
        for plant in self.hub.plants.values():
            state = plant.state
            if state is None:
                continue
            snoozed = plant.snoozed_until
            if snoozed and snoozed > dt_util.utcnow():
                continue
            upcoming = plant.next_watering()
            if state.needs_water or (upcoming and upcoming["due"] < end_of_day):
                due.append(plant)
        return sorted(due, key=lambda p: p.config.name.casefold())

    @callback
    def async_send_digest(self) -> None:
        """Send the daily digest if anything needs water."""
        if self.hub.vacation or not self._targets():
            return
        plants = self.due_today()
        if not plants:
            return
        ids = [p.config.plant_id for p in plants]
        lines = []
        for plant in plants:
            reading = plant.measurements.get("soil_moisture")
            if reading is not None and reading.value is not None:
                lines.append(f"{plant.config.name} · {round(reading.value)} %")
            else:
                lines.append(f"{plant.config.name} · {self._text('due')}")
        single = len(plants) == 1
        title = (
            self._text("digest_one", name=plants[0].config.name)
            if single
            else self._text("digest_many", count=len(plants))
        )
        actions = [
            {
                "action": self._nonce(CARE_WATERED, ids),
                "title": self._text("watered" if single else "all_watered"),
            },
            {"action": self._nonce("snooze", ids), "title": self._text("snooze")},
        ]
        self._send_later(
            title,
            ", ".join(lines),
            {"tag": TAG_DIGEST, "group": "rootwise", "actions": actions},
        )

    # ---- detected watering ---------------------------------------------------------

    @callback
    def async_watering_detected(
        self, plant: PlantRuntime, entry: dict[str, Any], watering: Watering
    ) -> None:
        """Confirm a detected watering, with a way to reject it."""
        if not self._options.get(CONF_NOTIFY_DETECTED, True) or self._quiet():
            return
        if not self._targets():
            return
        after = watering.settled if watering.settled is not None else watering.peak
        action = self._nonce("reject", [plant.config.plant_id], entry_id=entry["id"])
        self._send_later(
            self._text("detected_title", name=plant.config.name),
            self._text("detected", before=round(watering.before), after=round(after)),
            {
                "tag": f"rootwise_detected_{plant.config.plant_id}",
                "group": "rootwise",
                "actions": [{"action": action, "title": self._text("reject")}],
            },
        )

    # ---- critical ---------------------------------------------------------

    @callback
    def async_critical(self, plant: PlantRuntime, kind: str, value: float) -> None:
        """Warn at once (even in quiet hours), at most every 12 hours."""
        if not self._targets():
            return
        sent = self.hub.storage.data.setdefault("critical", {})
        key = f"{plant.config.plant_id}:{kind}"
        last = dt_util.parse_datetime(sent.get(key) or "")
        now = dt_util.utcnow()
        if last is not None and now - last < CRITICAL_PAUSE:
            return
        sent[key] = now.isoformat()
        self.hub.storage.async_save_data()
        self._send_later(
            self._text(f"{kind}_title", name=plant.config.name),
            self._text(kind, value=round(value)),
            {"tag": f"rootwise_{kind}_{plant.config.plant_id}", "group": "rootwise"},
        )

    # ---- buttons ---------------------------------------------------------

    @callback
    def _on_action(self, event: Event) -> None:
        action = str(event.data.get("action", ""))
        if not action.startswith(ACTION_PREFIX):
            return
        allowed = {user for _, user in self._targets() if user}
        if event.context.user_id not in allowed:
            _LOGGER.warning(
                "Ignored a Rootwise button from a user without a target phone"
            )
            return
        nonces: dict[str, dict[str, Any]] = self.hub.storage.data.get("nonces", {})
        record = nonces.pop(action.removeprefix(ACTION_PREFIX), None)
        self.hub.storage.async_save_data()
        if record is None or _expired(record, dt_util.utcnow()):
            _LOGGER.debug("Ignored an unknown or expired Rootwise button")
            return
        plants = [self.hub.plants[p] for p in record["plants"] if p in self.hub.plants]
        kind = record["action"]
        for plant in plants:
            if kind == CARE_WATERED:
                plant.async_log_care(
                    CARE_WATERED, SOURCE_NOTIFICATION, user_id=event.context.user_id
                )
            elif kind == "snooze":
                plant.async_snooze()
            elif kind == "reject":
                entry = self.hub.storage.get_entry(str(record.get("entry_id")))
                if entry and entry["source"] == SOURCE_AUTO:
                    plant.async_delete_entry(entry["id"])


def _expired(record: dict[str, Any], now: datetime) -> bool:
    expires = dt_util.parse_datetime(str(record.get("expires", "")))
    return expires is None or expires < now
