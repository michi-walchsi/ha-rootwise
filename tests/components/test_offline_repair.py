"""A repair issue when a soil sensor stays offline."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.repairs import repairs_flow_manager
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.rootwise.const import DOMAIN

from .conftest import subentry_id


async def _offline_for(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hours: int
) -> None:
    for _ in range(hours):
        freezer.tick(timedelta(hours=1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()


async def test_issue_after_twelve_offline_hours_and_gone_when_back(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
    set_moisture,
) -> None:
    issue_id = f"sensor_offline_{subentry_id(entry, 'Monstera')}"
    set_moisture("unavailable")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "sensor_offline"

    await _offline_for(hass, freezer, 11)
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id) is None
    await _offline_for(hass, freezer, 2)
    issue = ir.async_get(hass).async_get_issue(DOMAIN, issue_id)
    assert issue is not None
    assert issue.translation_placeholders == {
        "plant": "Monstera",
        "sensor": "sensor.probe_soil_moisture",
    }

    set_moisture("37")
    await hass.async_block_till_done()
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id) is None


async def test_fix_opens_the_plant_settings(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    entry: MockConfigEntry,
    set_moisture,
) -> None:
    sid = subentry_id(entry, "Monstera")
    set_moisture("unavailable")
    await hass.async_block_till_done()
    await _offline_for(hass, freezer, 13)

    # The clock moved 13 hours, so drive the flow without an HTTP login.
    assert await async_setup_component(hass, "repairs", {})
    manager = repairs_flow_manager(hass)
    assert manager is not None
    flow = await manager.async_init(DOMAIN, data={"issue_id": f"sensor_offline_{sid}"})
    assert flow["step_id"] == "confirm"
    assert flow["description_placeholders"]["sensor"] == "sensor.probe_soil_moisture"
    result = await manager.async_configure(flow["flow_id"], {})
    assert result["type"] == "create_entry"
    flow_type, flow_id = result["next_flow"]
    assert flow_type == "config_subentries_flow"
    started = hass.config_entries.subentries.async_get(flow_id)
    assert started["context"]["subentry_id"] == sid
