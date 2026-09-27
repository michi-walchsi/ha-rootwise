"""WebSocket API used by the cards."""

from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.rootwise.const import CARE_WATERED

from .conftest import subentry_id


class Client:
    """Tiny helper around the test WebSocket client."""

    def __init__(self, ws: Any) -> None:
        """Wrap the client."""
        self.ws = ws
        self._id = 0

    async def call(self, type_: str, **data: Any) -> dict[str, Any]:
        """Send a command and return the whole response."""
        self._id += 1
        await self.ws.send_json({"id": self._id, "type": type_, **data})
        return await self.ws.receive_json()

    async def result(self, type_: str, **data: Any) -> Any:
        """Send a command and return its result, asserting success."""
        response = await self.call(type_, **data)
        assert response["success"], response
        return response["result"]


@pytest.fixture
async def client(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> Client:
    """Client of the admin user."""
    return Client(await hass_ws_client(hass))


@pytest.fixture
async def user_client(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator
) -> Client:
    """Client of a normal (non-admin) household member."""
    user = await hass.auth.async_create_user("Kind", group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com/")
    token = hass.auth.async_create_access_token(refresh)
    return Client(await hass_ws_client(hass, access_token=token))


@pytest.fixture
async def read_only_client(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    hass_read_only_access_token: str,
) -> Client:
    """Client of a read-only user."""
    return Client(await hass_ws_client(hass, access_token=hass_read_only_access_token))


def _plant(result: dict[str, Any], name: str) -> dict[str, Any]:
    return next(p for p in result["plants"] if p["name"] == name)


async def test_plants(hass: HomeAssistant, entry: MockConfigEntry, client) -> None:
    result = await client.result("rootwise/plants")
    assert result["loaded"] is True
    assert result["vacation"] is False
    assert [p["name"] for p in result["plants"]] == ["Efeutute", "Monstera"]

    monstera = _plant(result, "Monstera")
    assert monstera["id"] == subentry_id(entry, "Monstera")
    assert monstera["status"] == "ok"
    assert monstera["entity_ids"]["status"] == "sensor.monstera_status"
    assert monstera["entity_ids"]["watered"] == "button.monstera_watered"
    assert monstera["species"]["scientific"] == "Monstera deliciosa"
    moisture = monstera["measurements"]["soil_moisture"]
    assert moisture["value"] == 38
    assert moisture["unit"] == "%"
    assert moisture["rating"] == "ok"
    assert moisture["min"] < 38 < moisture["max"]
    assert monstera["measurements"]["temperature"]["value"] == 22.5
    assert monstera["recent"] == []
    assert monstera["last_watered"] is None


async def test_subscription_pushes_and_survives_reload(
    hass: HomeAssistant, entry: MockConfigEntry, client, set_moisture
) -> None:
    response = await client.call("rootwise/plants/subscribe")
    assert response["success"]
    event = await client.ws.receive_json()
    assert (
        _plant(event["event"], "Monstera")["measurements"]["soil_moisture"]["value"]
        == 38
    )

    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    set_moisture("19")
    await hass.async_block_till_done()

    # Skip pushes from the reload until the new value arrives.
    for _ in range(5):
        event = await client.ws.receive_json()
        monstera = _plant(event["event"], "Monstera")
        if monstera["measurements"]["soil_moisture"]["value"] == 19:
            break
    assert monstera["status"] == "thirsty"


async def test_log_watering_yesterday(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client,
    freezer: FrozenDateTimeFactory,
    hass_admin_user: MockUser,
) -> None:
    freezer.move_to("2026-09-27T12:07:00+02:00")
    sid = subentry_id(entry, "Monstera")
    result = await client.result(
        "rootwise/care/log",
        plant_id=sid,
        care_type=CARE_WATERED,
        when="2026-09-26T19:00:00+02:00",
    )
    logged = result["entry"]
    assert logged["ts"] == "2026-09-26T17:00:00+00:00"
    assert logged["source"] == "card"
    assert logged["user_id"] == hass_admin_user.id
    assert logged["data"] == {"moisture": 38.0}
    assert (
        hass.states.get("sensor.monstera_last_watered").state
        == "2026-09-26T17:00:00+00:00"
    )


async def test_future_time_is_rejected(
    hass: HomeAssistant, entry: MockConfigEntry, client
) -> None:
    response = await client.call(
        "rootwise/care/log",
        plant_id=subentry_id(entry, "Monstera"),
        care_type=CARE_WATERED,
        when="2099-01-01T00:00:00+00:00",
    )
    assert not response["success"]
    assert response["error"]["code"] == "when_in_future"


async def test_unknown_plant(
    hass: HomeAssistant, entry: MockConfigEntry, client
) -> None:
    response = await client.call(
        "rootwise/care/log", plant_id="nope", care_type=CARE_WATERED
    )
    assert response["error"]["code"] == "not_found"


async def test_admin_deletes_test_click(
    hass: HomeAssistant, entry: MockConfigEntry, client
) -> None:
    # A watering logged by the button, like the accidental test click.
    await hass.services.async_call(
        "button", "press", {"entity_id": "button.monstera_watered"}, blocking=True
    )
    sid = subentry_id(entry, "Monstera")
    (logged,) = (await client.result("rootwise/journal", plant_id=sid))["entries"]
    assert logged["source"] == "button"

    await client.result("rootwise/care/delete", entry_id=logged["id"])
    await hass.async_block_till_done()
    assert (await client.result("rootwise/journal", plant_id=sid))["entries"] == []
    assert hass.states.get("sensor.monstera_last_watered").state == "unknown"


async def test_user_deletes_own_entry_only(
    hass: HomeAssistant, entry: MockConfigEntry, client, user_client
) -> None:
    sid = subentry_id(entry, "Monstera")
    own = (
        await user_client.result(
            "rootwise/care/log", plant_id=sid, care_type=CARE_WATERED
        )
    )["entry"]
    foreign = (
        await client.result("rootwise/care/log", plant_id=sid, care_type="fertilized")
    )["entry"]

    response = await user_client.call("rootwise/care/delete", entry_id=foreign["id"])
    assert response["error"]["code"] == "unauthorized"
    await user_client.result("rootwise/care/delete", entry_id=own["id"])

    entries = (await client.result("rootwise/journal", plant_id=sid))["entries"]
    assert [e["id"] for e in entries] == [foreign["id"]]


async def test_read_only_user_can_look_but_not_log(
    hass: HomeAssistant, entry: MockConfigEntry, read_only_client
) -> None:
    result = await read_only_client.result("rootwise/plants")
    assert len(result["plants"]) == 2
    response = await read_only_client.call(
        "rootwise/care/log",
        plant_id=subentry_id(entry, "Monstera"),
        care_type=CARE_WATERED,
    )
    assert response["error"]["code"] == "unauthorized"


async def test_journal_newest_first_with_limit(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    client,
    freezer: FrozenDateTimeFactory,
) -> None:
    sid = subentry_id(entry, "Monstera")
    for care_type in ("watered", "fertilized", "rotated"):
        await client.result("rootwise/care/log", plant_id=sid, care_type=care_type)
        freezer.tick(timedelta(minutes=1))
    entries = (await client.result("rootwise/journal", plant_id=sid, limit=2))[
        "entries"
    ]
    assert [e["type"] for e in entries] == ["rotated", "fertilized"]
    plant = _plant(await client.result("rootwise/plants"), "Monstera")
    assert [e["type"] for e in plant["recent"]] == ["rotated", "fertilized", "watered"]


async def test_not_loaded(hass: HomeAssistant, entry: MockConfigEntry, client) -> None:
    await hass.config_entries.async_unload(entry.entry_id)
    result = await client.result("rootwise/plants")
    assert result == {"loaded": False, "vacation": False, "plants": []}


async def test_sensor_moved_is_a_care_type(
    hass: HomeAssistant, entry: MockConfigEntry, client
) -> None:
    result = await client.result(
        "rootwise/care/log",
        plant_id=subentry_id(entry, "Monstera"),
        care_type="sensor_moved",
    )
    assert result["entry"]["type"] == "sensor_moved"
