"""OpenPlantbook responses → Rootwise species snapshot."""

import json
from pathlib import Path

from custom_components.rootwise.species.db import SpeciesDb
from custom_components.rootwise.species.opb import (
    common_name,
    parse_detail,
    parse_search,
)

FIXTURES = Path(__file__).parent / "fixtures"
SEARCH = json.loads((FIXTURES / "opb_search.json").read_text(encoding="utf-8"))
DETAIL = json.loads((FIXTURES / "opb_get.json").read_text(encoding="utf-8"))


def test_parse_search_sorted_by_name() -> None:
    assert parse_search(SEARCH) == [
        ("monstera deliciosa", "Monstera deliciosa"),
        ("monstera friedrichsthalii", "Monstera friedrichsthalii"),
    ]


def test_parse_search_tolerates_odd_responses() -> None:
    assert parse_search(None) == []
    assert parse_search({"x": None, "": "y", "pid": "Name"}) == [("pid", "Name")]
    assert parse_search(["not", "a", "dict"]) == []


def test_parse_detail_snapshot() -> None:
    info = parse_detail(DETAIL, "de", "2026-09-27T12:00:00+00:00")
    assert info == {
        "source": "openplantbook",
        "pid": "monstera deliciosa",
        "scientific": "Monstera deliciosa",
        "common": "Monstera",
        "image_url": "https://opb-img.plantbook.io/monstera%20deliciosa.jpg",
        "ranges": {
            "temperature": {"min": 12.0, "max": 32.0},
            "air_humidity": {"min": 30.0, "max": 85.0},
            "illuminance": {"min": 800.0, "max": 15000.0},
            "conductivity": {"min": 350.0, "max": 2000.0},
            "dli": {"min": 5.4, "max": 12.2},
        },
        "fetched": "2026-09-27T12:00:00+00:00",
    }


def test_soil_moisture_is_ignored() -> None:
    # OpenPlantbook's moisture uses the Mi Flora scale, not the sensor's percent.
    info = parse_detail(DETAIL, "en", "t")
    assert "soil_moisture" not in info["ranges"]


def test_parse_detail_with_gaps() -> None:
    info = parse_detail(
        {"pid": "x y", "display_pid": "X y", "min_temp": "10", "max_temp": None},
        "de",
        "t",
    )
    assert info["ranges"] == {"temperature": {"min": 10.0, "max": None}}
    assert info["common"] is None
    assert "image_url" not in info


def test_common_name_prefers_language_then_english() -> None:
    assert common_name(DETAIL, "de") == "Monstera"
    assert common_name(DETAIL, "en") == "Cheese Plant"
    assert common_name(DETAIL, "it") == "Cheese Plant"
    assert common_name({"common_names": "broken"}, "de") is None


def test_find_offline_species_by_scientific_name() -> None:
    db = SpeciesDb.load()
    assert db.find_scientific("monstera deliciosa").id == "monstera_deliciosa"
    assert db.find_scientific("Monstera Deliciosa").id == "monstera_deliciosa"
    assert db.find_scientific("monstera friedrichsthalii") is None
