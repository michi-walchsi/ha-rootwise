"""Setup, devices, entities and status updates."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, issue_registry as ir
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.rootwise.const import DOMAIN

from .conftest import subentry_id


async def test_plant_gets_its_own_device(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    sid = subentry_id(entry, "Monstera")
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, sid), entry.entry_id
    )
    assert device is not None
    assert device.name == "Monstera"
    assert device.config_subentry_id == sid


async def test_entities_start_ok(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert hass.states.get("sensor.monstera_status").state == "ok"
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "off"
    assert hass.states.get("binary_sensor.monstera_problem").state == "off"
    assert hass.states.get("sensor.rootwise_plants_needing_water").state == "0"


async def test_status_follows_moisture(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("10")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "thirsty"
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "on"
    assert hass.states.get("sensor.rootwise_plants_needing_water").state == "1"


async def test_unavailable_sensor_is_a_problem(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("unavailable")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "sensor_offline"
    assert hass.states.get("binary_sensor.monstera_problem").state == "on"


async def test_stale_sensor_detected_by_hourly_check(
    hass: HomeAssistant, entry: MockConfigEntry, freezer: FrozenDateTimeFactory
) -> None:
    # A few quiet hours are normal for probes that report only on change.
    freezer.tick(timedelta(hours=4))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "ok"

    freezer.tick(timedelta(hours=9))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "sensor_offline"


async def test_plant_without_sensor_has_no_history(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    assert hass.states.get("sensor.efeutute_status").state == "no_history"


async def test_removing_plant_removes_device(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    sid = subentry_id(entry, "Monstera")
    assert hass.config_entries.async_remove_subentry(entry, sid)
    await hass.async_block_till_done()
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, sid), entry.entry_id
    )
    assert device is None
    assert hass.states.get("sensor.monstera_status") is None


async def test_unload(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_real_sensors_raise_no_issue(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    issues = [key for key in ir.async_get(hass).issues if key[0] == DOMAIN]
    assert issues == []
