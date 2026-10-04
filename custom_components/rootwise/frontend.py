"""Serve the Rootwise cards, load them on every page, add the "Plants" panel.

The build puts one file with a content hash in its name into www/
(see frontend/vite.config.ts). A new version gets a new URL, so browsers and
the companion app never keep a stale card, and no dashboard resource entry
is needed. The panel is in the same file.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http.server import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.util.hass_dict import HassKey

_LOGGER = logging.getLogger(__name__)

URL_BASE = "/rootwise_static"
WWW_DIR = Path(__file__).parent / "www"
PANEL_URL = "rootwise"
PANEL_ELEMENT = "rootwise-panel"
PANEL_TITLES = {"de": "Pflanzen", "en": "Plants"}

DATA_MODULE: HassKey[str] = HassKey("rootwise_module_url")
DATA_PANEL: HassKey[bool] = HassKey("rootwise_panel")


def _card_file() -> str | None:
    # Newest if an update left an older build behind.
    files = list(WWW_DIR.glob("rootwise-cards.*.js"))
    return max(files, key=lambda f: f.stat().st_mtime).name if files else None


async def async_register_cards(hass: HomeAssistant) -> None:
    """Serve the card module and add it to every page."""
    if "frontend" not in hass.config.components or hass.http is None:
        return
    name = await hass.async_add_executor_job(_card_file)
    if name is None:
        _LOGGER.warning("Rootwise cards are missing; reinstall Rootwise")
        return
    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_BASE, str(WWW_DIR), cache_headers=True)]
    )
    url = f"{URL_BASE}/{name}"
    add_extra_js_url(hass, url)
    hass.data[DATA_MODULE] = url


async def async_register_panel(hass: HomeAssistant) -> None:
    """Add the panel to the sidebar, once: it outlives reloads of the entry.

    Removing it on every reload would throw anyone looking at it out of it.
    """
    url = hass.data.get(DATA_MODULE)
    if url is None or hass.data.get(DATA_PANEL):
        return
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=PANEL_TITLES.get(hass.config.language[:2], PANEL_TITLES["en"]),
        sidebar_icon="mdi:sprout",
        module_url=url,
        require_admin=False,
    )
    hass.data[DATA_PANEL] = True


@callback
def async_remove_panel(hass: HomeAssistant) -> None:
    """Take the panel out of the sidebar when Rootwise is removed."""
    if hass.data.pop(DATA_PANEL, False):
        frontend.async_remove_panel(hass, PANEL_URL)
