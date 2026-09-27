"""The card module is served and added to every page."""

from http import HTTPStatus
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.rootwise.frontend import WWW_DIR, async_register_cards


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
