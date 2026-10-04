"""How much water a pot takes."""

from custom_components.rootwise.engine.amount import watering_amount


def test_a_large_pot_takes_litres() -> None:
    # 24 cm, likes to dry out a bit: roughly 1.5-2 l, as in the mockup.
    assert watering_amount(24, "mostly_dry") == (1500, 1900)


def test_a_small_pot_takes_a_glass() -> None:
    assert watering_amount(12, "slightly_dry") == (200, 300)


def test_plants_that_dry_out_get_less() -> None:
    assert watering_amount(18, "dry_out") == (400, 600)
    assert watering_amount(18, "evenly_moist") == (800, 1000)


def test_unknown_style_uses_the_usual_share() -> None:
    assert watering_amount(12, "") == watering_amount(12, "slightly_dry")


def test_never_less_than_a_splash() -> None:
    assert watering_amount(5, "dry_out") == (50, 50)


def test_no_pot_size_no_amount() -> None:
    assert watering_amount(0, "mostly_dry") is None
