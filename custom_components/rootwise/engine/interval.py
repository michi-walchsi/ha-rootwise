"""Season-aware base watering interval (pure Python)."""

from __future__ import annotations

# Growing season in the northern hemisphere: April to September.
_GROWING_MONTHS_NORTH = frozenset(range(4, 10))


def seasonal_interval(
    summer_days: float, winter_days: float, month: int, latitude: float
) -> float:
    """Return the base interval for the current season and hemisphere."""
    if latitude < 0:
        month = (month + 5) % 12 + 1
    return float(summer_days if month in _GROWING_MONTHS_NORTH else winter_days)
