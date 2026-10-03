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
STEP: Final = RISE / 4  # one reading this much higher: water is arriving
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
        # Cheap filter first: enough of a rise within the lookback at all?
        if current.high - min(b.low for b in _window(data, i)) < RISE:
            continue
        k = _rise_start(data, i)
        if k is None:
            continue
        start = data[k].start
        before = min(data[k].low, data[k - 1].mean) if k else data[k].low
        if before <= MIN_VALID or current.high - before < RISE:
            continue
        if _restores_level(data, before, start, current):
            continue
        if now < start + CONFIRM_AFTER:
            break  # too early to tell; later rises belong to this episode
        later = hold(data, start + CONFIRM_AFTER)
        if later is None or later < before + CONFIRM_SHARE * RISE:
            continue
        peak = max(b.high for b in data if start <= b.start <= start + CONFIRM_AFTER)
        settling = [
            b.mean for b in data if start + SETTLE_FROM <= b.start <= start + SETTLE_TO
        ]
        found.append(
            Watering(
                at=start,
                before=before,
                peak=peak,
                settled=median(settling) if settling else None,
            )
        )
    return found


def _steep(data: Sequence[Bucket], j: int) -> bool:
    """Return True if data[j] reads clearly higher than the value held before."""
    return j > 0 and data[j].high - data[j - 1].mean >= STEP


def _rise_start(data: Sequence[Bucket], i: int) -> int | None:
    """Index of the first reading of the steep rise ending at data[i].

    Water arrives within minutes, so a watering is a run of clearly higher
    readings; a slow drift over hours (condensation, warmth) is not.
    """
    if not _steep(data, i):
        return None
    k = i
    while k > 1 and _steep(data, k - 1):
        k -= 1
    return k


def _restores_level(
    data: Sequence[Bucket], before: float, start: datetime, current: Bucket
) -> bool:
    """Return True if the rise only undoes a drop, like a probe put back in."""
    since = start - EPISODE
    # Strictly before the rise: an hourly bucket holds the rise itself.
    top = max((b.high for b in data if since <= b.start < start), default=before)
    if top - before < RISE:
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
