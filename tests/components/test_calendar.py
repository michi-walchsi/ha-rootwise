"""The plant care calendar."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from .conftest import subentry_id
from .test_watering import real_hourly

NOW = datetime(2026, 10, 3, 10, tzinfo=UTC)
CALENDAR = "calendar.rootwise_plant_care"


@pytest.fixture
def history(freezer: FrozenDateTimeFactory):
    """Real Monstera history, clock at the end of it."""
    freezer.move_to(NOW)
    with patch(
        "custom_components.rootwise.watering.async_history",
        AsyncMock(return_value=real_hourly()),
    ):
        yield


async def _events(hass: HomeAssistant, start: datetime, end: datetime) -> list[dict]:
    response = await hass.services.async_call(
        "calendar",
        "get_events",
        {
            "entity_id": CALENDAR,
            "start_date_time": start.isoformat(),
            "end_date_time": end.isoformat(),
        },
        blocking=True,
        return_response=True,
    )
    return response[CALENDAR]["events"]


async def test_next_watering_is_an_all_day_event(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    state = hass.states.get(CALENDAR)
    assert state.attributes["message"] == "Water Monstera"
    assert state.attributes["all_day"] is True
    assert state.attributes["start_time"].startswith("2026-10-06")
    assert state.attributes["description"].startswith("Between ")
    assert state.state == "off"  # not today


async def test_past_care_from_the_journal(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    runtime = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    runtime.async_log_care("fertilized", "card", when=NOW - timedelta(days=1))
    events = await _events(hass, NOW - timedelta(days=14), NOW + timedelta(days=7))
    summaries = [e["summary"] for e in events]
    assert summaries == [
        "Monstera: Watered",  # detected on 22.09.
        "Monstera: Watered",  # detected on 26.09.
        "Monstera: Fertilized",
        "Water Monstera",
    ]


async def test_overdue_plant_shows_today(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, entry: MockConfigEntry
) -> None:
    freezer.move_to(NOW)
    runtime = entry.runtime_data.plants[subentry_id(entry, "Efeutute")]
    runtime.async_log_care("watered", "card", when=NOW - timedelta(days=30))
    await hass.async_block_till_done()
    state = hass.states.get(CALENDAR)
    assert state.attributes["message"] == "Water Efeutute"
    assert state.attributes["start_time"].startswith("2026-10-03")
    assert state.state == "on"
