"""Creating plants from the panel's wizard, checked like the HA dialog."""

from typing import Any
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.opb import OpbError

from .conftest import MOISTURE, TEMPERATURE, Client

INFO: dict[str, Any] = {
    "pid": "monstera deliciosa",
    "scientific": "Monstera deliciosa",
    "common": "Fensterblatt",
    "image_url": "https://example.com/monstera.jpg",
    "source": "openplantbook",
    "ranges": {},
}


async def _created(hass: HomeAssistant, entry: MockConfigEntry, result: dict) -> Any:
    await hass.async_block_till_done()
    return entry.subentries[result["plant_id"]]


async def test_create_with_defaults(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    result = await client.result("rootwise/plants/create", name="  Basilikum ")
    subentry = await _created(hass, entry, result)
    assert subentry.title == "Basilikum"
    assert subentry.subentry_type == "plant"
    assert dict(subentry.data) == {
        "pot_diameter": 18,
        "pot_material": "plastic",
        "drainage": True,
        "window": "none",
        "location": "indoor",
    }
    names = [p["name"] for p in (await client.result("rootwise/plants"))["plants"]]
    assert "Basilikum" in names


async def test_create_with_species_room_sensors_and_pot(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    kitchen = ar.async_get(hass).async_create("Küche")
    hass.states.async_set(
        "sensor.basil_soil",
        "40",
        {"device_class": "moisture", "unit_of_measurement": "%"},
    )
    result = await client.result(
        "rootwise/plants/create",
        name="Efeu Küche",
        species="epipremnum_aureum",
        area_id=kitchen.id,
        sensors={
            "moisture_sensor": "sensor.basil_soil",
            "temperature_sensor": TEMPERATURE,
        },
        pot={
            "pot_diameter": 14,
            "pot_material": "terracotta",
            "drainage": False,
            "window": "s",
            "location": "indoor",
        },
    )
    subentry = await _created(hass, entry, result)
    assert subentry.unique_id == "sensor.basil_soil"
    assert dict(subentry.data) == {
        "species": "epipremnum_aureum",
        "area": kitchen.id,
        "moisture_sensor": "sensor.basil_soil",
        "temperature_sensor": TEMPERATURE,
        "pot_diameter": 14,
        "pot_material": "terracotta",
        "drainage": False,
        "window": "s",
        "location": "indoor",
    }


async def test_a_mirror_becomes_the_real_sensor(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    mirror = "sensor.monstera_temperature"
    assert hass.states.get(mirror).attributes["source"] == TEMPERATURE
    result = await client.result(
        "rootwise/plants/create", name="Zweite", sensors={"temperature_sensor": mirror}
    )
    subentry = await _created(hass, entry, result)
    assert subentry.data["temperature_sensor"] == TEMPERATURE


async def test_species_from_openplantbook(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    with patch(
        "custom_components.rootwise.plant_data.async_species_info", return_value=INFO
    ):
        result = await client.result(
            "rootwise/plants/create", name="Fensterblatt", opb_pid="monstera deliciosa"
        )
    subentry = await _created(hass, entry, result)
    assert subentry.data["species_info"] == INFO
    # The offline list knows it too: watering style and toxicity come from there.
    assert subentry.data["species"] == "monstera_deliciosa"


async def test_refusals(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client, user_client: Client
) -> None:
    cases: dict[str, dict[str, Any]] = {
        "name_missing": {"name": "   "},
        "sensor_in_use": {"name": "X", "sensors": {"moisture_sensor": MOISTURE}},
        "unknown_species": {"name": "X", "species": "nope"},
        "unknown_area": {"name": "X", "area_id": "nope"},
        "unknown_sensor": {
            "name": "X",
            "sensors": {"temperature_sensor": "sensor.nope"},
        },
    }
    for code, data in cases.items():
        response = await client.call("rootwise/plants/create", **data)
        assert response["error"]["code"] == code, code

    with patch(
        "custom_components.rootwise.plant_data.async_species_info",
        side_effect=OpbError("down"),
    ):
        response = await client.call("rootwise/plants/create", name="X", opb_pid="x")
    assert response["error"]["code"] == "opb_failed"

    response = await user_client.call("rootwise/plants/create", name="X")
    assert response["error"]["code"] == "unauthorized"
    assert len(entry.subentries) == 2


async def test_species_search_offline(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    result = await client.result("rootwise/species/search", query="efeu")
    assert result["opb"] is False
    offline = [s for s in result["species"] if s["source"] == "offline"]
    assert offline[0]["id"] == "epipremnum_aureum"
    assert offline[0]["scientific"] == "Epipremnum aureum"


async def test_species_search_with_openplantbook(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    with (
        patch("custom_components.rootwise.plant_data.opb_available", return_value=True),
        patch(
            "custom_components.rootwise.plant_data.async_search",
            return_value=[("monstera deliciosa", "Monstera deliciosa")],
        ),
    ):
        result = await client.result("rootwise/species/search", query="monstera")
    assert result["opb"] is True
    assert {s["source"] for s in result["species"]} == {"openplantbook", "offline"}
    assert result["species"][0] == {
        "source": "openplantbook",
        "pid": "monstera deliciosa",
        "label": "Monstera deliciosa",
    }

    with (
        patch("custom_components.rootwise.plant_data.opb_available", return_value=True),
        patch(
            "custom_components.rootwise.plant_data.async_search",
            side_effect=OpbError("down"),
        ),
    ):
        result = await client.result("rootwise/species/search", query="monstera")
    assert result["opb_failed"] is True
    assert result["species"]


async def test_species_info(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    with patch(
        "custom_components.rootwise.plant_data.async_species_info", return_value=INFO
    ):
        result = await client.result("rootwise/species/info", pid="monstera deliciosa")
    assert result == {"info": INFO, "species": "monstera_deliciosa"}


async def test_sensor_candidates_with_live_values(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    result = await client.result("rootwise/sensors/suggest")
    candidates = result["candidates"]
    probe = next(
        c for c in candidates["temperature_sensor"] if c["entity_id"] == TEMPERATURE
    )
    assert (probe["state"], probe["unit"]) == ("22.46", "°C")
    soil = next(c for c in candidates["moisture_sensor"] if c["entity_id"] == MOISTURE)
    assert soil["in_use"] is True
    shown = {c["entity_id"] for group in candidates.values() for c in group}
    assert not any(e.startswith("sensor.monstera_") for e in shown)  # mirrors


async def test_suggestions_follow_the_soil_sensor_and_room(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    with patch(
        "custom_components.rootwise.plant_data.suggest_sensors",
        return_value={"temperature_sensor": TEMPERATURE},
    ) as suggest:
        result = await client.result(
            "rootwise/sensors/suggest", moisture_sensor=MOISTURE, area_id="kitchen"
        )
    assert suggest.call_args.args[1:] == (MOISTURE, "kitchen")
    assert result["suggested"] == {"temperature_sensor": TEMPERATURE}
