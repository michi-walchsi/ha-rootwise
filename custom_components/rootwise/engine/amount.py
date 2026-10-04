"""How much water a pot takes (pure Python).

A pot is about as high as it is wide and narrows towards the bottom, so it
holds roughly 0.7 * d^3 ml of soil for a diameter of d cm. A thorough watering
wets 15-25 % of that; plants that like to dry out get less.
"""

from __future__ import annotations

from typing import Final

# Share of the soil volume per watering, by watering style.
SHARE: Final[dict[str, tuple[float, float]]] = {
    "dry_out": (0.10, 0.15),
    "mostly_dry": (0.15, 0.20),
    "slightly_dry": (0.15, 0.25),
    "evenly_moist": (0.20, 0.25),
}
DEFAULT_SHARE: Final = SHARE["slightly_dry"]


def _round(ml: float) -> int:
    step = 50 if ml < 1000 else 100
    return max(step, round(ml / step) * step)


def watering_amount(diameter_cm: float, style: str) -> tuple[int, int] | None:
    """Return (from, to) in ml for one watering, or None without a pot size."""
    if diameter_cm <= 0:
        return None
    volume = 0.7 * diameter_cm**3
    low, high = SHARE.get(style, DEFAULT_SHARE)
    return _round(volume * low), _round(volume * high)
