"""Species search through the OpenPlantbook integration (only used in flows).

Rootwise does not talk to the OpenPlantbook API itself: the user's
OpenPlantbook integration holds the credentials, Rootwise calls its actions.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey

from .species.opb import parse_detail, parse_search

OPB_DOMAIN = "openplantbook"
TIMEOUT = 15.0
CACHE_TTL = timedelta(hours=1)

_CACHE: HassKey[dict[tuple[str, str], tuple[datetime, Any]]] = HassKey(
    "rootwise_opb_cache"
)


class OpbError(HomeAssistantError):
    """OpenPlantbook did not answer usefully."""


def opb_available(hass: HomeAssistant) -> bool:
    """Return True if the OpenPlantbook integration offers its actions."""
    return hass.services.has_service(
        OPB_DOMAIN, "search"
    ) and hass.services.has_service(OPB_DOMAIN, "get")


async def _call(hass: HomeAssistant, service: str, data: dict[str, str]) -> Any:
    cache = hass.data.setdefault(_CACHE, {})
    key = (service, next(iter(data.values())).casefold())
    now = dt_util.utcnow()
    if (hit := cache.get(key)) and hit[0] > now:
        return hit[1]
    try:
        async with asyncio.timeout(TIMEOUT):
            response = await hass.services.async_call(
                OPB_DOMAIN, service, data, blocking=True, return_response=True
            )
    except (HomeAssistantError, TimeoutError) as err:
        raise OpbError(str(err)) from err
    cache[key] = (now + CACHE_TTL, response)
    return response


async def async_search(hass: HomeAssistant, query: str) -> list[tuple[str, str]]:
    """Return [(pid, display name)] matching the query."""
    return parse_search(await _call(hass, "search", {"alias": query.strip()}))


async def async_species_info(hass: HomeAssistant, pid: str) -> dict[str, Any]:
    """Return the species snapshot for one OpenPlantbook species."""
    detail = await _call(hass, "get", {"species": pid})
    if not isinstance(detail, dict) or not detail.get("pid"):
        raise OpbError(pid)
    return parse_detail(detail, hass.config.language, dt_util.utcnow().isoformat())
