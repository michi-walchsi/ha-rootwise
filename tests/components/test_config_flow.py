"""Config, options and plant subentry flows."""

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.rootwise.const import DOMAIN, SUBENTRY_PLANT

from .conftest import MOISTURE, subentry_id

POT_DEFAULTS = {
    "pot_diameter": 14,
    "pot_material": "terracotta",
    "drainage": True,
    "window": "e",
    "location": "indoor",
}


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


async def test_add_plant(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Grünlilie",
            "species": "chlorophytum_comosum",
            "sensors": {},
            "pot_and_place": POT_DEFAULTS,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    sid = subentry_id(entry, "Grünlilie")
    data = entry.subentries[sid].data
    assert data["species"] == "chlorophytum_comosum"
    assert data["pot_material"] == "terracotta"
    assert "moisture_sensor" not in data


async def test_moisture_sensor_cannot_be_shared(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await hass.config_entries.subentries.async_init(
        (entry.entry_id, SUBENTRY_PLANT), context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Zweite",
            "species": "goeppertia",
            "sensors": {"moisture_sensor": MOISTURE},
            "pot_and_place": POT_DEFAULTS,
        },
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "sensor_in_use"}


async def test_reconfigure_plant(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    sid = subentry_id(entry, "Monstera")
    result = await entry.start_subentry_reconfigure_flow(hass, sid)
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Große Monstera",
            "species": "monstera_deliciosa",
            "sensors": {"moisture_sensor": MOISTURE},
            "pot_and_place": {**POT_DEFAULTS, "pot_diameter": 30},
        },
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.subentries[sid].title == "Große Monstera"
    assert entry.subentries[sid].data["pot_diameter"] == 30


async def test_options_flow(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"notify_devices": [], "digest_time": "07:30:00"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["digest_time"] == "07:30:00"
