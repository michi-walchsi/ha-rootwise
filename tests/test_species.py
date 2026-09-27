"""Tests for the bundled offline species database."""

from custom_components.rootwise.species.db import SpeciesDb

VALID_TOXICITY = {"unknown", "none", "mild", "moderate", "severe"}
VALID_STYLES = {"dry_out", "mostly_dry", "slightly_dry", "evenly_moist"}


def test_bundled_database_has_ten_species() -> None:
    db = SpeciesDb.load()
    assert len(db.all()) >= 10


def test_monstera_entry() -> None:
    monstera = SpeciesDb.load().get("monstera_deliciosa")
    assert monstera is not None
    assert monstera.scientific == "Monstera deliciosa"
    assert monstera.watering_style == "mostly_dry"
    assert monstera.toxicity["cats"] == "mild"


def test_every_species_is_complete() -> None:
    for species in SpeciesDb.load().all():
        assert species.watering_style in VALID_STYLES, species.id
        assert species.summer_days < species.winter_days, species.id
        for who in ("cats", "dogs", "humans"):
            level = species.toxicity[who]
            assert level in VALID_TOXICITY, species.id
        if any(species.toxicity[w] != "unknown" for w in ("cats", "dogs")):
            assert species.toxicity_source, species.id


def test_label_follows_language() -> None:
    monstera = SpeciesDb.load().get("monstera_deliciosa")
    assert monstera is not None
    assert monstera.label("de") == "Monstera (Monstera deliciosa)"
    assert monstera.label("en") == "Swiss cheese plant (Monstera deliciosa)"
    assert monstera.label("fr") == "Swiss cheese plant (Monstera deliciosa)"


def test_unknown_species_is_none() -> None:
    assert SpeciesDb.load().get("does_not_exist") is None
