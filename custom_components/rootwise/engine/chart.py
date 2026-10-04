"""Thin a sensor's past into evenly spaced chart points (pure Python).

Each bin gets the time-weighted mean and the range of what was in force in
it. A reading holds until the next one, but at most MAX_HOLD: a sensor that
went silent leaves a visible gap instead of a flat line.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
import math
from typing import Final

from .series import Bucket

MAX_HOLD: Final = timedelta(hours=12)
MAX_POINTS: Final = 180
_HOUR: Final = timedelta(hours=1)


@dataclass(frozen=True, slots=True)
class ChartPoint:
    """One bin of the chart, starting at `at`."""

    at: datetime
    mean: float
    low: float
    high: float


def step_for(span: timedelta) -> timedelta:
    """Return whole hours per bin so the span has at most MAX_POINTS bins."""
    return max(1, math.ceil(span / _HOUR / MAX_POINTS)) * _HOUR


def _segments(buckets: Sequence[Bucket]) -> list[tuple[datetime, datetime, Bucket]]:
    """Return (start, end, bucket): each value holds until the next starts."""
    ordered = sorted(buckets, key=lambda b: b.start)
    segments = []
    for bucket, after in zip(ordered, [*ordered[1:], None], strict=True):
        end = bucket.end + MAX_HOLD
        if after is not None:
            end = min(end, after.start)
        if end > bucket.start:
            segments.append((bucket.start, end, bucket))
    return segments


def resample(
    buckets: Sequence[Bucket], start: datetime, end: datetime, step: timedelta
) -> list[ChartPoint]:
    """Return one point per bin of `step` in [start, end); empty bins are left out."""
    segments = _segments(buckets)
    points = []
    first = 0
    begin = start
    while begin < end:
        stop = min(begin + step, end)
        while first < len(segments) and segments[first][1] <= begin:
            first += 1
        weight = total = 0.0
        low, high = math.inf, -math.inf
        index = first
        while index < len(segments) and segments[index][0] < stop:
            seg_start, seg_end, bucket = segments[index]
            seconds = (min(seg_end, stop) - max(seg_start, begin)).total_seconds()
            if seconds > 0:
                weight += seconds
                total += seconds * bucket.mean
                low, high = min(low, bucket.low), max(high, bucket.high)
            index += 1
        if weight > 0:
            points.append(ChartPoint(begin, total / weight, low, high))
        begin = stop
    return points
