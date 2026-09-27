"""Measurement mirrors on the plant device: values, ranges, ratings, throttling."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.rootwise.const import DOMAIN

from .conftest import AIR_HUMIDITY, MOISTURE, TEMPERATURE, subentry_id


async def test_mirrors_only_for_assigned_sources(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert hass.states.get("sensor.monstera_soil_moisture") is not None
    assert hass.states.get("sensor.monstera_temperature") is not None
    assert hass.states.get("sensor.monstera_air_humidity") is not None
    assert hass.states.get("sensor.monstera_battery") is not None
    assert hass.states.get("sensor.monstera_illuminance") is None
    assert hass.states.get("sensor.efeutute_soil_moisture") is None


async def test_mirror_value_unit_and_range(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    state = hass.states.get("sensor.monstera_temperature")
    assert state.state == "22.5"
    assert state.attributes["unit_of_measurement"] == "°C"
    assert state.attributes["rating"] == "ok"
    assert state.attributes["min"] == 18.0
    assert state.attributes["max"] == 27.0
    assert state.attributes["range_source"] == "offline"
    assert state.attributes["source"] == TEMPERATURE


async def test_mirrors_have_no_state_class(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    for key in ("soil_moisture", "temperature", "air_humidity", "battery"):
        assert "state_class" not in hass.states.get(f"sensor.monstera_{key}").attributes


async def test_cold_adds_hint_but_no_problem(
    hass: HomeAssistant, entry: MockConfigEntry, set_state
) -> None:
    set_state(TEMPERATURE, "10")
    await hass.async_block_till_done()
    status = hass.states.get("sensor.monstera_status")
    assert status.state == "ok"
    codes = [r["code"] for r in status.attributes["reasons"]]
    assert "temperature_low" in codes
    assert hass.states.get("binary_sensor.monstera_problem").state == "off"


async def test_low_air_humidity_rated_low(
    hass: HomeAssistant, entry: MockConfigEntry, set_state, freezer
) -> None:
    set_state(AIR_HUMIDITY, "41")
    freezer.tick(timedelta(seconds=61))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    state = hass.states.get("sensor.monstera_air_humidity")
    assert state.attributes["rating"] == "low"
    assert state.attributes["min"] == 50.0


async def test_soil_moisture_fresh_after_watering(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("77")
    await hass.async_block_till_done()
    mirror = hass.states.get("sensor.monstera_soil_moisture")
    assert mirror.attributes["level"] == "fresh"
    assert mirror.attributes["rating"] == "ok"
    assert hass.states.get("sensor.monstera_status").state == "ok"
    assert hass.states.get("binary_sensor.monstera_problem").state == "off"


async def test_mirror_writes_are_throttled(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    set_moisture,
    freezer: FrozenDateTimeFactory,
) -> None:
    set_moisture("40")
    await hass.async_block_till_done()
    first = hass.states.get("sensor.monstera_soil_moisture").state
    set_moisture("41")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_soil_moisture").state == first

    freezer.tick(timedelta(seconds=61))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_soil_moisture").state == "41"


async def test_unavailable_source_makes_mirror_unavailable(
    hass: HomeAssistant, entry: MockConfigEntry, set_state
) -> None:
    set_state(TEMPERATURE, "unavailable")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_temperature").state == "unavailable"


async def test_zero_is_a_real_value(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture, freezer
) -> None:
    set_moisture("0")
    freezer.tick(timedelta(seconds=61))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_soil_moisture").state == "0"


@pytest.mark.parametrize(
    "monstera_data",
    [
        {
            "species": "monstera_deliciosa",
            "moisture_sensor": MOISTURE,
            "species_info": {
                "source": "openplantbook",
                "image_url": "https://opb-img.plantbook.io/monstera%20deliciosa.jpg",
                "ranges": {"temperature": {"min": 12, "max": 32}},
            },
        }
    ],
)
async def test_species_info_sets_picture_and_ranges(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    status = hass.states.get("sensor.monstera_status")
    assert status.attributes["entity_picture"].startswith("https://opb-img")
    assert hass.states.get("sensor.monstera_temperature") is None


async def test_orphaned_entities_are_removed(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    ent_reg = er.async_get(hass)
    sid = subentry_id(entry, "Monstera")
    ghost = ent_reg.async_get_or_create(
        "number",
        DOMAIN,
        f"{sid}_watering_interval",
        config_entry=entry,
        config_subentry_id=sid,
    )
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert ent_reg.async_get(ghost.entity_id) is None
    assert ent_reg.async_get("number.monstera_dry_threshold") is not None
