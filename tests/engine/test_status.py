"""Tests for the pure status engine."""

from datetime import UTC, datetime, timedelta

from custom_components.rootwise.engine.status import (
    MoistureLevel,
    MoistureReading,
    PlantInput,
    Status,
    evaluate,
)

NOW = datetime(2026, 9, 27, 10, 0, tzinfo=UTC)


def _sensor(value: float | None, age: timedelta = timedelta(minutes=5)):
    return MoistureReading(value=value, last_reported=NOW - age)


def _input(**kwargs) -> PlantInput:
    base = {"now": NOW, "low": 20.0, "high": 60.0, "interval_days": 7.0}
    base.update(kwargs)
    return PlantInput(**base)


def test_ok_when_moisture_between_thresholds() -> None:
    result = evaluate(_input(moisture=_sensor(38)))
    assert result.status is Status.OK
    assert result.needs_water is False
    assert result.problem is False


def test_thirsty_below_low_threshold() -> None:
    result = evaluate(_input(moisture=_sensor(11)))
    assert result.status is Status.THIRSTY
    assert result.needs_water is True
    assert result.reasons[0].code == "below_threshold"
    assert result.reasons[0].params == {"value": 11, "threshold": 20.0}


def test_thirsty_is_kept_until_low_plus_hysteresis() -> None:
    still = evaluate(_input(moisture=_sensor(22), previous=Status.THIRSTY))
    assert still.status is Status.THIRSTY
    recovered = evaluate(_input(moisture=_sensor(23.5), previous=Status.THIRSTY))
    assert recovered.status is Status.OK


def test_high_moisture_is_not_too_wet_right_after_watering() -> None:
    result = evaluate(_input(moisture=_sensor(85)))
    assert result.status is Status.OK
    assert result.wet_since == NOW


def test_too_wet_after_48_hours_above_high() -> None:
    result = evaluate(_input(moisture=_sensor(85), wet_since=NOW - timedelta(hours=49)))
    assert result.status is Status.TOO_WET
    assert result.problem is True
    assert result.needs_water is False
    assert result.reasons[0].code == "too_wet"


def test_wet_since_resets_only_below_high_minus_hysteresis() -> None:
    since = NOW - timedelta(hours=10)
    kept = evaluate(_input(moisture=_sensor(58), wet_since=since))
    assert kept.wet_since == since
    reset = evaluate(_input(moisture=_sensor(56), wet_since=since))
    assert reset.wet_since is None


def test_sensor_offline_when_unavailable() -> None:
    result = evaluate(_input(moisture=_sensor(None)))
    assert result.status is Status.SENSOR_OFFLINE
    assert result.problem is True
    assert result.reasons[0].code == "sensor_offline"


def test_sensor_offline_when_no_report_for_three_hours() -> None:
    result = evaluate(_input(moisture=_sensor(40, age=timedelta(hours=3, minutes=1))))
    assert result.status is Status.SENSOR_OFFLINE


def test_offline_sensor_falls_back_to_interval() -> None:
    result = evaluate(
        _input(moisture=_sensor(None), last_watered=NOW - timedelta(days=8))
    )
    assert result.status is Status.SENSOR_OFFLINE
    assert result.needs_water is True


def test_sensorless_plant_is_due_after_interval() -> None:
    result = evaluate(_input(last_watered=NOW - timedelta(days=7, hours=1)))
    assert result.status is Status.THIRSTY
    assert result.needs_water is True
    assert result.reasons[0].code == "interval_due"
    assert result.next_due == NOW - timedelta(hours=1)


def test_sensorless_plant_not_due_yet() -> None:
    result = evaluate(_input(last_watered=NOW - timedelta(days=2)))
    assert result.status is Status.OK
    assert result.next_due == NOW + timedelta(days=5)


def test_sensorless_plant_without_history_is_unknown() -> None:
    result = evaluate(_input())
    assert result.status is Status.NO_HISTORY
    assert result.needs_water is False
    assert result.reasons[0].code == "no_history"


def test_snooze_suppresses_needs_water_but_keeps_status() -> None:
    result = evaluate(
        _input(moisture=_sensor(11), snoozed_until=NOW + timedelta(hours=5))
    )
    assert result.status is Status.THIRSTY
    assert result.needs_water is False
    assert "snoozed" in [r.code for r in result.reasons]


def test_expired_snooze_has_no_effect() -> None:
    result = evaluate(
        _input(moisture=_sensor(11), snoozed_until=NOW - timedelta(minutes=1))
    )
    assert result.needs_water is True


def test_recent_watering_log_suppresses_needs_water() -> None:
    result = evaluate(
        _input(moisture=_sensor(11), last_watered=NOW - timedelta(minutes=20))
    )
    assert result.status is Status.THIRSTY
    assert result.needs_water is False
    assert "just_watered" in [r.code for r in result.reasons]


def test_needs_water_returns_after_grace_period() -> None:
    result = evaluate(
        _input(moisture=_sensor(11), last_watered=NOW - timedelta(hours=3, minutes=1))
    )
    assert result.needs_water is True


def test_moisture_level_dry_when_thirsty() -> None:
    assert evaluate(_input(moisture=_sensor(11))).moisture_level is MoistureLevel.DRY


def test_moisture_level_drying_in_lowest_quarter() -> None:
    # low 20, high 60 -> lowest quarter of the band is below 30
    assert evaluate(_input(moisture=_sensor(27))).moisture_level is MoistureLevel.DRYING


def test_moisture_level_ok_inside_band() -> None:
    assert evaluate(_input(moisture=_sensor(45))).moisture_level is MoistureLevel.OK


def test_moisture_level_fresh_after_watering() -> None:
    result = evaluate(_input(moisture=_sensor(77), wet_since=NOW - timedelta(hours=20)))
    assert result.status is Status.OK
    assert result.moisture_level is MoistureLevel.FRESH
    assert result.problem is False


def test_moisture_level_too_wet_after_48_hours() -> None:
    result = evaluate(_input(moisture=_sensor(77), wet_since=NOW - timedelta(hours=49)))
    assert result.moisture_level is MoistureLevel.TOO_WET


def test_moisture_level_none_without_sensor_reading() -> None:
    assert evaluate(_input()).moisture_level is None
    assert evaluate(_input(moisture=_sensor(None))).moisture_level is None
