"""Push notifications: digest, detected waterings, critical warnings, buttons."""

from datetime import UTC, datetime, timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import Context, HomeAssistant, ServiceCall
from homeassistant.helpers import device_registry as dr
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    MockUser,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.rootwise.engine.detect import Watering
from custom_components.rootwise.push import in_quiet_hours

from .conftest import subentry_id

# 07:59 local time in Vienna (CEST), one minute before the digest.
BEFORE_DIGEST = datetime(2026, 10, 3, 5, 59, tzinfo=UTC)


@pytest.fixture
async def phone(hass: HomeAssistant, hass_admin_user: MockUser) -> str:
    """Michi's phone as the companion app registers it."""
    await hass.config.async_set_time_zone("Europe/Vienna")
    app = MockConfigEntry(
        domain="mobile_app",
        data={"device_name": "Michis Phone", "user_id": hass_admin_user.id},
    )
    app.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=app.entry_id, identifiers={("mobile_app", "phone-1")}
    )
    return device.id


@pytest.fixture
def pushes(hass: HomeAssistant) -> list[ServiceCall]:
    """Calls of the phone's notify service."""
    return async_mock_service(hass, "notify", "mobile_app_michis_phone")


@pytest.fixture
def entry_options(phone: str) -> dict[str, Any]:
    """Rootwise sends to the phone, digest at 08:00, quiet 22 to 07."""
    return {"notify_devices": [phone], "digest_time": "08:00:00"}


@pytest.fixture
def clock(freezer: FrozenDateTimeFactory) -> FrozenDateTimeFactory:
    """Start a minute before the digest."""
    freezer.move_to(BEFORE_DIGEST)
    return freezer


async def _digest(hass: HomeAssistant, clock: FrozenDateTimeFactory) -> None:
    clock.tick(timedelta(minutes=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


async def _press(hass: HomeAssistant, action: str, user_id: str) -> None:
    hass.bus.async_fire(
        "mobile_app_notification_action",
        {"action": action},
        context=Context(user_id=user_id),
    )
    await hass.async_block_till_done()


def _actions(call: ServiceCall) -> list[dict[str, str]]:
    return call.data["data"]["actions"]


async def test_digest_lists_thirsty_plants(
    hass: HomeAssistant, clock, pushes, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("15")
    await hass.async_block_till_done()
    await _digest(hass, clock)
    (call,) = pushes
    assert call.data["title"] == "Water today: Monstera"
    assert call.data["message"] == "Monstera · 15 %"
    assert [a["title"] for a in _actions(call)] == ["Watered ✓", "+1 day"]
    assert all(a["action"].startswith("ROOTWISE_") for a in _actions(call))


async def test_watered_button_logs_and_works_once(
    hass: HomeAssistant,
    clock,
    pushes,
    entry: MockConfigEntry,
    set_moisture,
    hass_admin_user: MockUser,
) -> None:
    set_moisture("15")
    await hass.async_block_till_done()
    await _digest(hass, clock)
    watered = _actions(pushes[0])[0]["action"]

    await _press(hass, watered, hass_admin_user.id)
    await _press(hass, watered, hass_admin_user.id)  # used up

    journal = entry.runtime_data.storage.entries(subentry_id(entry, "Monstera"), 10)
    assert [(e["type"], e["source"]) for e in journal] == [("watered", "notification")]
    assert journal[0]["user_id"] == hass_admin_user.id


async def test_button_from_another_user_is_ignored(
    hass: HomeAssistant, clock, pushes, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("15")
    await hass.async_block_till_done()
    await _digest(hass, clock)
    await _press(hass, _actions(pushes[0])[0]["action"], "someone-else")
    assert entry.runtime_data.storage.entries(subentry_id(entry, "Monstera"), 10) == []


async def test_snooze_button(
    hass: HomeAssistant,
    clock,
    pushes,
    entry: MockConfigEntry,
    set_moisture,
    hass_admin_user: MockUser,
) -> None:
    set_moisture("15")
    await hass.async_block_till_done()
    await _digest(hass, clock)
    await _press(hass, _actions(pushes[0])[1]["action"], hass_admin_user.id)
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "off"


async def test_no_digest_when_nothing_is_due_or_on_vacation(
    hass: HomeAssistant, clock, pushes, entry: MockConfigEntry, set_moisture
) -> None:
    await _digest(hass, clock)  # 38 % is fine; the Efeutute has no history
    assert pushes == []
    set_moisture("15")
    entry.runtime_data.async_set_vacation(True)
    clock.tick(timedelta(days=1) - timedelta(minutes=1))
    await _digest(hass, clock)
    assert pushes == []


async def test_detected_watering_can_be_rejected(
    hass: HomeAssistant,
    clock,
    pushes,
    entry: MockConfigEntry,
    hass_admin_user: MockUser,
) -> None:
    plant = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    watering = Watering(at=BEFORE_DIGEST, before=40.0, peak=80.0, settled=63.0)
    logged = entry.runtime_data.storage.async_add_entry(
        plant.config.plant_id, "watered", "auto", when=watering.at
    )
    entry.runtime_data.async_watering_detected(plant, logged, watering)
    await hass.async_block_till_done()

    (call,) = pushes
    assert call.data["title"] == "Watering detected: Monstera"
    assert call.data["message"].startswith("40 % → 63 %")
    (reject,) = _actions(call)
    assert reject["title"] == "That wasn't me"

    await _press(hass, reject["action"], hass_admin_user.id)
    assert entry.runtime_data.storage.get_entry(logged["id"]) is None
    assert plant.settings["rejected"] == [watering.at.isoformat()]


async def test_no_confirmation_in_quiet_hours(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, pushes, entry: MockConfigEntry
) -> None:
    freezer.move_to(datetime(2026, 10, 3, 21, tzinfo=UTC))  # 23:00 in Vienna
    plant = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    watering = Watering(at=datetime(2026, 10, 3, 20, tzinfo=UTC), before=40, peak=80)
    entry.runtime_data.async_watering_detected(plant, {"id": "x"}, watering)
    await hass.async_block_till_done()
    assert pushes == []


async def test_critical_comes_at_once_but_not_too_often(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    pushes,
    entry: MockConfigEntry,
    set_moisture,
) -> None:
    freezer.move_to(datetime(2026, 10, 3, 1, tzinfo=UTC))  # 03:00, quiet hours
    set_moisture("5")  # dry threshold of the Monstera is 20: very dry
    await hass.async_block_till_done()
    (call,) = pushes
    assert call.data["title"] == "Monstera is very dry"
    assert call.data["message"] == "Only 5 %. Water soon."

    set_moisture("30")
    await hass.async_block_till_done()
    set_moisture("4")
    await hass.async_block_till_done()
    assert len(pushes) == 1  # 12 hours pause


async def test_no_pushes_without_a_phone(
    hass: HomeAssistant, clock, entry: MockConfigEntry, set_moisture
) -> None:
    pushes = async_mock_service(hass, "notify", "mobile_app_other")
    set_moisture("15")
    await hass.async_block_till_done()
    await _digest(hass, clock)
    assert pushes == []


@pytest.mark.parametrize(
    ("now", "quiet"),
    [("23:30", True), ("06:59", True), ("07:00", False), ("12:00", False)],
)
def test_quiet_hours_span_midnight(now: str, quiet: bool) -> None:
    def t(value: str):
        return datetime.strptime(value, "%H:%M").time()

    assert in_quiet_hours(t(now), t("22:00"), t("07:00")) is quiet
    assert in_quiet_hours(t(now), t("07:00"), t("07:00")) is False
