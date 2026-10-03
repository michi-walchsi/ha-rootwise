"""Real soil moisture data (ThirdReality probe in a Monstera, Sept/Oct 2026)."""

import csv
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from custom_components.rootwise.engine.series import Bucket

FIXTURES = Path(__file__).parent.parent / "fixtures"
HOUR = timedelta(hours=1)


def load_hourly() -> list[Bucket]:
    """Hourly long-term statistics (mean/min/max) since the probe went in."""
    with (FIXTURES / "soil_hourly.csv").open(encoding="utf-8") as f:
        return [
            Bucket(
                start=(start := datetime.fromisoformat(r["start"])),
                end=start + HOUR,
                low=float(r["min"]),
                high=float(r["max"]),
                mean=float(r["mean"]),
            )
            for r in csv.DictReader(f)
        ]


def load_raw() -> list[Bucket]:
    """Every reported value of the last ten days (the probe reports on change)."""
    with (FIXTURES / "soil_raw.csv").open(encoding="utf-8") as f:
        return [
            Bucket.point(datetime.fromisoformat(r["time"]), float(r["value"]))
            for r in csv.DictReader(f)
        ]


@pytest.fixture(scope="session")
def hourly() -> list[Bucket]:
    """Hourly statistics fixture."""
    return load_hourly()


@pytest.fixture(scope="session")
def raw() -> list[Bucket]:
    """Raw samples fixture."""
    return load_raw()
