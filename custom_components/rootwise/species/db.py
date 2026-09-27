"""Bundled offline species database (pure Python, blocking file read)."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from functools import cache
import json
from pathlib import Path
from typing import Any

_DATA_FILE = Path(__file__).with_name("houseplants.json")


@dataclass(frozen=True, slots=True)
class Species:
    """Care data for one species."""

    id: str
    scientific: str
    common: Mapping[str, str]
    aliases: tuple[str, ...]
    watering_style: str
    summer_days: float
    winter_days: float
    temp_min: float
    temp_max: float
    humidity_min: float
    dli_min: float
    dli_max: float
    fertilize_weeks: int
    repot_years: int
    large_leaves: bool
    toxicity: Mapping[str, str]
    toxicity_note: str
    toxicity_source: str

    def label(self, language: str) -> str:
        """Return 'Common name (Scientific name)' in the given language."""
        name = self.common.get(language[:2]) or self.common["en"]
        return f"{name} ({self.scientific})"

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any], sources: Mapping[str, str]) -> Species:
        """Build a species from its JSON record."""
        tox = raw["toxicity"]
        return cls(
            id=raw["id"],
            scientific=raw["scientific"],
            common=dict(raw["common"]),
            aliases=tuple(raw.get("aliases", ())),
            watering_style=raw["watering_style"],
            summer_days=float(raw["interval_days"]["summer"]),
            winter_days=float(raw["interval_days"]["winter"]),
            temp_min=float(raw["temp"]["min"]),
            temp_max=float(raw["temp"]["max"]),
            humidity_min=float(raw["humidity_min"]),
            dli_min=float(raw["dli"]["min"]),
            dli_max=float(raw["dli"]["max"]),
            fertilize_weeks=int(raw["fertilize_weeks"]),
            repot_years=int(raw["repot_years"]),
            large_leaves=bool(raw["large_leaves"]),
            toxicity={k: tox[k] for k in ("cats", "dogs", "humans")},
            toxicity_note=tox.get("note", ""),
            toxicity_source=sources.get(tox.get("source", ""), tox.get("source", "")),
        )


class SpeciesDb:
    """Read-only collection of species."""

    def __init__(self, species: list[Species]) -> None:
        """Index the species by id."""
        self._by_id = {s.id: s for s in species}

    @classmethod
    def load(cls) -> SpeciesDb:
        """Load the bundled database (cached; blocking I/O on first call)."""
        return _load_bundled()

    def all(self) -> list[Species]:
        """Return all species."""
        return list(self._by_id.values())

    def get(self, species_id: str) -> Species | None:
        """Return one species or None."""
        return self._by_id.get(species_id)


@cache
def _load_bundled() -> SpeciesDb:
    raw = json.loads(_DATA_FILE.read_text(encoding="utf-8"))
    sources = raw.get("sources", {})
    return SpeciesDb([Species.from_dict(item, sources) for item in raw["species"]])
