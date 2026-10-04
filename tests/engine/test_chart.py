"""Thinning a sensor's past into evenly spaced chart points."""

from datetime import UTC, datetime, timedelta

from custom_components.rootwise.engine.chart import resample, step_for
from custom_components.rootwise.engine.series import Bucket, merge

T0 = datetime(2026, 9, 1, tzinfo=UTC)
H = timedelta(hours=1)


def _values(points) -> list[tuple[float, float, float]]:
    return [(p.mean, p.low, p.high) for p in points]


def test_a_reading_holds_until_the_next_one() -> None:
    data = [Bucket.point(T0, 50), Bucket.point(T0 + 3 * H, 40)]
    points = resample(data, T0, T0 + 4 * H, 2 * H)
    # Second bin: one hour at 50, one hour at 40.
    assert _values(points) == [(50, 50, 50), (45, 40, 50)]
    assert [p.at for p in points] == [T0, T0 + 2 * H]


def test_a_long_silence_leaves_a_gap() -> None:
    data = [Bucket.point(T0, 50), Bucket.point(T0 + 30 * H, 40)]
    points = resample(data, T0, T0 + 36 * H, 6 * H)
    # 50 holds for 12 hours, then nothing until the next reading.
    assert [p.at for p in points] == [T0, T0 + 6 * H, T0 + 30 * H]


def test_statistics_keep_their_range() -> None:
    data = [
        Bucket(T0, T0 + H, low=40, high=60, mean=50),
        Bucket(T0 + H, T0 + 2 * H, low=30, high=45, mean=38),
    ]
    assert _values(resample(data, T0, T0 + 2 * H, 2 * H)) == [(44, 30, 60)]


def test_a_reading_from_before_the_range_counts() -> None:
    data = [Bucket.point(T0 - 5 * H, 70), Bucket.point(T0 + H, 60)]
    points = resample(data, T0, T0 + 2 * H, H)
    assert [(p.at, p.mean) for p in points] == [(T0, 70), (T0 + H, 60)]


def test_nothing_before_the_first_reading() -> None:
    assert resample([Bucket.point(T0 + 5 * H, 70)], T0, T0 + 4 * H, H) == []


def test_the_last_bin_ends_with_the_range() -> None:
    data = [Bucket.point(T0, 50), Bucket.point(T0 + 2.5 * H, 30)]
    points = resample(data, T0, T0 + 3 * H, 2 * H)
    # The last bin is one hour long: 30 min at 50, 30 min at 30.
    assert _values(points) == [(50, 50, 50), (40, 30, 50)]


def test_real_data_stays_in_range(hourly, raw) -> None:
    data = merge(hourly, raw)
    end = data[-1].start
    points = resample(data, end - timedelta(days=14), end, step_for(timedelta(days=14)))
    assert 150 <= len(points) <= 168
    assert all(p.low <= p.mean <= p.high for p in points)
    assert all(p.low >= 0 and p.high <= 100 for p in points)


def test_step_keeps_at_most_180_points() -> None:
    assert step_for(timedelta(days=14)) == 2 * H
    assert step_for(timedelta(days=30)) == 4 * H
    assert step_for(timedelta(days=1)) == H
