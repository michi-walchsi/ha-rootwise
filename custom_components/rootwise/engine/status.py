"""Plant status from moisture readings or the watering interval (pure Python)."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import StrEnum

STALE_AFTER = timedelta(hours=3)
TOO_WET_AFTER = timedelta(hours=48)
HYSTERESIS = 3.0
WATERED_GRACE = timedelta(hours=3)


class Status(StrEnum):
    """Overall plant status."""

    OK = "ok"
    THIRSTY = "thirsty"
    TOO_WET = "too_wet"
    SENSOR_OFFLINE = "sensor_offline"
    NO_HISTORY = "no_history"


@dataclass(frozen=True, slots=True)
class Reason:
    """Why a plant has its status; the UI localizes the code."""

    code: str
    params: Mapping[str, float | str] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class MoistureReading:
    """Latest soil moisture value; ``value`` is None when unavailable."""

    value: float | None
    last_reported: datetime | None


@dataclass(frozen=True, slots=True)
class PlantInput:
    """Everything the status evaluation needs."""

    now: datetime
    low: float
    high: float
    interval_days: float
    moisture: MoistureReading | None = None
    last_watered: datetime | None = None
    snoozed_until: datetime | None = None
    previous: Status | None = None
    wet_since: datetime | None = None


@dataclass(frozen=True, slots=True)
class PlantStatus:
    """Result of one evaluation."""

    status: Status
    reasons: tuple[Reason, ...]
    needs_water: bool
    problem: bool
    wet_since: datetime | None = None
    next_due: datetime | None = None


def evaluate(inp: PlantInput) -> PlantStatus:
    """Evaluate the plant status."""
    next_due = (
        inp.last_watered + timedelta(days=inp.interval_days)
        if inp.last_watered is not None
        else None
    )
    interval_due = next_due is not None and next_due <= inp.now

    if inp.moisture is None:
        status, reasons, wet_since = _from_interval(inp, next_due, interval_due)
    elif _is_offline(inp.moisture, inp.now):
        status = Status.SENSOR_OFFLINE
        reasons = [Reason("sensor_offline")]
        wet_since = inp.wet_since
    else:
        status, reasons, wet_since = _from_moisture(inp)

    wants_water = status is Status.THIRSTY or (
        status is Status.SENSOR_OFFLINE and interval_due
    )
    snoozed = inp.snoozed_until is not None and inp.snoozed_until > inp.now
    if snoozed:
        reasons.append(Reason("snoozed"))
    # A fresh watering log wins until the sensor catches up (reports are hourly).
    just_watered = (
        inp.moisture is not None
        and inp.last_watered is not None
        and inp.now - inp.last_watered < WATERED_GRACE
    )
    if just_watered and wants_water:
        reasons.append(Reason("just_watered"))

    return PlantStatus(
        status=status,
        reasons=tuple(reasons),
        needs_water=wants_water and not snoozed and not just_watered,
        problem=status in (Status.TOO_WET, Status.SENSOR_OFFLINE),
        wet_since=wet_since,
        next_due=next_due,
    )


def _is_offline(reading: MoistureReading, now: datetime) -> bool:
    if reading.value is None or reading.last_reported is None:
        return True
    return now - reading.last_reported > STALE_AFTER


def _from_moisture(
    inp: PlantInput,
) -> tuple[Status, list[Reason], datetime | None]:
    assert inp.moisture is not None and inp.moisture.value is not None
    value = inp.moisture.value

    if value > inp.high:
        wet_since = inp.wet_since or inp.now
    elif value < inp.high - HYSTERESIS:
        wet_since = None
    else:
        wet_since = inp.wet_since

    low_limit = inp.low + HYSTERESIS if inp.previous is Status.THIRSTY else inp.low
    if value < low_limit:
        return (
            Status.THIRSTY,
            [Reason("below_threshold", {"value": value, "threshold": inp.low})],
            wet_since,
        )
    if wet_since is not None and inp.now - wet_since >= TOO_WET_AFTER:
        return (
            Status.TOO_WET,
            [Reason("too_wet", {"value": value, "threshold": inp.high})],
            wet_since,
        )
    return Status.OK, [], wet_since


def _from_interval(
    inp: PlantInput, next_due: datetime | None, interval_due: bool
) -> tuple[Status, list[Reason], None]:
    if next_due is None:
        return Status.NO_HISTORY, [Reason("no_history")], None
    if interval_due:
        return (
            Status.THIRSTY,
            [Reason("interval_due", {"days": inp.interval_days})],
            None,
        )
    return Status.OK, [], None
