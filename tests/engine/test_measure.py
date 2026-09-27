"""Tests for measurement ranges, ratings and rounding."""

import pytest

from custom_components.rootwise.engine.measure import (
    Range,
    Rating,
    rate,
    rate_all,
    round_value,
)


def test_value_inside_range_is_ok() -> None:
    assert rate(22.0, Range(12, 32)) is Rating.OK


def test_value_below_min_is_low() -> None:
    assert rate(10.0, Range(12, 32)) is Rating.LOW


def test_value_above_max_is_high() -> None:
    assert rate(35.0, Range(12, 32)) is Rating.HIGH


def test_open_ranges() -> None:
    assert rate(95.0, Range(50, None)) is Rating.OK
    assert rate(10.0, Range(None, 60)) is Rating.OK
    assert rate(10.0, Range(None, None)) is Rating.OK


def test_zero_is_a_valid_value() -> None:
    assert rate(0.0, Range(15, 60)) is Rating.LOW


def test_hysteresis_keeps_low_until_min_plus_band() -> None:
    assert rate(12.3, Range(12, 32), Rating.LOW, hysteresis=0.5) is Rating.LOW
    assert rate(12.6, Range(12, 32), Rating.LOW, hysteresis=0.5) is Rating.OK


def test_hysteresis_keeps_high_until_max_minus_band() -> None:
    assert rate(31.8, Range(12, 32), Rating.HIGH, hysteresis=0.5) is Rating.HIGH
    assert rate(31.4, Range(12, 32), Rating.HIGH, hysteresis=0.5) is Rating.OK


def test_rate_all_skips_missing_values_and_ranges() -> None:
    result = rate_all(
        values={"temperature": 11.0, "air_humidity": None, "battery": 80.0},
        ranges={"temperature": Range(12, 32), "air_humidity": Range(50, None)},
        previous={},
    )
    assert result == {"temperature": Rating.LOW}


def test_rate_all_uses_previous_for_hysteresis() -> None:
    result = rate_all(
        values={"air_humidity": 51.0},
        ranges={"air_humidity": Range(50, None)},
        previous={"air_humidity": Rating.LOW},
    )
    assert result == {"air_humidity": Rating.LOW}


@pytest.mark.parametrize(
    ("key", "value", "expected"),
    [
        ("soil_moisture", 77.03, 77.0),
        ("temperature", 24.824, 24.8),
        ("air_humidity", 41.14, 41.0),
        ("illuminance", 12345.0, 12000.0),
        ("illuminance", 87.4, 87.0),
        ("illuminance", 0.0, 0.0),
        ("conductivity", 1234.0, 1230.0),
        ("battery", 99.6, 100.0),
    ],
)
def test_round_value(key: str, value: float, expected: float) -> None:
    assert round_value(key, value) == expected
