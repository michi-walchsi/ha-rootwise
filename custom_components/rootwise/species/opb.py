"""Turn OpenPlantbook responses into a Rootwise species snapshot (pure Python).

The snapshot is stored with the plant, so Rootwise never needs OpenPlantbook
at runtime. Soil moisture is left out on purpose: OpenPlantbook uses the
Mi Flora scale, which does not match a capacitive probe's percent.
"""

from __future__ import annotations

from typing import Any

SOURCE = "openplantbook"

# OpenPlantbook field prefix → Rootwise measurement key.
_RANGES = {
    "temp": "temperature",
    "env_humid": "air_humidity",
    "light_lux": "illuminance",
    "soil_ec": "conductivity",
    "dli": "dli",
}


def _number(value: Any) -> float | None:
    try:
        return float(value)
    except TypeError, ValueError:
        return None


def parse_search(response: Any) -> list[tuple[str, str]]:
    """Return [(pid, display name)] from an 'openplantbook.search' response."""
    if not isinstance(response, dict):
        return []
    hits = [
        (str(pid), str(name))
        for pid, name in response.items()
        if pid and isinstance(name, str) and name
    ]
    return sorted(hits, key=lambda hit: hit[1].casefold())


def common_name(detail: dict[str, Any], language: str) -> str | None:
    """Return the first common name in the language, else in English."""
    names = detail.get("common_names")
    if not isinstance(names, list):
        return None
    scientific = str(detail.get("display_pid", "")).casefold()
    for lang in (language[:2], "en"):
        for item in names:
            if not isinstance(item, dict) or item.get("language_code") != lang:
                continue
            name = str(item.get("name") or "").strip()
            if name and name.casefold() != scientific:
                return name
    return None


def parse_detail(detail: dict[str, Any], language: str, fetched: str) -> dict[str, Any]:
    """Return the snapshot stored as the plant's species_info."""
    ranges: dict[str, dict[str, float | None]] = {}
    for prefix, key in _RANGES.items():
        low = _number(detail.get(f"min_{prefix}"))
        high = _number(detail.get(f"max_{prefix}"))
        if low is not None or high is not None:
            ranges[key] = {"min": low, "max": high}
    info: dict[str, Any] = {
        "source": SOURCE,
        "pid": str(detail.get("pid", "")),
        "scientific": str(detail.get("display_pid") or detail.get("pid", "")),
        "common": common_name(detail, language),
    }
    if image := detail.get("image_url"):
        info["image_url"] = str(image)
    info["ranges"] = ranges
    info["fetched"] = fetched
    return info
