"""Next-watering forecast from the drying trend."""

from datetime import UTC, datetime, timedelta
import math

import pytest

from custom_components.rootwise.engine.forecast import (
    Confidence,
    cycle_rates,
    forecast,
    theil_sen,
)
from custom_components.rootwise.engine.series import Bucket

NOW = datetime(2026, 10, 3, 10, tzinfo=UTC)
HOUR = timedelta(hours=1)


def drying(start_level: float, rate_per_day: float, hours: int, wobble: float = 0.0):
    """Hourly samples ending at NOW, drying linearly (with a daily wobble)."""
    first = NOW - (hours - 1) * HOUR
    out = []
    for i in range(hours):
        t = first + i * HOUR
        value = start_level - rate_per_day * i / 24
        value += wobble * math.sin(2 * math.pi * (t.hour / 24))
        out.append(Bucket.point(t, value))
    return out


def test_theil_sen_ignores_outliers() -> None:
    xs = list(range(10))
    ys = [2.0 * x + 1 for x in xs]
    ys[4] = 100.0
    slope, intercept = theil_sen(xs, ys)
    assert slope == pytest.approx(2.0)
    assert intercept == pytest.approx(1.0)


def test_linear_drying() -> None:
    points = drying(72.0, 2.4, 72)  # 72 h: 72 → 64.9
    result = forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[])
    assert result is not None
    assert result.rate == pytest.approx(2.4, rel=0.01)
    level_now = 72.0 - 2.4 * 71 / 24
    assert result.level == pytest.approx(level_now, abs=0.05)
    expected = NOW + timedelta(days=(level_now - 60.0) / 2.4)
    assert abs(result.due - expected) < timedelta(minutes=30)
    assert result.earliest < result.due < result.latest
    assert result.confidence is Confidence.MEDIUM


def test_daily_wobble_averages_out() -> None:
    points = drying(72.0, 2.2, 96, wobble=1.5)
    result = forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[2.0])
    assert result is not None
    assert result.rate == pytest.approx(2.2, abs=0.25)
    assert result.confidence is Confidence.MEDIUM


def test_learned_rates_raise_confidence_and_narrow_the_window() -> None:
    points = drying(72.0, 2.2, 96)
    loose = forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[])
    sure = forecast(
        points, threshold=60.0, now=NOW, since=None, prior_rates=[2.1, 2.3, 2.2]
    )
    assert loose is not None and sure is not None
    assert sure.confidence is Confidence.HIGH
    assert sure.latest - sure.earliest < loose.latest - loose.earliest


def test_drainage_after_watering_is_left_out() -> None:
    points = drying(80.0, 2.0, 60)
    watered = points[0].start
    # The first hours after watering drop fast while the pot drains.
    drained = [
        Bucket(b.start, b.end, b.low + 8, b.high + 8, b.mean + 8) if i < 4 else b
        for i, b in enumerate(points)
    ]
    result = forecast(drained, threshold=60.0, now=NOW, since=watered, prior_rates=[])
    assert result is not None
    assert result.rate == pytest.approx(2.0, rel=0.02)


def test_too_little_data_without_history_gives_nothing() -> None:
    points = drying(72.0, 2.4, 12)
    assert forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[]) is None


def test_too_little_data_uses_past_cycles() -> None:
    points = drying(72.0, 2.4, 12)
    result = forecast(
        points, threshold=60.0, now=NOW, since=None, prior_rates=[2.0, 2.0]
    )
    assert result is not None
    assert result.confidence is Confidence.LOW
    assert result.rate == pytest.approx(2.0)


def test_soil_that_does_not_dry_gives_nothing() -> None:
    points = drying(65.0, 0.0, 72)
    assert forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[]) is None


def test_already_below_threshold_is_due() -> None:
    points = drying(64.0, 2.4, 72)  # ends at ~56.9
    result = forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[])
    assert result is not None
    assert result.due <= NOW


def test_far_future_is_capped() -> None:
    points = drying(90.0, 0.3, 72)
    result = forecast(points, threshold=20.0, now=NOW, since=None, prior_rates=[])
    assert result is not None
    assert result.due <= NOW + timedelta(days=30)
    assert result.latest <= NOW + timedelta(days=30)


# ---- real data -----------------------------------------------------------------


def test_real_monstera(hourly) -> None:
    watered = datetime(2026, 9, 26, 17, tzinfo=UTC)
    result = forecast(hourly, threshold=60.0, now=NOW, since=watered, prior_rates=[])
    assert result is not None
    assert 1.9 <= result.rate <= 2.6
    # Measured: 64.5 % now, drying ~2.2 points a day → about two days.
    assert (
        datetime(2026, 10, 4, 18, tzinfo=UTC)
        <= result.due
        <= datetime(2026, 10, 6, 6, tzinfo=UTC)
    )


def test_cycle_rates_from_real_waterings(hourly) -> None:
    waterings = [
        datetime(2026, 9, 22, 15, tzinfo=UTC),
        datetime(2026, 9, 26, 17, tzinfo=UTC),
    ]
    rates = cycle_rates(hourly, waterings)
    # One finished cycle (22.09 → 26.09), drying about 2.5 to 3.2 points a day.
    assert len(rates) == 1
    assert 2.3 <= rates[0] <= 3.4


def test_real_monstera_from_raw_samples(raw) -> None:
    # Hundreds of raw reports are averaged per hour before the fit.
    watered = datetime(2026, 9, 26, 17, 55, tzinfo=UTC)
    result = forecast(raw, threshold=60.0, now=NOW, since=watered, prior_rates=[])
    assert result is not None
    assert 1.9 <= result.rate <= 2.6


def test_dense_samples_are_averaged_per_hour() -> None:
    first = NOW - timedelta(hours=72)
    points = [
        Bucket.point(first + i * timedelta(minutes=10), 72.0 - 2.4 * i / 144)
        for i in range(433)
    ]
    result = forecast(points, threshold=60.0, now=NOW, since=None, prior_rates=[])
    assert result is not None
    assert result.rate == pytest.approx(2.4, rel=0.02)
