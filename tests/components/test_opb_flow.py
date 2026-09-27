"""Adding and changing plants with the OpenPlantbook species search."""

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace
from typing import Any
from unittest.mock import patch

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.data_entry_flow import FlowResult, FlowResultType
from homeassistant.exceptions import HomeAssistantError
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.const import SUBENTRY_PLANT

from .conftest import TEMPERATURE, subentry_id
from .test_config_flow import POT, suggested

FIXTURES = Path(__file__).parent.parent / "fixtures"
SEARCH = json.loads((FIXTURES / "opb_search.json").read_text(encoding="utf-8"))
DETAIL = json.loads((FIXTURES / "opb_get.json").read_text(encoding="utf-8"))


@pytest.fixture
def opb(hass: HomeAssistant) -> SimpleNamespace:
    """Stand-in for the OpenPlantbook integration's actions."""
    fake = SimpleNamespace(
        calls={"search": [], "get": []},
        responses={"search": SEARCH, "get": DETAIL},
    )

    def handler(name: str):
        async def _handle(call: ServiceCall) -> Any:
            fake.calls[name].append(dict(call.data))
            response = fake.responses[name]
            if isinstance(response, Exception):
                raise response
            if response == "hang":
                await asyncio.sleep(1)
            return response

        return _handle

    for name in ("search", "get"):
        hass.services.async_register(
            "openplantbook",
            name,
            handler(name),
            supports_response=SupportsResponse.ONLY,
        )
    return fake


async def _configure(hass: HomeAssistant, result: FlowResult, data: dict) -> FlowResult:
    return await hass.config_entries.subentries.async_configure(result["flow_id"], data)


async def _search(hass: HomeAssistant, entry: MockConfigEntry) -> FlowResult:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.MENU
    assert result["menu_options"] == ["search", "basics"]
    result = await _configure(hass, result, {"next_step_id": "search"})
    assert result["step_id"] == "search"
    return result


async def test_add_plant_from_openplantbook(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    hass.config.language = "de"
    result = await _search(hass, entry)
    result = await _configure(hass, result, {"query": "monstera"})
    assert result["step_id"] == "pick"
    assert opb.calls["search"] == [{"alias": "monstera"}]
    options = result["data_schema"].schema["pid"].config["options"]
    assert options[0] == {"value": "monstera deliciosa", "label": "Monstera deliciosa"}

    result = await _configure(hass, result, {"pid": "monstera deliciosa"})
    assert opb.calls["get"] == [{"species": "monstera deliciosa"}]
    assert result["step_id"] == "basics"
    # The name is proposed from the species, the watering style from the offline list.
    assert suggested(result)["name"] == "Monstera"
    assert suggested(result)["species"] == "monstera_deliciosa"
    hass.config.language = "en"  # English entity ids below

    result = await _configure(
        hass, result, {"name": "Monstera 2", "species": "monstera_deliciosa"}
    )
    result = await _configure(hass, result, {"temperature_sensor": TEMPERATURE})
    assert result["step_id"] == "ranges"
    assert suggested(result) == {"temperature_min": 12.0, "temperature_max": 32.0}

    result = await _configure(
        hass, result, {"temperature_min": 12.0, "temperature_max": 32.0}
    )
    assert result["step_id"] == "pot"
    result = await _configure(hass, result, POT)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()

    data = entry.subentries[subentry_id(entry, "Monstera 2")].data
    assert data["species_info"]["pid"] == "monstera deliciosa"
    assert data["species_info"]["image_url"].startswith("https://opb-img")
    # Unchanged ranges stay with the species, so a later refresh applies.
    assert "ranges" not in data

    mirror = hass.states.get("sensor.monstera_2_temperature")
    assert mirror.attributes["range_source"] == "openplantbook"
    assert mirror.attributes["min"] == 12.0
    status = hass.states.get("sensor.monstera_2_status")
    assert status.attributes["entity_picture"] == data["species_info"]["image_url"]


async def test_changed_range_is_stored(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    result = await _search(hass, entry)
    result = await _configure(hass, result, {"query": "monstera"})
    result = await _configure(hass, result, {"pid": "monstera deliciosa"})
    result = await _configure(hass, result, {"name": "Monstera 2"})
    result = await _configure(hass, result, {"temperature_sensor": TEMPERATURE})
    result = await _configure(
        hass, result, {"temperature_min": 16.0, "temperature_max": 32.0}
    )
    result = await _configure(hass, result, POT)
    data = entry.subentries[subentry_id(entry, "Monstera 2")].data
    assert data["ranges"] == {"temperature": {"min": 16.0, "max": 32.0}}


async def test_ranges_step_skipped_without_climate_sensors(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    result = await _search(hass, entry)
    result = await _configure(hass, result, {"query": "monstera"})
    result = await _configure(hass, result, {"pid": "monstera deliciosa"})
    result = await _configure(hass, result, {"name": "Monstera 2"})
    result = await _configure(hass, result, {})
    assert result["step_id"] == "pot"


async def test_empty_pick_searches_again_from_cache(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    result = await _search(hass, entry)
    result = await _configure(hass, result, {"query": "monstera"})
    result = await _configure(hass, result, {})
    assert result["step_id"] == "search"
    assert suggested(result)["query"] == "monstera"
    result = await _configure(hass, result, {"query": "Monstera "})
    assert result["step_id"] == "pick"
    assert len(opb.calls["search"]) == 1


async def test_no_results(hass: HomeAssistant, entry: MockConfigEntry, opb) -> None:
    opb.responses["search"] = {}
    result = await _search(hass, entry)
    result = await _configure(hass, result, {"query": "xyz"})
    assert result["step_id"] == "search"
    assert result["errors"] == {"base": "no_results"}


@pytest.mark.parametrize("failure", [HomeAssistantError("429"), "hang"])
async def test_openplantbook_failure(
    hass: HomeAssistant, entry: MockConfigEntry, opb, failure
) -> None:
    opb.responses["search"] = failure
    result = await _search(hass, entry)
    with patch("custom_components.rootwise.opb.TIMEOUT", 0.05):
        result = await _configure(hass, result, {"query": "monstera"})
    assert result["step_id"] == "search"
    assert result["errors"] == {"base": "opb_failed"}


async def test_basics_without_search(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    result = await _configure(hass, result, {"next_step_id": "basics"})
    assert result["step_id"] == "basics"


async def test_reconfigure_refreshes_species(
    hass: HomeAssistant, entry: MockConfigEntry, opb
) -> None:
    sid = subentry_id(entry, "Monstera")
    result = await entry.start_subentry_reconfigure_flow(hass, sid)
    assert result["type"] is FlowResultType.MENU
    assert result["menu_options"] == ["search", "basics"]
    result = await _configure(hass, result, {"next_step_id": "search"})
    # The offline species gives the first search term.
    assert suggested(result)["query"] == "Monstera deliciosa"

    result = await _configure(hass, result, {"query": "Monstera deliciosa"})
    result = await _configure(hass, result, {"pid": "monstera deliciosa"})
    assert result["step_id"] == "basics"
    assert suggested(result)["name"] == "Monstera"  # keeps its own name

    result = await _configure(hass, result, suggested(result))
    result = await _configure(hass, result, suggested(result))
    assert result["step_id"] == "ranges"
    result = await _configure(hass, result, suggested(result))
    result = await _configure(hass, result, suggested(result))
    assert result["reason"] == "reconfigure_successful"
    assert entry.subentries[sid].data["species_info"]["pid"] == "monstera deliciosa"
