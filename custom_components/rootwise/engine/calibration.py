"""Two-point calibration of a soil probe (pure Python).

A probe measures on its own scale: every pot, soil and probe depth gives
other numbers. Two points make an honest one. 0 % is the soil really dry;
100 % is field capacity, the level the soil keeps once a thorough watering
has drained (the median 2-6 hours after watering, not the peak). On that
scale the species' watering style sets the thresholds.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from statistics import median
from typing import Final, Literal

from .detect import SETTLE_FROM, SETTLE_TO, Watering
from .series import Bucket, hold

# Raw points between dry and wet; closer, and the scale means nothing.
MIN_SPAN: Final = 10.0
# Right after watering the probe reads a bit above field capacity.
TOP: Final = 110.0
SAMPLE: Final = timedelta(minutes=10)

# (water below, too wet above) in percent of the calibrated scale.
STYLE_SCALE: Final[dict[str, tuple[float, float]]] = {
    "dry_out": (5.0, 60.0),
    "mostly_dry": (15.0, 80.0),
    "slightly_dry": (30.0, 90.0),
    "evenly_moist": (50.0, 97.0),
}
DEFAULT_STYLE: Final = "slightly_dry"


@dataclass(frozen=True, slots=True)
class Calibration:
    """Raw values for 0 % (dry) and 100 % (field capacity)."""

    dry: float
    wet: float

    def percent(self, raw: float) -> float:
        """Return the raw value on the calibrated scale (0 to TOP)."""
        return max(0.0, min(TOP, (raw - self.dry) / (self.wet - self.dry) * 100))

    def raw(self, percent: float) -> float:
        """Return the raw value for a percentage of the scale."""
        return self.dry + percent / 100 * (self.wet - self.dry)


def make(dry: float, wet: float) -> Calibration | None:
    """Return a calibration, or None if the points are too close."""
    return Calibration(dry, wet) if wet - dry >= MIN_SPAN else None


def style_thresholds(calibration: Calibration, style: str) -> tuple[float, float]:
    """Return raw (low, high) thresholds for a watering style.

    One decimal: whole numbers would shift a narrow scale's percentages.
    """
    low, high = STYLE_SCALE.get(style, STYLE_SCALE[DEFAULT_STYLE])
    return round(calibration.raw(low), 1), round(calibration.raw(high), 1)


def suggest(waterings: Sequence[Watering], minimum: int = 2) -> Calibration | None:
    """Propose a scale from earlier cycles: driest level, usual field capacity."""
    settled = [w.settled for w in waterings if w.settled is not None]
    if len(waterings) < minimum or len(settled) < minimum:
        return None
    return make(min(w.before for w in waterings), median(settled))


@dataclass(frozen=True, slots=True)
class FieldCapacity:
    """Where the measurement after a watering stands."""

    phase: Literal["draining", "measuring", "done"]
    value: float | None  # median so far, final once done
    hours: float  # hours measured, up to 4


def field_capacity(
    buckets: Sequence[Bucket], watered_at: datetime, now: datetime
) -> FieldCapacity:
    """Measure the drained level 2-6 hours after a watering.

    Probes report only on change, so the value in force is sampled every
    ten minutes rather than averaging the few readings that arrive.
    """
    start = watered_at + SETTLE_FROM
    if now < start:
        return FieldCapacity("draining", None, 0.0)
    stop = min(now, watered_at + SETTLE_TO)
    values = []
    at = start
    while at <= stop:
        if (value := hold(buckets, at)) is not None:
            values.append(value)
        at += SAMPLE
    hours = (stop - start) / timedelta(hours=1)
    phase: Literal["measuring", "done"] = (
        "done" if now >= watered_at + SETTLE_TO else "measuring"
    )
    return FieldCapacity(phase, median(values) if values else None, hours)
