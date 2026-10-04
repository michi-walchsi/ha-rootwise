"""Calibration in Home Assistant: points, field capacity, thresholds, payload."""

from collections.abc import Awaitable, Callable
from datetime import datetime, timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    MockUser,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.rootwise.engine.detect import Watering

from .conftest import Client, subentry_id

T0 = dt_util.parse_datetime("2026-10-04T08:00:00+00:00")
assert T0 is not None


def _tomorrow() -> datetime:
    """A start after the plant's setup reading, which happened in real time."""
    return dt_util.utcnow().replace(minute=0, second=0, microsecond=0) + timedelta(
        days=1
    )


@pytest.fixture
def connect(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, hass_admin_user: MockUser
) -> Callable[[], Awaitable[Client]]:
    """A new admin connection: tokens expire when the tests move the clock."""

    async def _connect() -> Client:
        refresh = await hass.auth.async_create_refresh_token(
            hass_admin_user, "https://example.com/"
        )
        token = hass.auth.async_create_access_token(refresh)
        return Client(await hass_ws_client(hass, access_token=token))

    return _connect


async def _plant(client: Client, name: str = "Monstera") -> dict:
    result = await client.result("rootwise/plants")
    return next(p for p in result["plants"] if p["name"] == name)


async def _at(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, when: datetime
) -> None:
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


async def _soak(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    set_moisture: Callable[[str], None],
    start: datetime,
) -> None:
    """Probe readings after a thorough watering at `start`: 88, drains to 71."""
    for minutes, value in ((5, "88"), (30, "80"), (90, "74"), (150, "72"), (240, "71")):
        freezer.move_to(start + timedelta(minutes=minutes))
        set_moisture(value)
        await hass.async_block_till_done()


async def test_dry_then_wet_gives_a_scale_and_style_thresholds(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client: Client,
    set_moisture,
    freezer: FrozenDateTimeFactory,
    connect: Callable[[], Awaitable[Client]],
) -> None:
    start = _tomorrow()
    freezer.move_to(start)
    plant_id = subentry_id(entry, "Monstera")
    set_moisture("31")
    await hass.async_block_till_done()

    state = await client.result("rootwise/calibration/dry", plant_id=plant_id)
    assert state["pending"]["phase"] == "need_wet"
    assert state["pending"]["dry"] == 31
    assert state["style"] == "mostly_dry"
    assert state["scale"] == [15, 80]

    state = await client.result("rootwise/calibration/wet", plant_id=plant_id)
    assert state["pending"]["phase"] == "draining"
    assert (await _plant(client))["last_watered"] is not None

    await _soak(hass, freezer, set_moisture, start)
    freezer.move_to(start + timedelta(hours=3))
    client = await connect()
    state = await client.result("rootwise/calibration/get", plant_id=plant_id)
    assert state["pending"]["phase"] == "measuring"
    assert state["pending"]["hours"] == 1
    assert 72 <= state["pending"]["value"] <= 74

    await _at(hass, freezer, start + timedelta(hours=7, seconds=7))
    client = await connect()
    plant = await _plant(client)
    assert plant["calibration"]["dry"] == 31
    assert plant["calibration"]["wet"] == 71
    assert plant["calibration"]["outdated"] is False
    assert plant["thresholds"]["source"] == "calibrated"
    # mostly_dry: water below 15 %, too wet above 80 % of 31-71
    assert (plant["thresholds"]["low"], plant["thresholds"]["high"]) == (37, 63)
    assert plant["measurements"]["soil_moisture"]["calibrated"] == 100
    state = await client.result("rootwise/calibration/get", plant_id=plant_id)
    assert state["pending"] is None

    history = await client.result("rootwise/plant/history", plant_id=plant_id)
    assert history["calibration"] == {"dry": 31, "wet": 71}


