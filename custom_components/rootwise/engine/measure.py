"""Measurement ranges, ratings with hysteresis, and display rounding (pure Python)."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
import math


class Rating(StrEnum):
    """How a measurement compares to the plant's target range."""

    LOW = "low"
    OK = "ok"
    HIGH = "high"


@dataclass(frozen=True, slots=True)
class Range:
    """Target range; either end may be open (None)."""

    min: float | None
    max: float | None


# How far a value must come back into the range before a rating clears.
HYSTERESIS: Mapping[str, float] = {
    "soil_moisture": 3.0,
    "temperature": 0.5,
    "air_humidity": 2.0,
    "illuminance": 50.0,
    "conductivity": 50.0,
    "battery": 2.0,
}


def rate(
    value: float,
    target: Range,
    previous: Rating | None = None,
    hysteresis: float = 0.0,
) -> Rating:
    """Rate one value; a previous LOW/HIGH sticks until it clears the band."""
    if target.min is not None:
        limit = target.min + hysteresis if previous is Rating.LOW else target.min
        if value < limit:
            return Rating.LOW
    if target.max is not None:
        limit = target.max - hysteresis if previous is Rating.HIGH else target.max
        if value > limit:
            return Rating.HIGH
    return Rating.OK


def rate_all(
    values: Mapping[str, float | None],
    ranges: Mapping[str, Range],
    previous: Mapping[str, Rating],
) -> dict[str, Rating]:
    """Rate every measurement that has both a value and a range."""
    result: dict[str, Rating] = {}
    for key, value in values.items():
        target = ranges.get(key)
        if value is None or target is None:
            continue
        result[key] = rate(value, target, previous.get(key), HYSTERESIS.get(key, 0.0))
    return result


def _significant(value: float, digits: int) -> float:
    if value == 0:
        return 0.0
    magnitude = math.floor(math.log10(abs(value)))
    factor = 10.0 ** (digits - 1 - magnitude)
    return round(value * factor) / factor


def round_value(key: str, value: float) -> float | int:
    """Round for display and to avoid needless state writes.

    Whole-number measurements come back as int so the state reads "41", not "41.0".
    """
    if key == "temperature":
        return round(value, 1)
    if key == "illuminance":
        lux = _significant(value, 2)
        return int(lux) if abs(lux) >= 10 else lux
    if key == "conductivity":
        return int(round(value, -1))
    return round(value)
