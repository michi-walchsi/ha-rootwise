"""The 'Plant care' to-do list."""

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

TODO = "todo.rootwise_plant_care"


async def _items(hass: HomeAssistant) -> list[dict]:
    response = await hass.services.async_call(
        "todo", "get_items", {"entity_id": TODO}, blocking=True, return_response=True
    )
    return response[TODO]["items"]


async def test_thirsty_plant_appears(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    assert await _items(hass) == []
    set_moisture("10")
    await hass.async_block_till_done()
    items = await _items(hass)
    assert [i["summary"] for i in items] == ["Water Monstera"]
    assert hass.states.get(TODO).state == "1"


async def test_completing_item_logs_watering(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("10")
    await hass.async_block_till_done()
    item = (await _items(hass))[0]
    await hass.services.async_call(
        "todo",
        "update_item",
        {"entity_id": TODO, "item": item["uid"], "status": "completed"},
        blocking=True,
    )
    assert hass.states.get("sensor.monstera_last_watered").state != "unknown"
    assert await _items(hass) == []


async def test_removing_item_snoozes(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("10")
    await hass.async_block_till_done()
    item = (await _items(hass))[0]
    await hass.services.async_call(
        "todo", "remove_item", {"entity_id": TODO, "item": item["uid"]}, blocking=True
    )
    assert await _items(hass) == []
    assert hass.states.get("binary_sensor.monstera_needs_water").state == "off"


async def test_vacation_hides_items(
    hass: HomeAssistant, entry: MockConfigEntry, set_moisture
) -> None:
    set_moisture("10")
    await hass.services.async_call(
        "switch",
        "turn_on",
        {"entity_id": "switch.rootwise_vacation_mode"},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert await _items(hass) == []
