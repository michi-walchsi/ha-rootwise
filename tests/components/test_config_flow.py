"""Config, options and plant subentry flows."""

from typing import Any

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult, FlowResultType
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT

from .conftest import MOISTURE, subentry_id

POT = {
    "pot_diameter": 14,
    "pot_material": "terracotta",
    "drainage": True,
    "window": "e",
    "location": "indoor",
}


def suggested(result: FlowResult) -> dict[str, Any]:
    """Return the suggested values of a form, by field name."""
    values = {}
    for key in result["data_schema"].schema:
        if key.description and "suggested_value" in key.description:
            values[str(key)] = key.description["suggested_value"]
    return values


async def _start(hass: HomeAssistant, entry: MockConfigEntry) -> FlowResult:
    return await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )


async def test_user_flow_creates_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Rootwise"


async def test_only_one_entry_allowed(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def test_add_plant_in_three_steps(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await _start(hass, entry)
    assert result["step_id"] == "user"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Grünlilie", "species": "chlorophytum_comosum"}
    )
    assert result["step_id"] == "sensors"

    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {})
    assert result["step_id"] == "pot"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], POT
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    data = entry.subentries[subentry_id(entry, "Grünlilie")].data
    assert data["species"] == "chlorophytum_comosum"
    assert data["pot_material"] == "terracotta"
    assert "moisture_sensor" not in data


async def test_species_is_optional(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    result = await _start(hass, entry)
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Unbekannt"}
    )
    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {})
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], POT
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert "species" not in entry.subentries[subentry_id(entry, "Unbekannt")].data


async def test_sensor_step_suggests_same_device_and_room(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    area = ar.async_get(hass).async_create("Schlafzimmer")
    dev_reg, ent_reg = dr.async_get(hass), er.async_get(hass)
    other = MockConfigEntry(domain="mqtt")
    other.add_to_hass(hass)

    soil = dev_reg.async_get_or_create(
        config_entry_id=other.entry_id, identifiers={("mqtt", "soil2")}
    )
    room = dev_reg.async_get_or_create(
        config_entry_id=other.entry_id, identifiers={("mqtt", "room")}
    )
    dev_reg.async_update_device(room.id, area_id=area.id)

    def sensor(uid: str, device_id: str, device_class: str) -> str:
        return ent_reg.async_get_or_create(
            "sensor",
            "mqtt",
            uid,
            device_id=device_id,
            config_entry=other,
            original_device_class=device_class,
        ).entity_id

    moisture = sensor("soil2_moisture", soil.id, "moisture")
    soil_temp = sensor("soil2_temperature", soil.id, "temperature")
    battery = sensor("soil2_battery", soil.id, "battery")
    sensor("room_temperature", room.id, "temperature")
    room_humidity = sensor("room_humidity", room.id, "humidity")
    room_lux = sensor("room_illuminance", room.id, "illuminance")

    result = await _start(hass, entry)
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {"name": "Calathea", "area": area.id, "moisture_sensor": moisture},
    )
    assert result["step_id"] == "sensors"
    assert suggested(result) == {
        "temperature_sensor": soil_temp,
        "humidity_sensor": room_humidity,
        "illuminance_sensor": room_lux,
        "battery_sensor": battery,
    }


async def test_moisture_sensor_cannot_be_shared(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await _start(hass, entry)
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Zweite", "moisture_sensor": MOISTURE}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"
    assert result["errors"] == {"base": "sensor_in_use"}


async def test_reconfigure_plant(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    sid = subentry_id(entry, "Monstera")
    result = await entry.start_subentry_reconfigure_flow(hass, sid)
    assert result["step_id"] == "reconfigure"
    assert suggested(result)["name"] == "Monstera"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Große Monstera",
            "species": "monstera_deliciosa",
            "moisture_sensor": MOISTURE,
        },
    )
    assert result["step_id"] == "sensors"
    result = await hass.config_entries.subentries.async_configure(result["flow_id"], {})
    assert suggested(result)["pot_diameter"] == 24
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {**POT, "pot_diameter": 30}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.subentries[sid].title == "Große Monstera"
    assert entry.subentries[sid].data["pot_diameter"] == 30
    assert entry.subentries[sid].data["moisture_sensor"] == MOISTURE


async def test_options_flow(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"notify_devices": [], "digest_time": "07:30:00"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["digest_time"] == "07:30:00"


async def test_panel_can_start_plant_flow_via_rest(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
) -> None:
    """Spike for phase 2: the panel adds plants through HA's subentry flow API."""
    assert await async_setup_component(hass, "config", {})
    client = await hass_client()
    resp = await client.post(
        "/api/config/config_entries/subentries/flow",
        json={"handler": [entry.entry_id, SUBENTRY_PLANT]},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["step_id"] == "user"
