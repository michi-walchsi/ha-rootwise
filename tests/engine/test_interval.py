"""Tests for season-aware base intervals and default thresholds."""

import pytest

from custom_components.rootwise.engine.interval import seasonal_interval
from custom_components.rootwise.engine.thresholds import default_thresholds


@pytest.mark.parametrize(
    ("month", "latitude", "expected"),
    [
        (7, 48.3, 7.0),  # July, Linz: summer
        (1, 48.3, 12.0),  # January, north: winter
        (1, -33.9, 7.0),  # January, south: summer
        (10, 48.3, 12.0),  # October, north: winter half
        (4, 48.3, 7.0),  # April, north: growing season
    ],
)
def test_seasonal_interval(month: int, latitude: float, expected: float) -> None:
    assert seasonal_interval(7, 12, month, latitude) == expected


@pytest.mark.parametrize(
    ("style", "expected"),
    [
        ("dry_out", (10.0, 50.0)),
        ("mostly_dry", (20.0, 60.0)),
        ("slightly_dry", (30.0, 70.0)),
        ("evenly_moist", (40.0, 80.0)),
    ],
)
def test_default_thresholds_by_watering_style(
    style: str, expected: tuple[float, float]
) -> None:
    assert default_thresholds(style) == expected


def test_unknown_watering_style_uses_middle_ground() -> None:
    assert default_thresholds("something_else") == (25.0, 65.0)
