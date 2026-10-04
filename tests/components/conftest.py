"""Fixtures for Home Assistant level tests."""

from collections.abc import Callable
from typing import Any

from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.config_entries import ConfigSubentryData
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT

# Source sensors (as a soil probe and a room climate sensor would provide them)
MOISTURE = "sensor.probe_soil_moisture"
TEMPERATURE = "sensor.probe_temperature"
BATTERY = "sensor.probe_battery"
AIR_HUMIDITY = "sensor.room_humidity"

SOURCES: dict[str, tuple[str, dict[str, str]]] = {
    MOISTURE: ("38", {"device_class": "moisture", "unit_of_measurement": "%"}),
    TEMPERATURE: (
        "22.46",
        {"device_class": "temperature", "unit_of_measurement": "°C"},
    ),
    BATTERY: ("87", {"device_class": "battery", "unit_of_measurement": "%"}),
    AIR_HUMIDITY: ("55", {"device_class": "humidity", "unit_of_measurement": "%"}),
}

MONSTERA: dict[str, Any] = {
    "species": "monstera_deliciosa",
    "moisture_sensor": MOISTURE,
    "temperature_sensor": TEMPERATURE,
    "humidity_sensor": AIR_HUMIDITY,
    "battery_sensor": BATTERY,
    "pot_diameter": 24,
    "pot_material": "plastic",
    "drainage": True,
    "window": "w",
    "location": "indoor",
}

EFEUTUTE: dict[str, Any] = {
    "species": "epipremnum_aureum",
    "pot_diameter": 14,
    "pot_material": "plastic",
    "drainage": True,
    "window": "e",
    "location": "indoor",
}


def plant(title: str, data: dict[str, Any], unique_id: str | None = None):
    """Build subentry data for MockConfigEntry."""
    return ConfigSubentryData(
        data=data, subentry_type=SUBENTRY_PLANT, title=title, unique_id=unique_id
    )


@pytest.fixture
def set_state(hass: HomeAssistant) -> Callable[[str, str], None]:
    """Set a source sensor's state, keeping its attributes."""

    def _set(entity_id: str, value: str) -> None:
        hass.states.async_set(entity_id, value, SOURCES[entity_id][1])

    return _set


@pytest.fixture
def set_moisture(set_state) -> Callable[[str], None]:
    """Set the Monstera's moisture sensor state."""

    def _set(value: str) -> None:
        set_state(MOISTURE, value)

    return _set


@pytest.fixture
def monstera_data() -> dict[str, Any]:
    """Subentry data of the Monstera (tests may change it before setup)."""
    return dict(MONSTERA)


@pytest.fixture
def entry_options() -> dict[str, Any]:
    """Options of the Rootwise entry (tests may override)."""
    return {}


@pytest.fixture
async def entry(hass: HomeAssistant, monstera_data, entry_options) -> MockConfigEntry:
    """A loaded Rootwise entry with a Monstera (sensors) and an Efeutute (none)."""
    for entity_id, (value, attrs) in SOURCES.items():
        hass.states.async_set(entity_id, value, attrs)
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        title="Rootwise",
        data={},
        options=entry_options,
        subentries_data=[
            plant("Monstera", monstera_data, MOISTURE),
            plant("Efeutute", EFEUTUTE),
        ],
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    return config_entry


def subentry_id(entry: MockConfigEntry, title: str) -> str:
    """Return the id of the plant subentry with this title."""
    return next(s.subentry_id for s in entry.subentries.values() if s.title == title)


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
