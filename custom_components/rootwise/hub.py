"""Runtime: one PlantRuntime per plant, tied together by the RootwiseHub."""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
    async_track_utc_time_change,
)
from homeassistant.util import dt as dt_util, ulid as ulid_util

from .const import (
    BATTERY_LOW,
    CARE_PHOTO,
    CARE_REPOTTED,
    CARE_SENSOR_MOVED,
    CARE_WATERED,
    DEFAULT_INTERVAL,
    DEFAULT_SNOOZE,
    EVENT_WATERING_DETECTED,
    FUTURE_TOLERANCE,
    HUB_ENTITY_KEYS,
    MEASUREMENTS,
    PLANT_ENTITY_KEYS,
    SIGNAL_UPDATE,
    SOURCE_AUTO,
    SUBENTRY_PLANT,
    VERY_DRY_MARGIN,
)
from .engine.calibration import (
    STYLE_SCALE,
    Calibration,
    field_capacity,
    make,
    style_thresholds,
    suggest,
)
from .engine.detect import Watering
from .engine.interval import seasonal_interval
from .engine.learn import learned_interval
from .engine.measure import Range, Rating, rate_all
from .engine.status import (
    MoistureLevel,
    MoistureReading,
    PlantInput,
    PlantStatus,
    Reason,
    Status,
    evaluate,
)
from .engine.thresholds import default_thresholds
from .imaging import CleanImage
from .models import PlantConfig
from .photos import archive_folders, delete_photo, photo_root, write_photo
from .push import Notifier
from .repairs import OFFLINE_REPAIR_AFTER, async_clear_offline, async_raise_offline
from .species.db import Species, SpeciesDb
from .store import RootwiseStorage
from .watering import WateringTracker

_LOGGER = logging.getLogger(__name__)

THRESHOLD_LOW = "low"
THRESHOLD_HIGH = "high"
# A watering for calibration must lift the probe at least this much.
CALIBRATION_MIN_RISE = 3.0
# After these the probe sits differently: the scale may no longer fit.
PROBE_CHANGES = (CARE_SENSOR_MOVED, CARE_REPOTTED)


def _parse(value: str | None) -> datetime | None:
    return dt_util.parse_datetime(value) if value else None


@dataclass(frozen=True, slots=True)
class Measurement:
    """Current value of one mirrored measurement."""

    key: str
    source: str
    value: float | None
    unit: str | None
    target: Range | None
    range_source: str | None
    rating: Rating | None
    level: MoistureLevel | None = None


def _range_from(raw: Any) -> Range | None:
    if not isinstance(raw, dict):
        return None
    low, high = raw.get("min"), raw.get("max")
    if low is None and high is None:
        return None
    return Range(
        float(low) if low is not None else None,
        float(high) if high is not None else None,
    )


def species_range(
    key: str, species_info: Mapping[str, Any] | None, species: Species | None
) -> tuple[Range | None, str | None]:
    """Return a measurement's range from the species snapshot or offline list."""
    info = species_info or {}
    if (opb := _range_from(info.get("ranges", {}).get(key))) is not None:
        return opb, str(info.get("source", "openplantbook"))
    if species is not None:
        if key == "temperature":
            return Range(species.temp_min, species.temp_max), "offline"
        if key == "air_humidity":
            return Range(species.humidity_min, None), "offline"
    return None, None


class FutureTimeError(ValueError):
    """A care entry was logged for a time in the future."""


class CalibrationError(ValueError):
    """A calibration step that can't be done (code: no_sensor, no_value, ...)."""

    def __init__(self, code: str) -> None:
        """Keep the code for the WebSocket error."""
        super().__init__(code)
        self.code = code


