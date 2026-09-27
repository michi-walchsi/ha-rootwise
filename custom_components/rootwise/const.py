"""Constants for Rootwise."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

DOMAIN: Final = "rootwise"
SUBENTRY_PLANT: Final = "plant"

# Plant subentry data (flattened) and flow form sections
CONF_SPECIES: Final = "species"
CONF_AREA: Final = "area"
CONF_MOISTURE_SENSOR: Final = "moisture_sensor"
CONF_TEMPERATURE_SENSOR: Final = "temperature_sensor"
CONF_BATTERY_SENSOR: Final = "battery_sensor"
CONF_POT_DIAMETER: Final = "pot_diameter"
CONF_POT_MATERIAL: Final = "pot_material"
CONF_DRAINAGE: Final = "drainage"
CONF_WINDOW: Final = "window"
CONF_LOCATION: Final = "location"

CONF_HUMIDITY_SENSOR: Final = "humidity_sensor"
CONF_ILLUMINANCE_SENSOR: Final = "illuminance_sensor"
CONF_CONDUCTIVITY_SENSOR: Final = "conductivity_sensor"

# Plant flow steps: basics -> further sensors -> pot and place
BASIC_KEYS: Final[tuple[str, ...]] = (CONF_SPECIES, CONF_AREA, CONF_MOISTURE_SENSOR)
SENSOR_KEYS: Final[tuple[str, ...]] = (
    CONF_TEMPERATURE_SENSOR,
    CONF_HUMIDITY_SENSOR,
    CONF_ILLUMINANCE_SENSOR,
    CONF_CONDUCTIVITY_SENSOR,
    CONF_BATTERY_SENSOR,
)
POT_KEYS: Final[tuple[str, ...]] = (
    CONF_POT_DIAMETER,
    CONF_POT_MATERIAL,
    CONF_DRAINAGE,
    CONF_WINDOW,
    CONF_LOCATION,
)
SENSOR_DEVICE_CLASSES: Final[dict[str, str]] = {
    CONF_TEMPERATURE_SENSOR: "temperature",
    CONF_HUMIDITY_SENSOR: "humidity",
    CONF_ILLUMINANCE_SENSOR: "illuminance",
    CONF_CONDUCTIVITY_SENSOR: "conductivity",
    CONF_BATTERY_SENSOR: "battery",
}

POT_MATERIALS: Final = ["plastic", "terracotta", "ceramic_glazed", "self_watering"]
WINDOWS: Final = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "none"]
LOCATIONS: Final = ["indoor", "balcony", "outdoor"]

# Main entry options
CONF_NOTIFY_DEVICES: Final = "notify_devices"
CONF_DIGEST_TIME: Final = "digest_time"
DEFAULT_DIGEST_TIME: Final = "08:00:00"

# Care log
CARE_WATERED: Final = "watered"
CARE_FERTILIZED: Final = "fertilized"
CARE_TYPES: Final = [
    CARE_WATERED,
    CARE_FERTILIZED,
    "repotted",
    "cleaned",
    "rotated",
    "pest_check",
    "pruned",
    "note",
]

DEFAULT_SNOOZE: Final = timedelta(days=1)
DEFAULT_INTERVAL: Final = (7.0, 12.0)  # summer, winter days for unknown species

# Generated to-do summaries in the language of the Home Assistant instance
TODO_WATER_SUMMARY: Final = {"de": "{name} gießen", "en": "Water {name}"}
