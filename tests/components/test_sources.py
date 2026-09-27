"""Plant Monitor mirror sensors: detection, flow, and the repair that swaps them."""

from http import HTTPStatus
from typing import Any

from homeassistant.config_entries import SOURCE_RECONFIGURE
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    entity_registry as er,
    issue_registry as ir,
)
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT
from custom_components.rootwise.sources import is_mirror, mirror_entities, resolve
from custom_components.rootwise.suggest import suggest_sensors

from .conftest import MOISTURE, MONSTERA, TEMPERATURE, subentry_id
from .test_config_flow import suggested

OLEN_MOISTURE = "sensor.monstera_bodenfeuchtigkeit"
OLEN_TEMPERATURE = "sensor.monstera_temperatur"
OLEN_ORPHAN = "sensor.monstera_leitfahigkeit"


async def _register_olen(hass: HomeAssistant) -> None:
    """Register Plant Monitor mirrors the way Olen's integration creates them."""
    ent_reg = er.async_get(hass)
    for entity_id, suffix, source, attrs in (
        (OLEN_MOISTURE, "current-moisture", MOISTURE, {"device_class": "moisture"}),
        (
            OLEN_TEMPERATURE,
            "current-temperature",
            TEMPERATURE,
            {"device_class": "temperature"},
        ),
        (OLEN_ORPHAN, "current-conductivity", None, {}),
    ):
        ent_reg.async_get_or_create(
            "sensor",
            "plant",
            f"01M2JV48437CF9XWC51DHNS20R-{suffix}",
            suggested_object_id=entity_id.split(".")[1],
        )
        if source:
            hass.states.async_set(entity_id, "40", {**attrs, "external_sensor": source})


@pytest.fixture
async def olen(hass: HomeAssistant) -> None:
    """Plant Monitor's Monstera mirrors."""
    await _register_olen(hass)


@pytest.fixture
def monstera_data(olen) -> dict[str, Any]:
    """The Monstera as v0.1 set it up: reading Plant Monitor's mirrors."""
    return {
        **MONSTERA,
        "moisture_sensor": OLEN_MOISTURE,
        "temperature_sensor": OLEN_TEMPERATURE,
    }


async def test_mirror_detection(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert is_mirror(hass, OLEN_MOISTURE)
    assert not is_mirror(hass, MOISTURE)
    assert resolve(hass, OLEN_MOISTURE) == MOISTURE
    assert resolve(hass, MOISTURE) == MOISTURE
    # A mirror without a known source can't be resolved.
    assert resolve(hass, OLEN_ORPHAN) is None
    # Rootwise's own mirrors count too, and chains resolve to the real sensor.
    assert is_mirror(hass, "sensor.monstera_soil_moisture")
    assert resolve(hass, "sensor.monstera_soil_moisture") == MOISTURE
    assert {OLEN_MOISTURE, "sensor.monstera_soil_moisture"} <= set(
        mirror_entities(hass)
    )


async def test_flow_hides_mirrors(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": "user"}
    )
    selector = result["data_schema"].schema["moisture_sensor"]
    assert OLEN_MOISTURE in selector.config["exclude_entities"]
    assert MOISTURE not in selector.config["exclude_entities"]


async def test_suggestions_skip_mirrors(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    area = ar.async_get(hass).async_create("Wohnzimmer")
    ent_reg = er.async_get(hass)
    ent_reg.async_update_entity(OLEN_TEMPERATURE, area_id=area.id)
    ent_reg.async_update_entity(
        ent_reg.async_get_or_create(
            "sensor",
            "mqtt",
            "room-temp",
            suggested_object_id="room_temperature",
            original_device_class="temperature",
        ).entity_id,
        area_id=area.id,
    )
    hass.states.async_set(OLEN_TEMPERATURE, "22", {"device_class": "temperature"})
    ent_reg.async_update_entity(OLEN_TEMPERATURE, original_device_class="temperature")

    suggestions = suggest_sensors(hass, None, area.id)
    assert suggestions["temperature_sensor"] == "sensor.room_temperature"


async def test_reconfigure_swaps_mirrors_for_real_sensors(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT),
        context={
            "source": SOURCE_RECONFIGURE,
            "subentry_id": subentry_id(entry, "Monstera"),
        },
    )
    assert suggested(result)["moisture_sensor"] == MOISTURE

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Monstera", "moisture_sensor": MOISTURE}
    )
    assert suggested(result)["temperature_sensor"] == TEMPERATURE


async def test_repair_issue_is_raised(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    issue = ir.async_get(hass).async_get_issue(
        DOMAIN, f"mirror_source_{subentry_id(entry, 'Monstera')}"
    )
    assert issue is not None
    assert issue.is_fixable
    assert issue.translation_placeholders == {"plant": "Monstera"}


async def _fix(
    hass: HomeAssistant, client_factory: ClientSessionGenerator, issue_id: str
) -> dict[str, Any]:
    assert await async_setup_component(hass, "repairs", {})
    client = await client_factory()
    resp = await client.post(
        "/api/repairs/issues/fix", json={"handler": DOMAIN, "issue_id": issue_id}
    )
    assert resp.status == HTTPStatus.OK
    flow = await resp.json()
    assert flow["step_id"] == "confirm"
    assert MOISTURE in flow["description_placeholders"]["changes"]
    resp = await client.post(f"/api/repairs/issues/fix/{flow['flow_id']}", json={})
    assert resp.status == HTTPStatus.OK
    return await resp.json()


async def test_repair_switches_to_real_sensors(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
) -> None:
    sid = subentry_id(entry, "Monstera")
    result = await _fix(hass, hass_client, f"mirror_source_{sid}")
    assert result["type"] == "create_entry"
    await hass.async_block_till_done()

    plant = entry.subentries[sid]
    assert plant.data["moisture_sensor"] == MOISTURE
    assert plant.data["temperature_sensor"] == TEMPERATURE
    assert plant.unique_id == MOISTURE
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"mirror_source_{sid}") is None
    # The Rootwise mirror now follows the real sensor.
    mirror = hass.states.get("sensor.monstera_soil_moisture")
    assert mirror.attributes["source"] == MOISTURE


@pytest.mark.parametrize(
    "monstera_data",
    [
        {
            **MONSTERA,
            "moisture_sensor": OLEN_MOISTURE,
            "conductivity_sensor": OLEN_ORPHAN,
        }
    ],
)
async def test_repair_opens_plant_settings_when_source_unknown(
    hass: HomeAssistant,
    olen,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
) -> None:
    sid = subentry_id(entry, "Monstera")
    result = await _fix(hass, hass_client, f"mirror_source_{sid}")
    assert result["type"] == "create_entry"
    flow_type, flow_id = result["next_flow"]
    assert flow_type == "config_subentries_flow"
    flow = hass.config_entries.subentries.async_get(flow_id)
    assert flow["context"]["subentry_id"] == sid


async def test_issue_removed_with_plant(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    sid = subentry_id(entry, "Monstera")
    assert hass.config_entries.async_remove_subentry(entry, sid)
    await hass.async_block_till_done()
    assert ir.async_get(hass).async_get_issue(DOMAIN, f"mirror_source_{sid}") is None
