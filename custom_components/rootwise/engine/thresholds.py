"""Default moisture thresholds on the raw sensor scale (pure Python).

Uncalibrated starting points by watering style; users adjust them per plant and
the calibration assistant (phase 2) replaces them.
"""

from __future__ import annotations

_BY_STYLE: dict[str, tuple[float, float]] = {
    "dry_out": (10.0, 50.0),
    "mostly_dry": (20.0, 60.0),
    "slightly_dry": (30.0, 70.0),
    "evenly_moist": (40.0, 80.0),
}
_FALLBACK = (25.0, 65.0)


def default_thresholds(watering_style: str) -> tuple[float, float]:
    """Return (low, high) for a watering style."""
    return _BY_STYLE.get(watering_style, _FALLBACK)
