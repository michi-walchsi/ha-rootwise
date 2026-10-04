"""Watering detection, learning and forecast for one plant (Home Assistant glue).

At start the tracker reads the soil sensor's past from the recorder; then it
follows the sensor live. Everything it finds is derived again from the data
each time, so it can never drift from what the sensor saw. Only two things
are stored: journal entries for detected waterings, and the waterings the
user rejected ("that wasn't me"), so they stay gone.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, Final

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from .const import CARE_WATERED, SOURCE_AUTO
from .engine.detect import EPISODE, Watering, detect
from .engine.forecast import Forecast, cycle_rates, forecast
from .engine.learn import learned_thresholds
from .engine.series import Bucket, merge
from .history import async_history

if TYPE_CHECKING:
    from .hub import PlantRuntime

LIVE_KEEP: Final = timedelta(days=4)
PROCESS_DELAY: Final = 60  # seconds: one run after a burst of readings
# Detected long ago (history at first start): logged, but no event or push.
FRESH: Final = timedelta(hours=12)
MAX_REJECTED: Final = 50


def _parse(value: str) -> datetime | None:
    return dt_util.parse_datetime(value)


class WateringTracker:
    """Everything Rootwise learns from one plant's soil sensor."""

    def __init__(self, runtime: PlantRuntime) -> None:
        """Start empty; async_load reads the past."""
        self.runtime = runtime
        self.hass: HomeAssistant = runtime.hass
        self.history: list[Bucket] = []
        self.live: list[Bucket] = []
        self.waterings: list[Watering] = []
        self.rates: list[float] = []
        self.learned: tuple[int, int] | None = None
        self.forecast: Forecast | None = None
        self._pending: CALLBACK_TYPE | None = None

    @property
    def entity_id(self) -> str | None:
        """Return the soil sensor."""
        return self.runtime.config.moisture_sensor

    # ---- input -------------------------------------------------------------

    async def async_load(self) -> None:
        """Read the past from the recorder, then derive everything."""
        if not self.entity_id:
            return
        now = dt_util.utcnow()
        self.history = await async_history(self.hass, self.entity_id, now)
        state = self.hass.states.get(self.entity_id)
        if state is not None:
            self.add_sample(state.last_updated, state.state, process=False)
        self.async_process()

    @callback
    def add_sample(self, at: datetime, state: str, *, process: bool = True) -> None:
        """Take a live reading."""
        try:
            value = float(state)
        except ValueError:
            return
        self.live.append(Bucket.point(at, value))
        cutoff = dt_util.utcnow() - LIVE_KEEP
        self.live = [b for b in self.live if b.start >= cutoff]
        if process and self._pending is None:
            self._pending = async_call_later(
                self.hass, PROCESS_DELAY, self._process_later
            )

    @callback
    def _process_later(self, _now: datetime) -> None:
        self._pending = None
        self.async_process()

    @callback
    def async_stop(self) -> None:
        """Cancel a pending run."""
        if self._pending is not None:
            self._pending()
            self._pending = None

    # ---- derive ------------------------------------------------------------

    def buckets(self) -> list[Bucket]:
        """Return history and live readings as one series."""
        return merge(self.history, self.live)

    @callback
    def async_process(self) -> None:
        """Detect, sync the journal, learn and forecast; then re-evaluate."""
        if not self.entity_id:
            return
        now = dt_util.utcnow()
        data = self.buckets()
        self.waterings = detect(data, now)
        self.learned = learned_thresholds(self.waterings)
        self.rates = cycle_rates(data, [w.at for w in self.waterings])
        for entry, watering in self._sync_journal():
            if now - watering.at <= FRESH:
                self.runtime.hub.async_watering_detected(self.runtime, entry, watering)
        # Before the forecast: a finished calibration changes the thresholds.
        self.runtime.async_check_calibration(now)
        self.update_forecast(now)
        self.runtime.async_evaluate()

    @callback
    def update_forecast(self, now: datetime) -> None:
        """Recompute when the soil reaches the dry threshold."""
        if not self.entity_id:
            self.forecast = None
            return
        low, _ = self.runtime.thresholds()
        self.forecast = forecast(
            self.buckets(), low, now, self.runtime.last_watered, self.rates
        )

    # ---- journal -----------------------------------------------------------

    def _rejected(self) -> list[datetime]:
        times = self.runtime.settings.get("rejected", [])
        return [t for t in (_parse(v) for v in times) if t is not None]

    def _sync_journal(self) -> list[tuple[dict[str, Any], Watering]]:
        """Log detected waterings that the journal does not have yet."""
        storage = self.runtime.hub.storage
        plant_id = self.runtime.config.plant_id
        logged = storage.watering_times(plant_id)
        rejected = self._rejected()
        added = []
        for watering in self.waterings:
            if any(abs(watering.at - t) <= EPISODE for t in rejected):
                continue
            if any(abs(watering.at - t) <= EPISODE for t in logged):
                continue
            data: dict[str, Any] = {
                "before": round(watering.before, 1),
                "peak": round(watering.peak, 1),
            }
            if watering.settled is not None:
                data["settled"] = round(watering.settled, 1)
            entry = storage.async_add_entry(
                plant_id, CARE_WATERED, SOURCE_AUTO, when=watering.at, data=data
            )
            logged.append(watering.at)
            added.append((entry, watering))
        return added

    @callback
    def reject(self, at: datetime) -> None:
        """Remember a detected watering the user deleted ("that wasn't me")."""
        settings = self.runtime.settings
        rejected = [*settings.get("rejected", []), at.isoformat()][-MAX_REJECTED:]
        settings["rejected"] = rejected
        self.runtime.hub.storage.async_save_data()

    @callback
    def replace_detected(self, at: datetime) -> None:
        """Drop detected entries near a watering the user logged themselves."""
        storage = self.runtime.hub.storage
        for entry in storage.watering_entries(self.runtime.config.plant_id):
            ts = _parse(entry["ts"])
            if entry["source"] == SOURCE_AUTO and ts and abs(ts - at) <= EPISODE:
                storage.async_delete_entry(entry["id"])

    # ---- results -----------------------------------------------------------

    def summary(self) -> dict[str, Any]:
        """Return what was learned, for diagnostics and the cards."""
        return {
            "waterings": len(self.waterings),
            "learned": list(self.learned) if self.learned else None,
            "rates": [round(r, 2) for r in self.rates],
        }