class PlantRuntime:
    """Live state of one plant."""

    def __init__(
        self,
        hass: HomeAssistant,
        hub: RootwiseHub,
        config: PlantConfig,
        species: Species | None,
    ) -> None:
        """Keep references; nothing runs until async_start."""
        self.hass = hass
        self.hub = hub
        self.config = config
        self.species = species
        self.state: PlantStatus | None = None
        self.measurements: dict[str, Measurement] = {}
        self.hints: tuple[Reason, ...] = ()
        self._ratings: dict[str, Rating] = {}
        self._wet_since: datetime | None = None
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._snooze_timer: CALLBACK_TYPE | None = None
        self._very_dry = False
        self._offline_since: datetime | None = None
        self.tracker = WateringTracker(self)

    # ---- settings -------------------------------------------------------

    @property
    def settings(self) -> dict[str, Any]:
        """Return this plant's stored settings."""
        return self.hub.storage.plant(self.config.plant_id)

    @property
    def _settings(self) -> dict[str, Any]:
        return self.settings

    @property
    def watering_style(self) -> str:
        """Return the species' watering style ("" if unknown)."""
        return self.species.watering_style if self.species else ""

    def thresholds(self) -> tuple[float, float]:
        """Return (low, high): own, else calibrated style, learned, species."""
        low, high = default_thresholds(self.watering_style)
        if (calibration := self.calibration) is not None:
            low, high = style_thresholds(calibration, self.watering_style)
        elif self.tracker.learned is not None:
            low, high = self.tracker.learned
        own = self._settings.get("thresholds", {})
        return float(own.get(THRESHOLD_LOW, low)), float(own.get(THRESHOLD_HIGH, high))

    def threshold_source(self) -> str:
        """Return where the thresholds come from."""
        if self._settings.get("thresholds"):
            return "custom"
        if self.calibration is not None:
            return "calibrated"
        return "learned" if self.tracker.learned is not None else "species"

    def interval_days(self) -> float:
        """Return the watering interval: own setting, learned, or seasonal default."""
        if (own := self._settings.get("interval_days")) is not None:
            return float(own)
        learned = learned_interval(
            self.hub.storage.watering_times(self.config.plant_id)
        )
        if learned is not None:
            return learned
        summer, winter = (
            (self.species.summer_days, self.species.winter_days)
            if self.species
            else DEFAULT_INTERVAL
        )
        return seasonal_interval(
            summer, winter, dt_util.now().month, self.hass.config.latitude
        )

    @property
    def last_watered(self) -> datetime | None:
        """Return the time of the last logged watering."""
        entry = self.hub.storage.last_entry(self.config.plant_id, CARE_WATERED)
        return _parse(entry["ts"]) if entry else None

    @property
    def last_watered_id(self) -> str | None:
        """Return the journal id of the last watering."""
        entry = self.hub.storage.last_entry(self.config.plant_id, CARE_WATERED)
        return entry["id"] if entry else None

    @property
    def snoozed_until(self) -> datetime | None:
        """Return the end of the snooze, if any."""
        return _parse(self._settings.get("snoozed_until"))

    @property
    def image_url(self) -> str | None:
        """Return the species picture (OpenPlantbook or Plant Monitor)."""
        info = self.config.species_info or {}
        url = info.get("image_url")
        return str(url) if url else None

    def sources(self) -> dict[str, str]:
        """Return {measurement key: source entity id} for assigned sensors."""
        result = {}
        for key, field_name, _ in MEASUREMENTS:
            if entity_id := getattr(self.config, field_name):
                result[key] = entity_id
        return result

    def entity_keys(self) -> list[str]:
        """Return the unique id suffixes this plant should have."""
        keys = list(PLANT_ENTITY_KEYS)
        if self.config.moisture_sensor:
            keys += ["dry_threshold", "wet_threshold"]
        else:
            keys.append("watering_interval")
        return keys + list(self.sources())

    def range_for(self, key: str) -> tuple[Range | None, str | None]:
        """Return the target range of a measurement and where it comes from."""
        if key == "soil_moisture":
            low, high = self.thresholds()
            return Range(low, high), self.threshold_source()
        if (own := _range_from(self.config.ranges.get(key))) is not None:
            return own, "custom"
        target, source = species_range(key, self.config.species_info, self.species)
        if target is not None:
            return target, source
        if key == "battery":
            return Range(BATTERY_LOW, None), "default"
        return None, None

    # ---- lifecycle ------------------------------------------------------

    @callback
    def async_start(self) -> None:
        """Listen to all source sensors and arm the snooze timer."""
        if sources := sorted(set(self.sources().values())):
            self._unsubs.append(
                async_track_state_change_event(
                    self.hass, sources, self._on_sensor_change
                )
            )
        self._arm_snooze_timer()

    @callback
    def async_stop(self) -> None:
        """Remove listeners and timers."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self.tracker.async_stop()
        if self._snooze_timer:
            self._snooze_timer()
            self._snooze_timer = None

    @callback
    def add_listener(self, update: Callable[[], None]) -> CALLBACK_TYPE:
        """Register an entity update callback."""
        self._listeners.append(update)

        @callback
        def _remove() -> None:
            self._listeners.remove(update)

        return _remove

    @callback
    def _on_sensor_change(self, event: Event[EventStateChangedData]) -> None:
        new = event.data["new_state"]
        if new is not None and event.data["entity_id"] == self.config.moisture_sensor:
            self.tracker.add_sample(new.last_updated, new.state)
        self.async_evaluate()

    def next_watering(self) -> dict[str, Any] | None:
        """Return the next watering: forecast from the sensor, else interval."""
        if self.config.moisture_sensor:
            result = self.tracker.forecast
            if result is None:
                return None
            return {
                "due": result.due,
                "earliest": result.earliest,
                "latest": result.latest,
                "confidence": result.confidence.value,
                "rate": round(result.rate, 1),
                "method": "trend",
            }
        last = self.last_watered
        if last is None:
            return None
        return {
            "due": last + timedelta(days=self.interval_days()),
            "method": "interval",
        }

    # ---- evaluation -----------------------------------------------------

    def _reading(self) -> MoistureReading | None:
        if not self.config.moisture_sensor:
            return None
        state = self.hass.states.get(self.config.moisture_sensor)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return MoistureReading(value=None, last_reported=None)
        try:
            value = float(state.state)
        except ValueError:
            return MoistureReading(value=None, last_reported=None)
        return MoistureReading(value=value, last_reported=state.last_reported)

    @callback
    def async_evaluate(self) -> None:
        """Recompute the status and notify entities."""
        low, high = self.thresholds()
        result = evaluate(
            PlantInput(
                now=dt_util.utcnow(),
                low=low,
                high=high,
                interval_days=self.interval_days(),
                moisture=self._reading(),
                last_watered=self.last_watered,
                snoozed_until=self.snoozed_until,
                previous=self.state.status if self.state else None,
                wet_since=self._wet_since,
            )
        )
        previous = self.state
        self._wet_since = result.wet_since
        self.state = result
        self._update_measurements(result)
        if previous is not None:
            self._warn_if_critical(previous, result, low)
        self._track_offline(result)
        for update in list(self._listeners):
            update()
        self.hub.async_notify()

    def _track_offline(self, result: PlantStatus) -> None:
        if result.status is Status.SENSOR_OFFLINE and self.config.moisture_sensor:
            now = dt_util.utcnow()
            self._offline_since = self._offline_since or now
            if now - self._offline_since >= OFFLINE_REPAIR_AFTER:
                async_raise_offline(
                    self.hass,
                    self.hub.entry.entry_id,
                    self.config.plant_id,
                    self.config.name,
                    self.config.moisture_sensor,
                )
        elif self._offline_since is not None:
            self._offline_since = None
            async_clear_offline(self.hass, self.config.plant_id)

    def _warn_if_critical(
        self, previous: PlantStatus, result: PlantStatus, low: float
    ) -> None:
        reading = self.measurements.get("soil_moisture")
        value = reading.value if reading is not None else None
        if value is None:
            return
        if result.status is Status.TOO_WET and previous.status is not Status.TOO_WET:
            self.hub.notifier.async_critical(self, "too_wet", value)
        very_dry = value <= low - VERY_DRY_MARGIN
        if very_dry and not self._very_dry:
            self.hub.notifier.async_critical(self, "very_dry", value)
        self._very_dry = very_dry

    def _read(self, entity_id: str) -> tuple[float | None, str | None]:
        state = self.hass.states.get(entity_id)
        if state is None:
            return None, None
        unit = state.attributes.get("unit_of_measurement")
        try:
            return float(state.state), unit
        except ValueError:
            return None, unit

    def _update_measurements(self, status: PlantStatus) -> None:
        sources = self.sources()
        readings = {key: self._read(entity_id) for key, entity_id in sources.items()}
        targets = {key: self.range_for(key) for key in sources}
        ratings = rate_all(
            {k: v for k, (v, _) in readings.items() if k != "soil_moisture"},
            {k: r for k, (r, _) in targets.items() if r is not None},
            self._ratings,
        )
        level = status.moisture_level
        if "soil_moisture" in sources and level is not None:
            if level is MoistureLevel.DRY:
                ratings["soil_moisture"] = Rating.LOW
            elif level is MoistureLevel.TOO_WET:
                ratings["soil_moisture"] = Rating.HIGH
            else:
                ratings["soil_moisture"] = Rating.OK
        self._ratings = ratings

        hints: list[Reason] = []
        measurements: dict[str, Measurement] = {}
        for key, entity_id in sources.items():
            value, unit = readings[key]
            target, range_source = targets[key]
            rating = ratings.get(key)
            measurements[key] = Measurement(
                key=key,
                source=entity_id,
                value=value,
                unit=unit,
                target=target,
                range_source=range_source,
                rating=rating,
                level=level if key == "soil_moisture" else None,
            )
            if key == "soil_moisture" or rating in (None, Rating.OK):
                continue
            if target is None or value is None or rating is None:
                continue
            params: dict[str, float | str] = {"value": value}
            if target.min is not None:
                params["min"] = target.min
            if target.max is not None:
                params["max"] = target.max
            hints.append(Reason(f"{key}_{rating.value}", params))
        self.measurements = measurements
        self.hints = tuple(hints)

    # ---- actions --------------------------------------------------------

    @callback
    def async_log_care(
        self,
        care_type: str,
        source: str,
        when: datetime | None = None,
        note: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        """Log a care action; watering also ends a snooze.

        The soil moisture at logging time is kept with entries for "now": it
        labels real data for the watering detection later on.
        """
        if when is not None:
            when = dt_util.as_utc(when)  # a naive time means local time
            if when > dt_util.utcnow() + FUTURE_TOLERANCE:
                raise FutureTimeError(when)
        data: dict[str, Any] = {}
        reading = self.measurements.get("soil_moisture")
        # Only for "now": today's value says nothing about an earlier watering.
        recent = when is None or dt_util.utcnow() - when <= FUTURE_TOLERANCE
        if recent and reading is not None and reading.value is not None:
            data["moisture"] = reading.value
        if care_type == CARE_WATERED and source != SOURCE_AUTO:
            # The user's own entry is the truth; a detected one nearby goes.
            self.tracker.replace_detected(when or dt_util.utcnow())
        entry = self.hub.storage.async_add_entry(
            self.config.plant_id,
            care_type,
            source,
            when=when,
            note=note,
            user_id=user_id,
            data=data,
        )
        if care_type == CARE_WATERED:
            self.tracker.update_forecast(dt_util.utcnow())
        if care_type == CARE_WATERED and self._settings.get("snoozed_until"):
            self._settings["snoozed_until"] = None
            self.hub.storage.async_save_data()
            self._arm_snooze_timer()
        self.async_evaluate()
        return entry

    @callback
    def async_delete_entry(self, entry_id: str) -> None:
        """Remove a journal entry of this plant (for example a wrong tap).

        A deleted detected watering is remembered, so it is not found again;
        a deleted photo takes its files along.
        """
        entry = self.hub.storage.async_delete_entry(entry_id)
        if entry and entry["source"] == SOURCE_AUTO and (ts := _parse(entry["ts"])):
            self.tracker.reject(ts)
        if entry and entry["type"] == CARE_PHOTO:
            self._forget_photo(entry.get("data", {}).get("photo_id"))
        self.tracker.update_forecast(dt_util.utcnow())
        self.async_evaluate()

    # ---- calibration ------------------------------------------------------

    @property
    def calibration(self) -> Calibration | None:
        """Return the calibration of the current soil probe, if any."""
        stored = self._settings.get("calibration")
        if not stored or stored.get("sensor") != self.config.moisture_sensor:
            return None
        return make(float(stored["dry"]), float(stored["wet"]))

    def calibration_info(self) -> dict[str, Any] | None:
        """Return the calibration for the cards, with whether the probe moved since."""
        if self.calibration is None:
            return None
        stored = self._settings["calibration"]
        since = _parse(stored.get("at"))
        moved = any(
            (ts := _parse(entry["ts"])) is not None and since is not None and ts > since
            for kind in PROBE_CHANGES
            for entry in self.hub.storage.typed_entries(self.config.plant_id, kind)
        )
        return {
            "dry": stored["dry"],
            "wet": stored["wet"],
            "at": stored.get("at"),
            "outdated": moved,
        }

    def _current_raw(self) -> float | None:
        reading = self._reading()
        return reading.value if reading is not None else None

    def _require_probe(self) -> None:
        if not self.config.moisture_sensor:
            raise CalibrationError("no_sensor")

    @property
    def _pending(self) -> dict[str, Any]:
        pending: dict[str, Any] = self._settings.setdefault("calibration_pending", {})
        return pending

    def calibration_state(self, now: datetime) -> dict[str, Any]:
        """Return everything the calibration assistant shows."""
        self._require_probe()
        self.async_check_calibration(now)
        found = suggest(self.tracker.waterings)
        return {
            "calibration": self.calibration_info(),
            "pending": self._pending_state(now),
            "suggestion": {
                "dry": round(found.dry, 1),
                "wet": round(found.wet, 1),
                "waterings": len(self.tracker.waterings),
            }
            if found
            else None,
            "current": self._current_raw(),
            "style": self.watering_style or None,
            "scale": list(
                STYLE_SCALE.get(self.watering_style, STYLE_SCALE["slightly_dry"])
            ),
        }

    def _pending_state(self, now: datetime) -> dict[str, Any] | None:
        pending = self._settings.get("calibration_pending")
        if not pending:
            return None
        state: dict[str, Any] = {
            "dry": pending.get("dry"),
            "wet": pending.get("wet"),
            "watered_at": pending.get("watered_at"),
            "value": None,
            "hours": 0.0,
        }
        if error := pending.get("error"):
            state["phase"] = error
        elif watered := _parse(pending.get("watered_at")):
            measured = field_capacity(self.tracker.buckets(), watered, now)
            state["phase"] = measured.phase
            state["value"] = round(measured.value, 1) if measured.value else None
            state["hours"] = round(measured.hours, 1)
        elif pending.get("wet") is not None:
            state["phase"] = "need_dry"
        else:
            state["phase"] = "need_wet"
        return state

    @callback
    def async_calibrate_dry(self) -> None:
        """Take the current reading as "really dry"."""
        self._require_probe()
        if (value := self._current_raw()) is None:
            raise CalibrationError("no_value")
        pending = self._pending
        pending.pop("error", None)
        pending["dry"] = round(value, 1)
        self._finish_calibration()

    @callback
    def async_calibrate_wet(self, user_id: str | None) -> None:
        """Log a thorough watering now and measure field capacity after it."""
        self._require_probe()
        before = self._current_raw()
        self.async_log_care(CARE_WATERED, source="card", user_id=user_id)
        pending = self._pending
        for key in ("error", "wet"):
            pending.pop(key, None)
        pending["watered_at"] = dt_util.utcnow().isoformat()
        pending["before"] = before
        self.hub.storage.async_save_data()

    @callback
    def async_apply_calibration(self, dry: float, wet: float) -> None:
        """Set both points at once (for example the suggestion from the data)."""
        self._require_probe()
        if make(dry, wet) is None:
            raise CalibrationError("too_close")
        self._settings["calibration"] = {
            "dry": dry,
            "wet": wet,
            "at": dt_util.utcnow().isoformat(),
            "sensor": self.config.moisture_sensor,
        }
        self._settings.pop("calibration_pending", None)
        self.hub.storage.async_save_data()
        self.tracker.update_forecast(dt_util.utcnow())
        self.async_evaluate()

    @callback
    def async_clear_calibration(self) -> None:
        """Forget the calibration and any step in progress."""
        self._settings.pop("calibration", None)
        self._settings.pop("calibration_pending", None)
        self.hub.storage.async_save_data()
        self.tracker.update_forecast(dt_util.utcnow())
        self.async_evaluate()

    @callback
    def async_check_calibration(self, now: datetime) -> None:
        """Finish the field capacity measurement once six hours have passed."""
        pending = self._settings.get("calibration_pending")
        if not pending or not (watered := _parse(pending.get("watered_at"))):
            return
        measured = field_capacity(self.tracker.buckets(), watered, now)
        if measured.phase != "done":
            return
        pending.pop("watered_at")
        before = pending.pop("before", None)
        if measured.value is None or (
            before is not None and measured.value - before < CALIBRATION_MIN_RISE
        ):
            pending["error"] = "no_rise"
            self.hub.storage.async_save_data()
            return
        pending["wet"] = round(measured.value, 1)
        self._finish_calibration()

    @callback
    def _finish_calibration(self) -> None:
        pending = self._pending
        dry, wet = pending.get("dry"), pending.get("wet")
        if dry is None or wet is None:
            self.hub.storage.async_save_data()
            return
        if make(dry, wet) is None:
            pending["error"] = "too_close"
            self.hub.storage.async_save_data()
            return
        self.async_apply_calibration(dry, wet)

    # ---- photos -----------------------------------------------------------

    def photos(self) -> list[dict[str, Any]]:
        """Return the photo entries, newest first."""
        return self.hub.storage.typed_entries(self.config.plant_id, CARE_PHOTO)

    def photo_entry(self, photo_id: str) -> dict[str, Any] | None:
        """Return the journal entry of one photo."""
        return next(
            (e for e in self.photos() if e.get("data", {}).get("photo_id") == photo_id),
            None,
        )

    @property
    def cover_photo(self) -> dict[str, Any] | None:
        """Return the chosen cover photo's entry, else the newest photo's."""
        photos = self.photos()
        chosen = self._settings.get("cover_photo")
        return next(
            (p for p in photos if p["data"]["photo_id"] == chosen),
            photos[0] if photos else None,
        )

    async def async_add_photo(
        self,
        clean: CleanImage,
        *,
        note: str | None,
        user_id: str | None,
        source: str = "card",
    ) -> dict[str, Any]:
        """Store a cleaned photo and log it."""
        photo_id = ulid_util.ulid_now()
        await self.hass.async_add_executor_job(
            write_photo, self.hass, self.config.plant_id, photo_id, clean
        )
        entry = self.hub.storage.async_add_entry(
            self.config.plant_id,
            CARE_PHOTO,
            source,
            note=note,
            user_id=user_id,
            data={
                "photo_id": photo_id,
                "width": clean.width,
                "height": clean.height,
                "bytes": len(clean.full),
            },
        )
        self.async_evaluate()
        return entry

    @callback
    def async_set_cover(self, photo_id: str | None) -> None:
        """Choose the cover photo; None goes back to the newest one."""
        if photo_id is None:
            self._settings.pop("cover_photo", None)
        else:
            self._settings["cover_photo"] = photo_id
        self.hub.storage.async_save_data()
        self.async_evaluate()

    @callback
    def _forget_photo(self, photo_id: str | None) -> None:
        if not photo_id:
            return
        if self._settings.get("cover_photo") == photo_id:
            self._settings.pop("cover_photo")
            self.hub.storage.async_save_data()
        self.hub.entry.async_create_task(
            self.hass, self._async_delete_files(photo_id), f"rootwise_photo_{photo_id}"
        )

    async def _async_delete_files(self, photo_id: str) -> None:
        await self.hass.async_add_executor_job(
            delete_photo, self.hass, self.config.plant_id, photo_id
        )

    @callback
    def async_snooze(self, duration: timedelta = DEFAULT_SNOOZE) -> None:
        """Hide 'needs water' for a while."""
        self._settings["snoozed_until"] = (dt_util.utcnow() + duration).isoformat()
        self.hub.storage.async_save_data()
        self._arm_snooze_timer()
        self.async_evaluate()

    @callback
    def async_set_threshold(self, key: str, value: float) -> None:
        """Override the dry (low) or wet (high) threshold."""
        self._settings.setdefault("thresholds", {})[key] = value
        self.hub.storage.async_save_data()
        self.async_evaluate()

    @callback
    def async_reset_thresholds(self) -> None:
        """Forget own thresholds; learned or species values apply again."""
        if self._settings.pop("thresholds", None) is not None:
            self.hub.storage.async_save_data()
        self.tracker.update_forecast(dt_util.utcnow())
        self.async_evaluate()

    @callback
    def async_set_interval(self, days: float) -> None:
        """Override the watering interval (plants without sensor)."""
        self._settings["interval_days"] = days
        self.hub.storage.async_save_data()
        self.async_evaluate()

    @callback
    def _arm_snooze_timer(self) -> None:
        if self._snooze_timer:
            self._snooze_timer()
            self._snooze_timer = None
        until = self.snoozed_until
        if until and until > dt_util.utcnow():
            self._snooze_timer = async_track_point_in_utc_time(
                self.hass, self._on_snooze_end, until + timedelta(seconds=1)
            )

    @callback
    def _on_snooze_end(self, _now: datetime) -> None:
        self._snooze_timer = None
        self.async_evaluate()


class RootwiseHub:
    """All plants of the config entry plus global state."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        storage: RootwiseStorage,
        species_db: SpeciesDb,
    ) -> None:
        """Create a runtime for every plant subentry."""
        self.hass = hass
        self.entry = entry
        self.storage = storage
        self.species_db = species_db
        self.plants: dict[str, PlantRuntime] = {}
        self._listeners: list[Callable[[], None]] = []
        self._unsub_tick: CALLBACK_TYPE | None = None
        self._ready = False
        self.notifier = Notifier(self)
        self.photo_lock = asyncio.Lock()
        for subentry in entry.subentries.values():
            if subentry.subentry_type != SUBENTRY_PLANT:
                continue
            config = PlantConfig.from_subentry(subentry)
            self.plants[config.plant_id] = PlantRuntime(
                hass, self, config, species_db.get(config.species_id)
            )
        storage.async_prune(set(self.plants))

    @callback
    def async_start(self) -> None:
        """Evaluate every plant and start listening."""
        for plant_id, plant in self.plants.items():
            plant.async_evaluate()
            plant.async_start()
            # The recorder query can take a moment on a Pi: don't hold up start.
            self.entry.async_create_background_task(
                self.hass, plant.tracker.async_load(), f"rootwise_history_{plant_id}"
            )
        self._ready = True
        self.async_notify()
        self.notifier.async_start()
        self.entry.async_create_task(
            self.hass, self._async_archive_photos(), "rootwise_archive_photos"
        )
        self._unsub_tick = async_track_utc_time_change(
            self.hass, self._on_tick, minute=0, second=7
        )

    async def async_shutdown(self) -> None:
        """Stop everything and write pending data."""
        if self._unsub_tick:
            self._unsub_tick()
            self._unsub_tick = None
        self.notifier.async_stop()
        for plant in self.plants.values():
            plant.async_stop()
        await self.storage.async_flush()

    async def _async_archive_photos(self) -> None:
        """Keep the photos of removed plants, out of the way."""
        moved = await self.hass.async_add_executor_job(
            archive_folders, photo_root(self.hass), set(self.plants)
        )
        if moved:
            _LOGGER.info("Moved photos of removed plants to the archive: %s", moved)

    @callback
    def _on_tick(self, _now: datetime) -> None:
        # Hourly: stale sensors, interval due dates, season changes, forecasts
        # and waterings that need an hour of quiet to be confirmed.
        for plant in self.plants.values():
            if plant.config.moisture_sensor:
                plant.tracker.async_process()
            else:
                plant.async_evaluate()

    @callback
    def async_watering_detected(
        self, plant: PlantRuntime, entry: dict[str, Any], watering: Watering
    ) -> None:
        """Announce a watering found in the sensor data."""
        self.hass.bus.async_fire(
            EVENT_WATERING_DETECTED,
            {
                "plant_id": plant.config.plant_id,
                "name": plant.config.name,
                "entry_id": entry["id"],
                "at": watering.at.isoformat(),
                "before": round(watering.before, 1),
                "after": round(
                    watering.settled if watering.settled is not None else watering.peak,
                    1,
                ),
            },
        )
        self.notifier.async_watering_detected(plant, entry, watering)

    @callback
    def add_listener(self, update: Callable[[], None]) -> CALLBACK_TYPE:
        """Register a callback for hub-level entities."""
        self._listeners.append(update)

        @callback
        def _remove() -> None:
            self._listeners.remove(update)

        return _remove

    @callback
    def async_notify(self) -> None:
        """Tell hub-level entities that something changed."""
        if not self._ready:
            return
        for update in list(self._listeners):
            update()
        # Card subscriptions outlive a reload, so they listen hass-wide.
        async_dispatcher_send(self.hass, SIGNAL_UPDATE, self)

    # ---- global state ---------------------------------------------------

    @property
    def vacation(self) -> bool:
        """Return True while vacation mode is on."""
        vacation = self.storage.data.get("vacation", {})
        if not vacation.get("on"):
            return False
        until = _parse(vacation.get("until"))
        return until is None or until > dt_util.utcnow()

    @callback
    def async_set_vacation(self, enabled: bool, until: datetime | None = None) -> None:
        """Switch vacation mode on or off."""
        self.storage.data["vacation"] = {
            "on": enabled,
            "until": until.isoformat() if enabled and until else None,
        }
        self.storage.async_save_data()
        self.async_notify()

    def expected_unique_ids(self) -> set[str]:
        """Return the unique ids all current entities should have."""
        ids = {f"{self.entry.entry_id}_{key}" for key in HUB_ENTITY_KEYS}
        for plant_id, plant in self.plants.items():
            ids |= {f"{plant_id}_{key}" for key in plant.entity_keys()}
        return ids

    def plants_needing_water(self) -> list[PlantRuntime]:
        """Return plants that need water now."""
        return [
            p
            for p in self.plants.values()
            if p.state is not None and p.state.needs_water
        ]

    def status_counts(self) -> dict[str, int]:
        """Return how many plants have each status."""
        counts: dict[str, int] = {s.value: 0 for s in Status}
        for plant in self.plants.values():
            if plant.state is not None:
                counts[plant.state.status.value] += 1
        return counts
