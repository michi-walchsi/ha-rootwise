"""When will the plant need water? A robust trend over the last days (pure Python).

The drying rate comes from a Theil-Sen line (median of pairwise slopes), so a
daily wobble or a single odd reading barely moves it. The hours right after a
watering are left out: the pot is still draining. Rates of earlier cycles
help while the current one is young and set the uncertainty window.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum
from itertools import pairwise
from statistics import median
from typing import Final

from .series import Bucket

WINDOW: Final = timedelta(hours=96)
DRAINAGE: Final = timedelta(hours=6)
MIN_SPAN: Final = timedelta(hours=24)
MIN_POINTS: Final = 16
MIN_RATE: Final = 0.2  # points per day; slower counts as "not drying"
HORIZON: Final = timedelta(days=30)
SPREAD: Final = 0.3  # ± on the rate while there is no history
MIN_SPREAD: Final = 0.1
MAX_POINTS: Final = 200
_HOUR: Final = timedelta(hours=1)


class Confidence(StrEnum):
    """How much to trust the forecast."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass(frozen=True, slots=True)
class Forecast:
    """The next watering, with a window."""

    due: datetime
    earliest: datetime
    latest: datetime
    rate: float  # drying, points per day
    level: float  # fitted level now
    confidence: Confidence


def theil_sen(xs: Sequence[float], ys: Sequence[float]) -> tuple[float, float]:
    """Return (slope, intercept): median of pairwise slopes, then median offset."""
    slopes = [
        (ys[j] - ys[i]) / (xs[j] - xs[i])
        for i in range(len(xs))
        for j in range(i + 1, len(xs))
        if xs[j] != xs[i]
    ]
    slope = median(slopes) if slopes else 0.0
    intercept = median(y - slope * x for x, y in zip(xs, ys, strict=True))
    return slope, intercept


def _points(
    buckets: Sequence[Bucket], start: datetime, end: datetime
) -> list[tuple[datetime, float]]:
    """(time, value) between start and end; long raw series become hourly means."""
    points = sorted(
        (b.start + (b.end - b.start) / 2, b.mean)
        for b in buckets
        if start <= b.start + (b.end - b.start) / 2 <= end
    )
    if len(points) <= MAX_POINTS:
        return points
    hours: dict[datetime, list[float]] = {}
    for t, v in points:
        hours.setdefault(t.replace(minute=0, second=0, microsecond=0), []).append(v)
    return [(t + _HOUR / 2, sum(v) / len(v)) for t, v in sorted(hours.items())]


def _trend(
    points: Sequence[tuple[datetime, float]], now: datetime
) -> tuple[float, float]:
    """Return (rate per day, level now) of the robust line through the points."""
    origin = points[0][0]
    xs = [(t - origin) / _HOUR for t, _ in points]
    slope, intercept = theil_sen(xs, [v for _, v in points])
    return -slope * 24, slope * ((now - origin) / _HOUR) + intercept


def forecast(
    buckets: Sequence[Bucket],
    threshold: float,
    now: datetime,
    since: datetime | None,
    prior_rates: Sequence[float],
) -> Forecast | None:
    """Return when the soil reaches the threshold, or None if it cannot say."""
    start = now - WINDOW
    if since is not None:
        start = max(start, since + DRAINAGE)
    points = _points(buckets, start, now)
    span = points[-1][0] - points[0][0] if points else timedelta()
    if len(points) >= MIN_POINTS and span >= MIN_SPAN:
        trend, level = _trend(points, now)
        if prior_rates:
            weight = min(max((span - MIN_SPAN) / MIN_SPAN, 0.0), 1.0)
            rate = weight * trend + (1 - weight) * median(prior_rates)
        else:
            rate = trend
        confidence = (
            Confidence.HIGH
            if span >= 2 * MIN_SPAN and len(prior_rates) >= 2
            else Confidence.MEDIUM
        )
        seen = [trend, *prior_rates]
    elif prior_rates and points:
        level = points[-1][1]
        rate = median(prior_rates)
        confidence = Confidence.LOW
        seen = list(prior_rates)
    else:
        return None
    if rate < MIN_RATE:
        return None

    due = now + timedelta(days=(level - threshold) / rate)
    if len(seen) >= 3:
        fast, slow = max(seen), min(seen)
    else:
        fast, slow = rate * (1 + SPREAD), rate * (1 - SPREAD)
    fast = max(fast, rate * (1 + MIN_SPREAD))
    slow = max(min(slow, rate * (1 - MIN_SPREAD)), MIN_RATE / 2)
    remaining = level - threshold
    if remaining <= 0:
        earliest, latest = due, now
    else:
        earliest = now + timedelta(days=remaining / fast)
        latest = now + timedelta(days=remaining / slow)
    limit = now + HORIZON
    return Forecast(
        due=min(due, limit),
        earliest=min(earliest, limit),
        latest=min(latest, limit),
        rate=rate,
        level=level,
        confidence=confidence,
    )


def cycle_rates(
    buckets: Sequence[Bucket], waterings: Sequence[datetime]
) -> list[float]:
    """Return the drying rate (points per day) of every finished cycle."""
    rates: list[float] = []
    ordered = sorted(waterings)
    for begin, end in pairwise(ordered):
        points = _points(buckets, begin + DRAINAGE, end - _HOUR)
        if len(points) < MIN_POINTS or points[-1][0] - points[0][0] < MIN_SPAN:
            continue
        rate, _ = _trend(points, points[-1][0])
        if rate >= MIN_RATE:
            rates.append(rate)
    return rates
