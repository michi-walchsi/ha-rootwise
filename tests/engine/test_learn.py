"""Thresholds and intervals learned from how a plant is actually watered."""

from datetime import UTC, datetime, timedelta

from custom_components.rootwise.engine.detect import Watering, detect
from custom_components.rootwise.engine.learn import learned_interval, learned_thresholds

T0 = datetime(2026, 9, 1, tzinfo=UTC)


def watering(day: float, before: float, settled: float | None) -> Watering:
    return Watering(
        at=T0 + timedelta(days=day), before=before, peak=90, settled=settled
    )


def test_needs_two_waterings() -> None:
    assert learned_thresholds([watering(0, 58, 78)]) is None


def test_dry_is_where_you_water_wet_is_above_field_capacity() -> None:
    result = learned_thresholds(
        [watering(0, 55, 72), watering(4, 60, 79), watering(9, 58, 77)]
    )
    assert result is not None
    low, high = result
    assert low == 58  # median of the levels before watering
    assert high == 87  # median field capacity (77) + 10


def test_recent_waterings_count() -> None:
    old = [watering(i, 30, 60) for i in range(6)]
    new = [watering(10 + i, 58, 78) for i in range(6)]
    assert learned_thresholds(old + new) == (58, 88)


def test_keeps_a_sensible_gap() -> None:
    result = learned_thresholds([watering(0, 70, 72), watering(3, 71, 73)])
    assert result is not None
    low, high = result
    assert high - low >= 10


def test_unknown_field_capacity_uses_peak_free_default() -> None:
    result = learned_thresholds([watering(0, 55, None), watering(4, 59, None)])
    assert result is not None
    low, high = result
    assert low == 57
    assert high == 85  # low + 28 without a measured field capacity


def test_real_monstera(hourly) -> None:
    found = detect(hourly, now=hourly[-1].end)
    assert learned_thresholds(found) == (57, 85)


def test_interval_from_watering_times() -> None:
    days = [0, 7, 14.5, 21.5]
    times = [T0 + timedelta(days=d) for d in days]
    assert learned_interval(times) == 7.0


def test_interval_needs_two_gaps_and_ignores_double_taps() -> None:
    assert learned_interval([T0, T0 + timedelta(days=7)]) is None
    times = [
        T0,
        T0 + timedelta(hours=2),
        T0 + timedelta(days=7),
        T0 + timedelta(days=14),
    ]
    assert learned_interval(times) == 7.0
