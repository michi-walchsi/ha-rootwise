"""Persistent runtime data: per-plant settings and the care journal.

Two stores keep writes small and rare (SD card): settings change seldom, the
journal only grows when care is logged. Both save with a delay and are flushed
on unload.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util, ulid as ulid_util

from .const import DOMAIN

STORAGE_VERSION = 1
SAVE_DELAY = 30  # seconds


class RootwiseStorage:
    """Load, change and save Rootwise data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Create the two stores."""
        self._data_store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.data"
        )
        self._journal_store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.journal"
        )
        self.data: dict[str, Any] = {
            "plants": {},
            "vacation": {"on": False, "until": None},
        }
        self.journal: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        """Load both stores."""
        if (data := await self._data_store.async_load()) is not None:
            self.data = data
        if (journal := await self._journal_store.async_load()) is not None:
            self.journal = journal.get("entries", [])

    async def async_flush(self) -> None:
        """Write pending changes now (before unload/reload)."""
        await self._data_store.async_save(self.data)
        await self._journal_store.async_save({"entries": self.journal})

    def plant(self, plant_id: str) -> dict[str, Any]:
        """Return (and create) the settings of one plant."""
        plants: dict[str, dict[str, Any]] = self.data.setdefault("plants", {})
        return plants.setdefault(plant_id, {"thresholds": {}, "snoozed_until": None})

    def async_prune(self, plant_ids: set[str]) -> None:
        """Drop data of plants that no longer exist."""
        plants = self.data.setdefault("plants", {})
        stale = set(plants) - plant_ids
        for plant_id in stale:
            del plants[plant_id]
        before = len(self.journal)
        self.journal = [e for e in self.journal if e["plant_id"] in plant_ids]
        if stale:
            self.async_save_data()
        if len(self.journal) != before:
            self.async_save_journal()

    def async_save_data(self) -> None:
        """Schedule a save of the settings store."""
        self._data_store.async_delay_save(lambda: self.data, SAVE_DELAY)

    def async_save_journal(self) -> None:
        """Schedule a save of the journal store."""
        self._journal_store.async_delay_save(
            lambda: {"entries": self.journal}, SAVE_DELAY
        )

    def async_add_entry(
        self,
        plant_id: str,
        care_type: str,
        source: str,
        when: datetime | None = None,
        note: str | None = None,
    ) -> dict[str, Any]:
        """Append a care entry to the journal."""
        entry: dict[str, Any] = {
            "id": ulid_util.ulid_now(),
            "plant_id": plant_id,
            "ts": (when or dt_util.utcnow()).isoformat(),
            "type": care_type,
            "source": source,
        }
        if note:
            entry["note"] = note
        self.journal.append(entry)
        self.async_save_journal()
        return entry

    def last_entry(self, plant_id: str, care_type: str) -> dict[str, Any] | None:
        """Return the newest entry of a type for a plant."""
        matches = [
            e
            for e in self.journal
            if e["plant_id"] == plant_id and e["type"] == care_type
        ]
        return max(matches, key=lambda e: e["ts"]) if matches else None

    def count_entries(self, plant_id: str) -> int:
        """Return the number of journal entries of a plant."""
        return sum(1 for e in self.journal if e["plant_id"] == plant_id)
