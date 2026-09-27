"""Diagnostics download."""

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.components.diagnostics import (
    get_diagnostics_for_config_entry,
)
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator


async def test_diagnostics(
    hass: HomeAssistant, hass_client: ClientSessionGenerator, entry: MockConfigEntry
) -> None:
    result = await get_diagnostics_for_config_entry(hass, hass_client, entry)
    titles = sorted(p["title"] for p in result["plants"])
    assert titles == ["Efeutute", "Monstera"]
    monstera = next(p for p in result["plants"] if p["title"] == "Monstera")
    assert monstera["status"] == "ok"
    assert "data" in monstera
    assert result["vacation"] is False
