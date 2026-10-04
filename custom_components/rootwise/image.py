"""The plant's cover photo as an image entity (for dashboards and pushes)."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.image import ImageEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .entity import RootwisePlantEntity
from .photos import photo_file

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the photo entity of each plant."""
    for plant_id, runtime in entry.runtime_data.plants.items():
        async_add_entities([PlantPhoto(hass, runtime)], config_subentry_id=plant_id)


class PlantPhoto(RootwisePlantEntity, ImageEntity):
    """Shows the cover photo; its state is when that photo was taken."""

    _attr_content_type = "image/jpeg"

    def __init__(self, hass: HomeAssistant, runtime: PlantRuntime) -> None:
        """Init both bases: the plant device and the image access tokens."""
        RootwisePlantEntity.__init__(self, runtime, "photo")
        ImageEntity.__init__(self, hass)
        self._photo_id: str | None = None

    def _refresh(self) -> Hashable:
        cover = self._runtime.cover_photo
        self._photo_id = cover["data"]["photo_id"] if cover else None
        self._attr_image_last_updated = (
            dt_util.parse_datetime(cover["ts"]) if cover else None
        )
        return self._photo_id

    async def async_image(self) -> bytes | None:
        """Return the cover photo's bytes."""
        if self._photo_id is None:
            return None
        path = photo_file(self.hass, self._runtime.config.plant_id, self._photo_id)
        try:
            return await self.hass.async_add_executor_job(path.read_bytes)
        except FileNotFoundError:
            return None
