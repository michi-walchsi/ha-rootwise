"""Learn from how a plant is actually watered (pure Python).

The sensor's scale differs per probe and pot, so species defaults are only a
start. After two waterings Rootwise knows two things on the sensor's own
scale: where you water (the level before watering) and the pot's field
capacity (the level after draining).
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timedelta
from itertools import pairwise
import math
from statistics import median
from typing import Final

from .detect import Watering

MIN_WATERINGS: Final = 2
KEEP: Final = 6  # the most recent waterings count
WET_MARGIN: Final = 10.0  # above field capacity before it counts as too wet
DEFAULT_SPAN: Final = 28.0  # dry → too wet when field capacity is unknown
MIN_GAP: Final = 10.0
SAME_WATERING: Final = timedelta(hours=12)
MIN_INTERVALS: Final = 2


def learned_thresholds(waterings: Sequence[Watering]) -> tuple[int, int] | None:
    """Return (dry, wet) on the sensor's scale, or None before two waterings."""
    recent = sorted(waterings, key=lambda w: w.at)[-KEEP:]
    if len(recent) < MIN_WATERINGS:
        return None
    low = median(w.before for w in recent)
    settled = [w.settled for w in recent if w.settled is not None]
    high = median(settled) + WET_MARGIN if settled else low + DEFAULT_SPAN
    high = max(high, low + MIN_GAP)
    return round(low), min(round(high), 100)


def learned_interval(times: Sequence[datetime]) -> float | None:
    """Return the usual days between waterings (rounded to half days)."""
    merged: list[datetime] = []
    for t in sorted(times):
        if not merged or t - merged[-1] >= SAME_WATERING:
            merged.append(t)
    gaps = [
        (b - a) / timedelta(days=1)
        for a, b in pairwise(merged)
        if 0.5 <= (b - a) / timedelta(days=1) <= 60
    ][-5:]
    if len(gaps) < MIN_INTERVALS:
        return None
    return math.floor(median(gaps) * 2 + 0.5) / 2
