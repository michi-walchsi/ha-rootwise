"""Find waterings in a soil moisture curve (pure Python).

A watering is a rise of at least RISE points within a few hours that still
holds an hour later; the water first pools at the probe (peak), then drains
to the pot's field capacity (settled). The same code runs on live samples,
on 5-minute statistics after a restart and on months of hourly statistics.

Values are on the sensor's own scale, not calibrated percent: the rules only
use differences, never absolute levels.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from statistics import median
from typing import Final

from .series import Bucket, hold

RISE: Final = 8.0
LOOKBACK: Final = timedelta(hours=3)
CONFIRM_AFTER: Final = timedelta(hours=1)
CONFIRM_SHARE: Final = 0.5
EPISODE: Final = timedelta(hours=6)
SETTLE_FROM: Final = timedelta(hours=2)
SETTLE_TO: Final = timedelta(hours=6)
# No rise counts right at the start of the data: that is the probe going in.
WARMUP: Final = timedelta(hours=2)
# A reading this low means the probe is out of the soil.
MIN_VALID: Final = 1.0


@dataclass(frozen=True, slots=True)
class Watering:
    """A watering found in the curve."""

    at: datetime
    before: float
    peak: float
    settled: float | None = None

    @property
    def rise(self) -> float:
        """Return how much wetter the soil became (after draining, if known)."""
        return (self.settled if self.settled is not None else self.peak) - self.before


def _window(data: Sequence[Bucket], i: int) -> list[Bucket]:
    """Buckets in the lookback before data[i], plus the value held before it."""
    since = data[i].start - LOOKBACK
    j = i
    while j > 0 and data[j - 1].start >= since:
        j -= 1
    return list(data[max(j - 1, 0) : i + 1])


def detect(buckets: Sequence[Bucket], now: datetime) -> list[Watering]:
    """Return the confirmed waterings, oldest first."""
    data = sorted(buckets, key=lambda b: b.start)
    if not data:
        return []
    first = data[0].start
    found: list[Watering] = []
    for i, current in enumerate(data):
        if current.start - first < WARMUP:
            continue
        if found and current.start - found[-1].at < EPISODE:
            continue
        window = _window(data, i)
        base_index = min(
            range(len(window)), key=lambda k: (window[k].low, -k)
        )  # lowest value, the latest one on ties
        base = window[base_index].low
        if base <= MIN_VALID or current.high - base < RISE:
            continue
        start = next(b for b in window[base_index:] if b.high >= base + RISE / 4).start
        if _restores_level(data, window[base_index], current):
            continue
        if now < start + CONFIRM_AFTER:
            break  # too early to tell; later rises belong to this episode
        later = hold(data, start + CONFIRM_AFTER)
        if later is None or later < base + CONFIRM_SHARE * RISE:
            continue
        peak = max(b.high for b in data if start <= b.start <= start + CONFIRM_AFTER)
        settling = [
            b.mean for b in data if start + SETTLE_FROM <= b.start <= start + SETTLE_TO
        ]
        found.append(
            Watering(
                at=start,
                before=base,
                peak=peak,
                settled=median(settling) if settling else None,
            )
        )
    return found


def _restores_level(data: Sequence[Bucket], base: Bucket, current: Bucket) -> bool:
    """Return True if the rise only undoes a drop, like a probe put back in."""
    since = base.start - EPISODE
    # Strictly before the low point: an hourly bucket holds the rise itself.
    top = max((b.high for b in data if since <= b.start < base.start), default=base.low)
    if top - base.low < RISE:
        return False
    return current.high < top + RISE / 2


def detect_drops(
    buckets: Sequence[Bucket], waterings: Sequence[Watering]
) -> list[datetime]:
    """Return times the soil got much drier at once: a moved or pulled probe.

    Draining right after a watering is expected and does not count.
    """
    data = sorted(buckets, key=lambda b: b.start)
    drops: list[datetime] = []
    for i, current in enumerate(data):
        if drops and current.start - drops[-1] < EPISODE:
            continue
        if any(w.at <= current.start <= w.at + EPISODE for w in waterings):
            continue
        window = _window(data, i)
        top_index = max(range(len(window)), key=lambda k: (window[k].high, -k))
        top = window[top_index].high
        if top - current.low < RISE:
            continue
        drops.append(
            next(b for b in window[top_index:] if b.low <= top - RISE / 4).start
        )
    return drops
