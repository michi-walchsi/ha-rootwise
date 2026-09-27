"""Import from Plant Monitor, and merging into a plant that already exists."""

import json
from pathlib import Path
from typing import Any

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult, FlowResultType
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    issue_registry as ir,
)
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.config_flow import async_get_species_db
from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT
from custom_components.rootwise.importer import plant_monitor_plants

from .conftest import MONSTERA, subentry_id
from .test_config_flow import POT, suggested

FIXTURE = json.loads(
    (Path(__file__).parent.parent / "fixtures" / "olen_monstera.json").read_text(
        encoding="utf-8"
    )
)
REAL_MOISTURE = "sensor.0x00124b0000000001_soil_moisture"
REAL_SOIL_TEMPERATURE = "sensor.0x00124b0000000001_temperature"
REAL_BATTERY = "sensor.0x00124b0000000001_battery"
REAL_TEMPERATURE = "sensor.0x00124b0000000002_temperature_2"
REAL_HUMIDITY = "sensor.0x00124b0000000002_humidity_2"
OLEN_MIRROR = "sensor.monstera_bodenfeuchtigkeit"


async def _load_plant_monitor(hass: HomeAssistant) -> None:
    """Recreate Plant Monitor's Monstera from the recorded registry and states."""
    ent_reg, dev_reg = er.async_get(hass), dr.async_get(hass)
    area = ar.async_get(hass).async_create("Wohnzimmer")

    probe_entry = MockConfigEntry(domain="mqtt")
    probe_entry.add_to_hass(hass)
    probe = dev_reg.async_get_or_create(
        config_entry_id=probe_entry.entry_id, identifiers={("mqtt", "probe")}
    )
    for entity_id, value, device_class, unit in (
        (REAL_MOISTURE, "38", "moisture", "%"),
        (REAL_SOIL_TEMPERATURE, "21.5", "temperature", "°C"),
        (REAL_BATTERY, "90", "battery", "%"),
    ):
        ent_reg.async_get_or_create(
            "sensor",
            "mqtt",
            entity_id,
            suggested_object_id=entity_id.split(".")[1],
            device_id=probe.id,
            config_entry=probe_entry,
            original_device_class=device_class,
        )
        attrs = {"device_class": device_class, "unit_of_measurement": unit}
        hass.states.async_set(entity_id, value, attrs)
    for entity_id, value, device_class, unit in (
        (REAL_TEMPERATURE, "22.5", "temperature", "°C"),
        (REAL_HUMIDITY, "48", "humidity", "%"),
    ):
        attrs = {"device_class": device_class, "unit_of_measurement": unit}
        hass.states.async_set(entity_id, value, attrs)

    olen_entry = MockConfigEntry(domain="plant", title="Monstera")
    olen_entry.add_to_hass(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=olen_entry.entry_id, identifiers={("plant", "monstera")}
    )
    dev_reg.async_update_device(device.id, area_id=area.id)
    for item in FIXTURE:
        domain, object_id = item["entity_id"].split(".")
        ent_reg.async_get_or_create(
            domain,
            "plant",
            item["unique_id"],
            suggested_object_id=object_id,
            config_entry=olen_entry,
            device_id=device.id,
            translation_key=item["translation_key"],
            original_name=item["original_name"],
        )
        if item["state"] is not None:
            hass.states.async_set(item["entity_id"], item["state"], item["attributes"])


@pytest.fixture
async def plant_monitor(hass: HomeAssistant) -> None:
    """Plant Monitor with its Monstera."""
    await _load_plant_monitor(hass)


