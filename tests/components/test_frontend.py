"""The card module is served and added to every page."""

from http import HTTPStatus
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.rootwise.frontend import (
    WWW_DIR,
    async_register_cards,
    async_register_panel,
)

REGISTER = "custom_components.rootwise.frontend.panel_custom.async_register_panel"


async def test_cards_registered_and_served(
    hass: HomeAssistant, hass_client: ClientSessionGenerator
) -> None:
    assert await async_setup_component(hass, "http", {})
    hass.config.components.add("frontend")
    with patch("custom_components.rootwise.frontend.add_extra_js_url") as add:
        await async_register_cards(hass)

    (url,) = add.call_args.args[1:]
    assert url.startswith("/rootwise_static/rootwise-cards.")
    assert (WWW_DIR / url.rsplit("/", 1)[1]).is_file()

    client = await hass_client()
    response = await client.get(url)
    assert response.status == HTTPStatus.OK
    assert "javascript" in response.headers["Content-Type"]


async def test_nothing_without_frontend(hass: HomeAssistant) -> None:
    with patch("custom_components.rootwise.frontend.add_extra_js_url") as add:
        await async_register_cards(hass)
    add.assert_not_called()


async def test_missing_build_is_logged(hass: HomeAssistant, caplog) -> None:
    assert await async_setup_component(hass, "http", {})
    hass.config.components.add("frontend")
    with (
        patch("custom_components.rootwise.frontend._card_file", return_value=None),
        patch("custom_components.rootwise.frontend.add_extra_js_url") as add,
    ):
        await async_register_cards(hass)
    add.assert_not_called()
    assert "cards are missing" in caplog.text


async def _cards(hass: HomeAssistant) -> None:
    assert await async_setup_component(hass, "http", {})
    hass.config.components.add("frontend")
    with patch("custom_components.rootwise.frontend.add_extra_js_url"):
        await async_register_cards(hass)


async def test_panel_registered_once_with_the_card_module(hass: HomeAssistant) -> None:
    await _cards(hass)
    with patch(REGISTER) as register:
        await async_register_panel(hass)
        await async_register_panel(hass)  # after a reload of the entry
    register.assert_called_once()
    kwargs = register.call_args.kwargs
    assert kwargs["frontend_url_path"] == "rootwise"
    assert kwargs["webcomponent_name"] == "rootwise-panel"
    assert kwargs["module_url"].startswith("/rootwise_static/rootwise-cards.")
    assert kwargs["sidebar_icon"] == "mdi:sprout"
    assert kwargs["sidebar_title"] == "Plants"
    assert kwargs["require_admin"] is False


async def test_panel_title_follows_the_language(hass: HomeAssistant) -> None:
    hass.config.language = "de"
    await _cards(hass)
    with patch(REGISTER) as register:
        await async_register_panel(hass)
    assert register.call_args.kwargs["sidebar_title"] == "Pflanzen"


async def test_no_panel_without_cards(hass: HomeAssistant) -> None:
    with patch(REGISTER) as register:
        await async_register_panel(hass)
    register.assert_not_called()


async def test_panel_goes_with_the_entry(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    await _cards(hass)
    with patch(REGISTER):
        await async_register_panel(hass)
    with patch(
        "custom_components.rootwise.frontend.frontend.async_remove_panel"
    ) as remove:
        await hass.config_entries.async_remove(entry.entry_id)
    remove.assert_called_once_with(hass, "rootwise")
