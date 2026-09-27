"""Serve the Rootwise cards and load them on every dashboard.

The build puts one file with a content hash in its name into www/
(see frontend/vite.config.ts). A new version gets a new URL, so browsers and
the companion app never keep a stale card, and no dashboard resource entry
is needed.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http.server import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

URL_BASE = "/rootwise_static"
WWW_DIR = Path(__file__).parent / "www"


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
    add_extra_js_url(hass, f"{URL_BASE}/{name}")