async def test_reads_plant_monitor(hass: HomeAssistant, plant_monitor) -> None:
    (plant,) = plant_monitor_plants(hass, await async_get_species_db(hass))
    assert plant.entity_id == "plant.monstera"
    assert plant.name == "Monstera"
    assert plant.data["area"] == "wohnzimmer"
    assert plant.data["species"] == "monstera_deliciosa"
    assert plant.data["moisture_sensor"] == REAL_MOISTURE
    assert plant.data["temperature_sensor"] == REAL_TEMPERATURE
    assert plant.data["humidity_sensor"] == REAL_HUMIDITY
    info = plant.data["species_info"]
    assert info["source"] == "plant_monitor"
    assert info["scientific"] == "Monstera deliciosa"
    assert info["image_url"] == "https://opb-img.plantbook.io/monstera%20deliciosa.jpg"
    # Its moisture limits use the Mi Flora scale and stay behind.
    assert info["ranges"] == {
        "temperature": {"min": 12.0, "max": 32.0},
        "air_humidity": {"min": 30.0, "max": 85.0},
    }
    assert OLEN_MIRROR in plant.mirrors


async def _start_import(hass: HomeAssistant, entry: MockConfigEntry) -> FlowResult:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.MENU
    assert result["menu_options"] == ["import", "basics"]
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"next_step_id": "import"}
    )
    assert result["step_id"] == "import"
    return result


async def _configure(hass: HomeAssistant, result: FlowResult, data: dict) -> FlowResult:
    return await hass.config_entries.subentries.async_configure(result["flow_id"], data)


async def test_import_as_new_plant(
    hass: HomeAssistant, plant_monitor, entry: MockConfigEntry
) -> None:
    result = await _start_import(hass, entry)
    options = result["data_schema"].schema["plant"].config["options"]
    assert options == [{"value": "plant.monstera", "label": "Monstera"}]

    result = await _configure(hass, result, {"plant": "plant.monstera"})
    assert result["step_id"] == "basics"
    assert suggested(result) == {
        "name": "Monstera",
        "species": "monstera_deliciosa",
        "area": "wohnzimmer",
        "moisture_sensor": REAL_MOISTURE,
    }
    result = await _configure(hass, result, {**suggested(result), "name": "Fenster"})
    assert suggested(result) == {
        "temperature_sensor": REAL_TEMPERATURE,
        "humidity_sensor": REAL_HUMIDITY,
        "battery_sensor": REAL_BATTERY,
    }
    result = await _configure(hass, result, suggested(result))
    assert result["step_id"] == "ranges"
    assert suggested(result)["air_humidity_min"] == 30.0
    result = await _configure(hass, result, suggested(result))
    result = await _configure(hass, result, POT)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    data = entry.subentries[subentry_id(entry, "Fenster")].data
    assert data["species_info"]["source"] == "plant_monitor"


@pytest.mark.parametrize(
    "monstera_data", [{**MONSTERA, "moisture_sensor": OLEN_MIRROR}]
)
async def test_merge_into_existing_plant(
    hass: HomeAssistant, plant_monitor, entry: MockConfigEntry
) -> None:
    sid = subentry_id(entry, "Monstera")
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"mirror_source_{sid}")

    result = await _start_import(hass, entry)
    result = await _configure(hass, result, {"plant": "plant.monstera"})
    assert result["step_id"] == "merge"
    assert result["description_placeholders"] == {
        "plant": "Monstera",
        "rootwise_plant": "Monstera",
    }
    result = await _configure(hass, result, {})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "merged"
    await hass.async_block_till_done()

    data: dict[str, Any] = dict(entry.subentries[sid].data)
    # Real sensors from Plant Monitor, the plant's own choices otherwise kept.
    assert data["moisture_sensor"] == REAL_MOISTURE
    assert data["temperature_sensor"] == MONSTERA["temperature_sensor"]
    assert data["humidity_sensor"] == MONSTERA["humidity_sensor"]
    assert data["pot_diameter"] == 24
    assert data["species_info"]["image_url"].startswith("https://opb-img")
    assert entry.subentries[sid].unique_id == REAL_MOISTURE
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"mirror_source_{sid}") is None


async def test_no_import_without_plant_monitor(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    assert result["step_id"] == "basics"
