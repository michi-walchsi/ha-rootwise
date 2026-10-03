"""Watering detection on real and synthetic soil moisture curves."""

from datetime import UTC, datetime, timedelta

import pytest

from custom_components.rootwise.engine.detect import detect, detect_drops
from custom_components.rootwise.engine.series import Bucket, hold, merge

T0 = datetime(2026, 9, 1, 12, tzinfo=UTC)


def series(*values: float, step: timedelta = timedelta(minutes=10)) -> list[Bucket]:
    return [Bucket.point(T0 + i * step, v) for i, v in enumerate(values)]


def at(minutes: float) -> datetime:
    return T0 + timedelta(minutes=minutes)


# ---- real data ---------------------------------------------------------------


def test_finds_both_waterings_in_hourly_statistics(hourly) -> None:
    found = detect(hourly, now=hourly[-1].end)
    assert [w.at for w in found] == [
        datetime(2026, 9, 22, 15, tzinfo=UTC),
        datetime(2026, 9, 26, 17, tzinfo=UTC),
    ]
    first, second = found
    assert first.before == pytest.approx(55.1, abs=0.2)
    assert second.before == pytest.approx(59.85, abs=0.2)
    assert first.peak == pytest.approx(88.9, abs=0.2)
    assert second.peak == pytest.approx(92.0, abs=0.2)
    # Field capacity: the level 2 to 6 h later, after the water has drained.
    assert first.settled == pytest.approx(72.5, abs=1.0)
    assert second.settled == pytest.approx(78.9, abs=0.5)


def test_finds_the_minute_of_watering_in_raw_samples(raw) -> None:
    (watering,) = detect(raw, now=raw[-1].start)
    assert watering.at == datetime(2026, 9, 26, 17, 55, 44, 534367, tzinfo=UTC)
    assert watering.before == pytest.approx(59.85)
    assert watering.peak == pytest.approx(92.0)
    assert watering.rise == pytest.approx(19.0, abs=0.5)


def test_sensor_insertion_is_not_a_watering(hourly) -> None:
    # The probe started at 0 % before it went into the soil on 15.09.
    found = detect(hourly[:48], now=hourly[47].end)
    assert found == []


# ---- confirmation ------------------------------------------------------------


def test_waits_an_hour_before_confirming(raw) -> None:
    start = datetime(2026, 9, 26, 17, 55, tzinfo=UTC)
    early = [b for b in raw if b.start <= start + timedelta(minutes=40)]
    assert detect(early, now=start + timedelta(minutes=40)) == []
    later = [b for b in raw if b.start <= start + timedelta(minutes=70)]
    assert len(detect(later, now=start + timedelta(minutes=70))) == 1


def test_brief_spike_is_not_confirmed() -> None:
    # Water on the probe's head or a touched sensor: up and back down at once.
    values = series(50, 50, 50, 70, 51, 50, 50, 50, 50, 50, 50, 50, 50)
    assert detect(values, now=values[-1].start) == []


# ---- robustness --------------------------------------------------------------


def test_daily_wobble_is_not_a_watering() -> None:
    wobble = [50 + (1.5 if i % 12 < 6 else -1.5) for i in range(72)]
    values = series(*wobble, step=timedelta(hours=1))
    assert detect(values, now=values[-1].start) == []


def test_one_episode_counts_once() -> None:
    # Watering in two rounds within an hour.
    values = series(50, 50, 50, 62, 63, 72, 73, 73, 72, 72, 72, 72, 72, 72, 72)
    assert len(detect(values, now=values[-1].start + timedelta(hours=1))) == 1


def test_value_is_held_across_quiet_hours() -> None:
    # Reports only on change: 4 hours silence at 60 %, then watered.
    values = [
        Bucket.point(at(0), 60.5),
        Bucket.point(at(10), 60.0),
        Bucket.point(at(250), 80.0),
        Bucket.point(at(320), 79.0),
        Bucket.point(at(400), 78.8),
    ]
    (watering,) = detect(values, now=at(400))
    assert watering.at == at(250)
    assert watering.before == pytest.approx(60.0)


def test_sensor_pulled_and_put_back_is_not_a_watering() -> None:
    values = series(60, 60, 60, 25, 24, 59.5, 60, 60, 60, 60, 60, 60, 60, 60)
    assert detect(values, now=values[-1].start) == []


def test_sensor_moved_shows_as_drop() -> None:
    values = series(60, 60, 60, 45, 45, 45, 45, 45, 45, 45)
    (drop,) = detect_drops(values, waterings=[])
    assert drop == at(30)


def test_drainage_after_watering_is_no_drop(raw) -> None:
    waterings = detect(raw, now=raw[-1].start)
    assert detect_drops(raw, waterings) == []


# ---- helpers -----------------------------------------------------------------


def test_hold_returns_last_known_value() -> None:
    values = series(10, 20, 30)
    assert hold(values, at(-1)) is None
    assert hold(values, at(15)) == 20
    assert hold(values, at(500)) == 30


def test_merge_lets_finer_data_replace_coarse(hourly, raw) -> None:
    combined = merge(hourly, raw)
    assert combined[0] == hourly[0]
    assert combined[-1] == raw[-1]
    first_raw = raw[0].start
    assert all(b.start >= first_raw for b in combined if b.end == b.start)
    assert not any(b.start >= first_raw and b.end != b.start for b in combined)
    assert merge() == []
