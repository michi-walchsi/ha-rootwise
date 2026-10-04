"""Two-point calibration: an honest 0-100 % scale for one pot and probe."""

from datetime import UTC, datetime, timedelta

from custom_components.rootwise.engine.calibration import (
    Calibration,
    field_capacity,
    make,
    style_thresholds,
    suggest,
)
from custom_components.rootwise.engine.detect import Watering, detect
from custom_components.rootwise.engine.series import Bucket, merge

T0 = datetime(2026, 9, 26, 18, 0, tzinfo=UTC)
H = timedelta(hours=1)


def test_percent_and_raw_map_both_ways() -> None:
    scale = Calibration(dry=30, wet=70)
    assert scale.percent(50) == 50
    assert scale.raw(15) == 36
    # Drier than "dry" is still 0 %; a fresh watering may read above 100 %.
    assert scale.percent(20) == 0
    assert scale.percent(80) == 110


def test_points_too_close_make_no_scale() -> None:
    assert make(30, 35) is None
    assert make(30, 41) == Calibration(30, 41)


def test_thresholds_follow_the_watering_style() -> None:
    scale = Calibration(dry=40, wet=80)
    assert style_thresholds(scale, "mostly_dry") == (46, 72)  # 15 % and 80 %
    assert style_thresholds(scale, "evenly_moist") == (60, 79)  # 50 % and 97 %
    assert style_thresholds(scale, "") == style_thresholds(scale, "slightly_dry")


def _watering(before: float, settled: float | None) -> Watering:
    return Watering(at=T0, before=before, peak=95, settled=settled)


def test_suggestion_from_two_cycles() -> None:
    suggestion = suggest([_watering(58, 76), _watering(55, 79)])
    assert suggestion == Calibration(dry=55, wet=77.5)


def test_no_suggestion_without_enough_cycles() -> None:
    assert suggest([_watering(58, 76)]) is None
    assert suggest([_watering(58, None), _watering(55, None)]) is None
    assert suggest([_watering(70, 76), _watering(72, 79)]) is None  # span too small


def _curve() -> list[Bucket]:
    """50 before watering at T0, 90 right after, drained to 78 within two hours."""
    return [
        Bucket.point(T0 - 5 * H, 50),
        Bucket.point(T0, 90),
        Bucket.point(T0 + 0.5 * H, 84),
        Bucket.point(T0 + 1.5 * H, 79),
        Bucket.point(T0 + 2.5 * H, 78),
        Bucket.point(T0 + 4 * H, 77),
    ]


def test_field_capacity_waits_for_the_pot_to_drain() -> None:
    result = field_capacity(_curve(), T0, T0 + H)
    assert result.phase == "draining"
    assert result.value is None


def test_field_capacity_while_measuring() -> None:
    result = field_capacity(_curve(), T0, T0 + 3 * H)
    assert result.phase == "measuring"
    assert result.hours == 1
    assert 78 <= (result.value or 0) <= 79


def test_field_capacity_done_after_six_hours() -> None:
    result = field_capacity(_curve(), T0, T0 + 7 * H)
    assert result.phase == "done"
    assert result.hours == 4
    assert result.value == 77


def test_field_capacity_matches_detection_on_real_data(hourly, raw) -> None:
    data = merge(hourly, raw)
    now = data[-1].start
    found = [w for w in detect(data, now) if w.settled is not None]
    assert found
    for watering in found:
        result = field_capacity(data, watering.at, watering.at + 7 * H)
        assert result.phase == "done"
        assert abs((result.value or 0) - watering.settled) <= 2
