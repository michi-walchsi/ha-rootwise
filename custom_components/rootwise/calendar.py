"""The 'Plant care' calendar: next waterings ahead, care done behind.

Read-only. Each plant shows its next watering as an all-day event (today if
it is overdue); the journal shows up as short past events.
"""

from __future__ import annotations

from collections.abc import Hashable
from datetime import date, datetime, timedelta
from typing import TYPE_CHECKING, Final

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import CALENDAR_TEXTS, CARE_NAMES
from .entity import RootwiseHubEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import RootwiseHub

PAST_LENGTH: Final = timedelta(minutes=15)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the plant care calendar."""
    async_add_entities([PlantCareCalendar(entry.runtime_data)])


class PlantCareCalendar(RootwiseHubEntity, CalendarEntity):
    """Next waterings and past care of all plants."""

    def __init__(self, hub: RootwiseHub) -> None:
        """Init."""
        super().__init__(hub, "care_calendar")

    def _texts(self) -> dict[str, str]:
        lang = self.hass.config.language[:2]
        return CALENDAR_TEXTS.get(lang, CALENDAR_TEXTS["en"])

    def _care_name(self, care_type: str) -> str:
        names = CARE_NAMES.get(self.hass.config.language[:2], CARE_NAMES["en"])
        return names.get(care_type, care_type)

    def _upcoming(self) -> list[CalendarEvent]:
        texts = self._texts()
        today = dt_util.now().date()
        events = []
        for plant in self._hub.plants.values():
            upcoming = plant.next_watering()
            if upcoming is None:
                continue
            day = max(dt_util.as_local(upcoming["due"]).date(), today)
            description = None
            if "earliest" in upcoming and "latest" in upcoming:
                description = texts["window"].format(
                    earliest=_day(upcoming["earliest"]), latest=_day(upcoming["latest"])
                )
            events.append(
                CalendarEvent(
                    start=day,
                    end=day + timedelta(days=1),
                    summary=texts["water"].format(name=plant.config.name),
                    description=description,
                    uid=f"{plant.config.plant_id}:next",
                )
            )
        return sorted(events, key=lambda e: (e.start, e.summary))

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next watering of any plant."""
        upcoming = self._upcoming()
        return upcoming[0] if upcoming else None

    def _refresh(self) -> Hashable:
        event = self.event
        return (event.summary, event.start) if event else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Return next waterings and logged care in the range."""
        events = [
            e
            for e in self._upcoming()
            if e.start_datetime_local < end_date and e.end_datetime_local > start_date
        ]
        storage = self._hub.storage
        for plant_id, plant in self._hub.plants.items():
            for entry in storage.entries(plant_id, 1000):
                at = dt_util.parse_datetime(entry["ts"])
                if at is None or not start_date <= at < end_date:
                    continue
                what = self._care_name(entry["type"])
                events.append(
                    CalendarEvent(
                        start=at,
                        end=at + PAST_LENGTH,
                        summary=f"{plant.config.name}: {what}",
                        uid=entry["id"],
                    )
                )
        return sorted(events, key=lambda e: e.start_datetime_local)


def _day(value: datetime | date) -> str:
    if isinstance(value, datetime):
        value = dt_util.as_local(value).date()
    return f"{value.day:02d}.{value.month:02d}."
