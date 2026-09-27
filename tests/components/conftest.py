"""Fixtures for Home Assistant level tests."""

from collections.abc import Callable
from typing import Any

from homeassistant.config_entries import ConfigSubentryData
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT

MOISTURE = "sensor.monstera_soil_moisture"
MOISTURE_ATTRS = {"device_class": "moisture", "unit_of_measurement": "%"}

MONSTERA: dict[str, Any] = {
    "species": "monstera_deliciosa",
    "moisture_sensor": MOISTURE,
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
def set_moisture(hass: HomeAssistant) -> Callable[[str], None]:
    """Set the Monstera's moisture sensor state."""

    def _set(value: str) -> None:
        hass.states.async_set(MOISTURE, value, MOISTURE_ATTRS)

    return _set


@pytest.fixture
async def entry(hass: HomeAssistant, set_moisture) -> MockConfigEntry:
    """A loaded Rootwise entry with a Monstera (sensor) and an Efeutute (none)."""
    set_moisture("38")
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        title="Rootwise",
        data={},
        options={},
        subentries_data=[
            plant("Monstera", MONSTERA, MOISTURE),
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
