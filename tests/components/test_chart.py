"""Chart data for the panel and the plant card."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.engine.series import Bucket

from .conftest import Client, subentry_id

H = timedelta(hours=1)


def _feed_history(entry: MockConfigEntry, plant_id: str, hours: int) -> None:
    """Give the tracker hourly statistics: drying from 80 by 0.5 per hour."""
    now = dt_util.utcnow()
    start = now - hours * H
    tracker = entry.runtime_data.plants[plant_id].tracker
    tracker.history = [
        Bucket(
            start + i * H, start + (i + 1) * H, 79.5 - i / 2, 80.5 - i / 2, 80 - i / 2
        )
        for i in range(hours)
    ]


async def test_history(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client: Client,
    freezer: FrozenDateTimeFactory,
) -> None:
    # Frozen: the bins line up with the hourly statistics.
    plant_id = subentry_id(entry, "Monstera")
    _feed_history(entry, plant_id, 72)
    watered = dt_util.utcnow() - 30 * H
    await client.result(
        "rootwise/care/log",
        plant_id=plant_id,
        care_type="watered",
        when=watered.isoformat(),
    )
    await client.result("rootwise/care/log", plant_id=plant_id, care_type="fertilized")

    result = await client.result("rootwise/plant/history", plant_id=plant_id, days=14)

    assert result["step"] == 2 * 3600
    assert dt_util.parse_datetime(result["end"]) - dt_util.parse_datetime(
        result["start"]
    ) == timedelta(days=14)
    # 72 hours of statistics in 2-hour bins; the live reading (38) holds after them.
    assert 36 <= len(result["points"]) <= 38
    ts, mean, low, high = result["points"][0]
    assert isinstance(ts, int)
    assert low <= mean <= high
    assert result["points"][0][1] == 79.8  # mean of 80 and 79.5, rounded
    assert [e["type"] for e in result["events"]] == ["watered", "fertilized"]
    assert result["events"][0]["source"] == "card"
    assert result["thresholds"]["low"] < result["thresholds"]["high"]
    assert "forecast" in result


async def test_history_without_soil_sensor(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Efeutute")
    result = await client.result("rootwise/plant/history", plant_id=plant_id)
    assert result["points"] == []
    assert result["thresholds"] is None
    assert result["forecast"] is None


async def test_history_old_events_are_left_out(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    old = dt_util.utcnow() - timedelta(days=20)
    await client.result(
        "rootwise/care/log",
        plant_id=plant_id,
        care_type="watered",
        when=old.isoformat(),
    )
    result = await client.result("rootwise/plant/history", plant_id=plant_id, days=14)
    assert result["events"] == []
    result = await client.result("rootwise/plant/history", plant_id=plant_id, days=30)
    assert [e["type"] for e in result["events"]] == ["watered"]


async def test_history_is_readable_for_read_only_users(
    hass: HomeAssistant, entry: MockConfigEntry, read_only_client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    result = await read_only_client.result("rootwise/plant/history", plant_id=plant_id)
    assert result["step"] == 2 * 3600


async def test_history_unknown_plant(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    response = await client.call("rootwise/plant/history", plant_id="nope")
    assert response["error"]["code"] == "not_found"
