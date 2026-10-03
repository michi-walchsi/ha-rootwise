"""One format for raw samples and statistics buckets (pure Python).

A raw sample is a bucket of zero length; an hourly or 5-minute statistic is a
bucket with its min, max and mean. Many probes report only on change, so a
value holds until the next one arrives ("sample and hold").
"""

from __future__ import annotations

from bisect import bisect_right
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Bucket:
    """Values seen in [start, end); for a raw sample start == end."""

    start: datetime
    end: datetime
    low: float
    high: float
    mean: float

    @classmethod
    def point(cls, at: datetime, value: float) -> Bucket:
        """Return a raw sample."""
        return cls(at, at, value, value, value)


def hold(buckets: Sequence[Bucket], at: datetime) -> float | None:
    """Return the value in force at a time: the last bucket started by then."""
    index = bisect_right([b.start for b in buckets], at) - 1
    return buckets[index].mean if index >= 0 else None


def merge(*layers: Sequence[Bucket]) -> list[Bucket]:
    """Combine coarse and fine data: each later layer replaces the time it covers.

    Pass the coarsest first (hourly statistics), then finer ones (5-minute
    statistics, raw samples).
    """
    result: list[Bucket] = []
    for layer in layers:
        if not layer:
            continue
        begin = min(b.start for b in layer)
        result = [b for b in result if b.start < begin] + list(layer)
    return sorted(result, key=lambda b: b.start)