async def test_wet_first_then_dry_later(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client: Client,
    set_moisture,
    freezer: FrozenDateTimeFactory,
    connect: Callable[[], Awaitable[Client]],
) -> None:
    """The wizard's "just watered": field capacity first, dry days later."""
    start = _tomorrow()
    freezer.move_to(start)
    plant_id = subentry_id(entry, "Monstera")
    set_moisture("50")
    await hass.async_block_till_done()
    await client.result("rootwise/calibration/wet", plant_id=plant_id)
    await _soak(hass, freezer, set_moisture, start)
    await _at(hass, freezer, start + timedelta(hours=7, seconds=7))

    client = await connect()
    state = await client.result("rootwise/calibration/get", plant_id=plant_id)
    assert state["pending"]["phase"] == "need_dry"
    assert state["pending"]["wet"] == 71
    assert (await _plant(client))["calibration"] is None

    freezer.move_to(start + timedelta(days=9))
    set_moisture("33")
    await hass.async_block_till_done()
    client = await connect()
    await client.result("rootwise/calibration/dry", plant_id=plant_id)
    plant = await _plant(client)
    assert (plant["calibration"]["dry"], plant["calibration"]["wet"]) == (33, 71)


async def test_no_rise_means_no_watering_reached_the_probe(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client: Client,
    set_moisture,
    freezer: FrozenDateTimeFactory,
    connect: Callable[[], Awaitable[Client]],
) -> None:
    start = _tomorrow()
    freezer.move_to(start)
    plant_id = subentry_id(entry, "Monstera")
    set_moisture("31")
    await hass.async_block_till_done()
    await client.result("rootwise/calibration/wet", plant_id=plant_id)
    await _at(hass, freezer, start + timedelta(hours=7, seconds=7))
    client = await connect()
    state = await client.result("rootwise/calibration/get", plant_id=plant_id)
    assert state["pending"]["phase"] == "no_rise"
    assert (await _plant(client))["calibration"] is None


async def test_apply_a_suggestion_and_clear_it(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    tracker = entry.runtime_data.plants[plant_id].tracker
    tracker.waterings = [
        Watering(at=T0 - timedelta(days=9), before=58, peak=90, settled=76),
        Watering(at=T0 - timedelta(days=3), before=55, peak=92, settled=79),
    ]
    state = await client.result("rootwise/calibration/get", plant_id=plant_id)
    assert state["suggestion"] == {"dry": 55, "wet": 77.5, "waterings": 2}

    await client.result(
        "rootwise/calibration/apply", plant_id=plant_id, dry=55, wet=77.5
    )
    plant = await _plant(client)
    assert plant["calibration"]["dry"] == 55
    assert plant["thresholds"]["source"] == "calibrated"

    await client.result("rootwise/calibration/clear", plant_id=plant_id)
    plant = await _plant(client)
    assert plant["calibration"] is None
    assert plant["thresholds"]["source"] != "calibrated"


async def test_own_thresholds_still_win(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    runtime = entry.runtime_data.plants[plant_id]
    runtime.async_set_threshold("low", 60)
    await client.result("rootwise/calibration/apply", plant_id=plant_id, dry=40, wet=80)
    plant = await _plant(client)
    assert plant["thresholds"]["source"] == "custom"
    assert plant["thresholds"]["low"] == 60


async def test_refusals(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client: Client,
    user_client: Client,
    set_moisture,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    response = await client.call(
        "rootwise/calibration/apply", plant_id=plant_id, dry=40, wet=45
    )
    assert response["error"]["code"] == "too_close"

    response = await user_client.call("rootwise/calibration/get", plant_id=plant_id)
    assert response["error"]["code"] == "unauthorized"

    efeu = subentry_id(entry, "Efeutute")
    response = await client.call("rootwise/calibration/dry", plant_id=efeu)
    assert response["error"]["code"] == "no_sensor"

    set_moisture("unavailable")
    await hass.async_block_till_done()
    response = await client.call("rootwise/calibration/dry", plant_id=plant_id)
    assert response["error"]["code"] == "no_value"


async def test_another_probe_or_a_moved_one_needs_a_new_calibration(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    await client.result("rootwise/calibration/apply", plant_id=plant_id, dry=40, wet=80)

    await client.result(
        "rootwise/care/log", plant_id=plant_id, care_type="sensor_moved"
    )
    assert (await _plant(client))["calibration"]["outdated"] is True

    entry.runtime_data.storage.plant(plant_id)["calibration"]["sensor"] = "sensor.other"
    runtime = entry.runtime_data.plants[plant_id]
    runtime.async_evaluate()
    assert (await _plant(client))["calibration"] is None
