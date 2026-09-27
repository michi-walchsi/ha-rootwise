"""Buttons, numbers, the vacation switch and the rootwise.* actions."""

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.auth.models import User
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.rootwise.const import DOMAIN

from .conftest import MOISTURE, subentry_id


async def _press(hass: HomeAssistant, entity_id: str) -> None:
    await hass.services.async_call(
        "button", "press", {"entity_id": entity_id}, blocking=True
    )


async def test_watered_button_sets_last_watered(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await _press(hass, "button.monstera_watered")
    state = hass.states.get("sensor.monstera_last_watered")
    watered = dt_util.parse_datetime(state.state)
    assert watered is not None
    assert abs((dt_util.utcnow() - watered).total_seconds()) < 5


async def test_watering_starts_the_interval_for_sensorless_plant(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await _press(hass, "button.efeutute_watered")
    assert hass.states.get("sensor.efeutute_status").state == "ok"


async def test_log_care_action_targets_plant_device(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, subentry_id(entry, "Monstera")), entry.entry_id
    )
    await hass.services.async_call(
        DOMAIN,
        "log_care",
        {"device_id": device.id, "care_type": "watered"},
        blocking=True,
    )
    assert hass.states.get("sensor.monstera_last_watered").state != "unknown"


async def test_log_care_without_plant_is_rejected(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "log_care",
            {"entity_id": MOISTURE, "care_type": "watered"},
            blocking=True,
        )


async def test_snooze_hides_need_for_one_day(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    set_moisture,
    freezer: FrozenDateTimeFactory,
) -> None:
    set_moisture("10")
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "on"

    await _press(hass, "button.monstera_snooze_1_day")
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "off"

    freezer.tick(timedelta(days=1, minutes=1))
    set_moisture("10")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "on"


async def test_dry_threshold_number_changes_status(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("25")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.monstera_status").state == "ok"

    await hass.services.async_call(
        "number",
        "set_value",
        {"entity_id": "number.monstera_dry_threshold", "value": 30},
        blocking=True,
    )
    assert hass.states.get("sensor.monstera_status").state == "thirsty"
    assert hass.states.get("number.monstera_dry_threshold").state == "30.0"


async def test_vacation_switch(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    await hass.services.async_call(
        "switch",
        "turn_on",
        {"entity_id": "switch.rootwise_vacation_mode"},
        blocking=True,
    )
    assert hass.states.get("switch.rootwise_vacation_mode").state == "on"


async def test_set_vacation_requires_admin(
    hass: HomeAssistant, entry: MockConfigEntry, hass_read_only_user: User
) -> None:
    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            DOMAIN,
            "set_vacation",
            {"enabled": True},
            blocking=True,
            context=Context(user_id=hass_read_only_user.id),
        )


async def test_set_vacation_by_automation(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await hass.services.async_call(
        DOMAIN, "set_vacation", {"enabled": True}, blocking=True
    )
    assert hass.states.get("switch.rootwise_vacation_mode").state == "on"
