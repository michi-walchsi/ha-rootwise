"""Reading a sensor's past from a real recorder."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.recorder import Recorder
from homeassistant.components.recorder.models import StatisticMeanType
from homeassistant.components.recorder.statistics import async_import_statistics
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.components.recorder.common import (
    async_wait_recording_done,
)

from custom_components.rootwise.history import async_history

SENSOR = "sensor.probe_soil_moisture"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(recorder_db_url, enable_custom_integrations):
    """Prepare the recorder database before hass starts (overrides conftest)."""


@pytest.fixture
def frozen(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    """A fixed time on a full hour."""
    freezer.move_to("2026-10-03T10:00:00+00:00")
    return freezer


async def test_reads_statistics_and_states(
    recorder_mock: Recorder, hass: HomeAssistant, frozen
) -> None:
    now = dt_util.utcnow()
    hours = [now - timedelta(hours=h) for h in range(48, 2, -1)]
    async_import_statistics(
        hass,
        {
            "has_sum": False,
            "mean_type": StatisticMeanType.ARITHMETIC,
            "name": None,
            "source": "recorder",
            "statistic_id": SENSOR,
            "unit_class": None,
            "unit_of_measurement": "%",
        },
        [
            {"start": start, "mean": 70 - i * 0.1, "min": 69.5 - i * 0.1, "max": 70.5}
            for i, start in enumerate(hours)
        ],
    )
    hass.states.async_set(SENSOR, "64.4", {"unit_of_measurement": "%"})
    frozen.tick(timedelta(minutes=5))
    hass.states.async_set(SENSOR, "64.3", {"unit_of_measurement": "%"})
    await async_wait_recording_done(hass)

    buckets = await async_history(hass, SENSOR, dt_util.utcnow())

    hourly = [b for b in buckets if b.end - b.start == timedelta(hours=1)]
    raw = [b for b in buckets if b.end == b.start]
    assert len(hourly) == len(hours)
    assert hourly[0].start == hours[0]
    assert hourly[0].mean == pytest.approx(70.0)
    assert hourly[0].low == pytest.approx(69.5)
    assert [b.mean for b in raw] == [64.4, 64.3]


async def test_without_recorder(hass: HomeAssistant) -> None:
    assert await async_history(hass, SENSOR, dt_util.utcnow()) == []
