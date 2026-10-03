"""Detection, learning and forecast inside Home Assistant."""

import csv
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.rootwise.engine.series import Bucket

from .conftest import EFEUTUTE, subentry_id

FIXTURES = Path(__file__).parent.parent / "fixtures"
NOW = datetime(2026, 10, 3, 10, tzinfo=UTC)
HOUR = timedelta(hours=1)


def real_hourly() -> list[Bucket]:
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


@pytest.fixture
def at_now(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    """Freeze the clock at the end of the real data."""
    freezer.move_to(NOW)
    return freezer


@pytest.fixture
def history(at_now):
    """The recorder returns the Monstera's real hourly statistics."""
    with patch(
        "custom_components.rootwise.watering.async_history",
        AsyncMock(return_value=real_hourly()),
    ) as mock:
        yield mock


def journal(entry: MockConfigEntry, name: str) -> list[dict]:
    store = entry.runtime_data.storage
    return store.entries(subentry_id(entry, name), 50)


async def test_finds_past_waterings_and_logs_them(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    watered = [e for e in journal(entry, "Monstera") if e["type"] == "watered"]
    assert [(e["ts"], e["source"]) for e in watered] == [
        ("2026-09-26T17:00:00+00:00", "auto"),
        ("2026-09-22T15:00:00+00:00", "auto"),
    ]
    assert watered[0]["data"]["before"] == pytest.approx(59.9, abs=0.1)
    assert watered[0]["data"]["settled"] == pytest.approx(78.7, abs=0.1)
    history.assert_awaited_once()


async def test_learned_thresholds_replace_species_defaults(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    assert hass.states.get("number.monstera_dry_threshold").state == "57.0"
    assert hass.states.get("number.monstera_wet_threshold").state == "85.0"
    mirror = hass.states.get("sensor.monstera_soil_moisture")
    assert mirror.attributes["range_source"] == "learned"


async def test_own_thresholds_win(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    await hass.services.async_call(
        "number",
        "set_value",
        {"entity_id": "number.monstera_dry_threshold", "value": 60},
        blocking=True,
    )
    assert hass.states.get("number.monstera_dry_threshold").state == "60.0"
    mirror = hass.states.get("sensor.monstera_soil_moisture")
    assert mirror.attributes["range_source"] == "custom"


async def test_next_watering_forecast(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    state = hass.states.get("sensor.monstera_next_watering")
    due = datetime.fromisoformat(state.state)
    # 64.5 % now, learned dry threshold 57 %, about 2.2 points a day.
    assert (
        datetime(2026, 10, 6, tzinfo=UTC) <= due <= datetime(2026, 10, 7, 6, tzinfo=UTC)
    )
    assert state.attributes["method"] == "trend"
    assert state.attributes["confidence"] in ("medium", "high")
    assert state.attributes["earliest"] < state.state < state.attributes["latest"]
    assert 1.9 <= state.attributes["rate"] <= 2.6


async def test_manual_entry_is_not_doubled(
    hass: HomeAssistant, at_now, entry: MockConfigEntry
) -> None:
    runtime = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    runtime.async_log_care(
        "watered", "card", when=datetime(2026, 9, 26, 16, tzinfo=UTC)
    )
    with patch(
        "custom_components.rootwise.watering.async_history",
        AsyncMock(return_value=real_hourly()),
    ):
        await runtime.tracker.async_load()
    sources = [
        e["source"] for e in journal(entry, "Monstera") if e["type"] == "watered"
    ]
    assert sorted(sources) == ["auto", "card"]  # only 22.09 is added


async def test_rejected_watering_stays_gone(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    runtime = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    auto = journal(entry, "Monstera")[0]
    runtime.async_delete_entry(auto["id"])
    await runtime.tracker.async_load()
    times = [e["ts"] for e in journal(entry, "Monstera")]
    assert auto["ts"] not in times


async def test_manual_watering_replaces_a_detected_one(
    hass: HomeAssistant, history, entry: MockConfigEntry
) -> None:
    await hass.async_block_till_done()
    runtime = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    runtime.async_log_care(
        "watered", "card", when=datetime(2026, 9, 26, 18, tzinfo=UTC)
    )
    sources = [
        (e["ts"][:10], e["source"])
        for e in journal(entry, "Monstera")
        if e["type"] == "watered"
    ]
    assert sorted(sources) == [("2026-09-22", "auto"), ("2026-09-26", "card")]


async def test_live_watering_is_detected_after_an_hour(
    hass: HomeAssistant,
    at_now,
    entry: MockConfigEntry,
    set_moisture,
) -> None:
    events = async_capture_events(hass, "rootwise_watering_detected")
    # Two and a half quiet hours, then water arrives within minutes.
    for value in ("40.2", "40.1", "40.2", "40.1", "40.0"):
        set_moisture(value)
        at_now.tick(timedelta(minutes=30))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    for value in ("58", "71", "66", "64", "63.5"):
        set_moisture(value)
        at_now.tick(timedelta(minutes=15))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    at_now.tick(timedelta(minutes=30))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    watered = [e for e in journal(entry, "Monstera") if e["type"] == "watered"]
    assert len(watered) == 1
    assert watered[0]["source"] == "auto"
    assert len(events) == 1
    assert events[0].data["before"] == pytest.approx(40.0)
    assert hass.states.get("sensor.monstera_status").state == "ok"


@pytest.mark.parametrize("monstera_data", [{**EFEUTUTE}])
async def test_plant_without_sensor_learns_its_interval(
    hass: HomeAssistant, at_now, entry: MockConfigEntry
) -> None:
    runtime = entry.runtime_data.plants[subentry_id(entry, "Efeutute")]
    for days in (21, 12, 3):
        runtime.async_log_care("watered", "card", when=NOW - timedelta(days=days))
    await hass.async_block_till_done()
    assert hass.states.get("number.efeutute_watering_interval").state == "9.0"
    due = datetime.fromisoformat(hass.states.get("sensor.efeutute_next_watering").state)
    assert due == NOW - timedelta(days=3) + timedelta(days=9)
    assert (
        hass.states.get("sensor.efeutute_next_watering").attributes["method"]
        == "interval"
    )
