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
CONF_NOTIFY_DETECTED: Final = "notify_detected"
CONF_QUIET_START: Final = "quiet_start"
CONF_QUIET_END: Final = "quiet_end"
DEFAULT_QUIET_START: Final = "22:00:00"
DEFAULT_QUIET_END: Final = "07:00:00"
# Points below the dry threshold that count as "very dry" (a push at once).
VERY_DRY_MARGIN: Final = 10.0

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
    "sensor_moved",
    "note",
]
CARE_SENSOR_MOVED: Final = "sensor_moved"
# A photo is a journal entry too, but not logged like care (it needs a file).
CARE_PHOTO: Final = "photo"
# Journal source of waterings Rootwise found in the sensor data itself.
SOURCE_AUTO: Final = "auto"
EVENT_WATERING_DETECTED: Final = "rootwise_watering_detected"
# Logging a time this far ahead is a typo or a wrong phone clock.
FUTURE_TOLERANCE: Final = timedelta(minutes=5)
SIGNAL_UPDATE: Final = f"{DOMAIN}_update"

DEFAULT_SNOOZE: Final = timedelta(days=1)
DEFAULT_INTERVAL: Final = (7.0, 12.0)  # summer, winter days for unknown species

# Generated to-do summaries in the language of the Home Assistant instance
TODO_WATER_SUMMARY: Final = {"de": "{name} gießen", "en": "Water {name}"}
CALENDAR_TEXTS: Final[dict[str, dict[str, str]]] = {
    "de": {"water": "{name} gießen", "window": "Zwischen {earliest} und {latest}"},
    "en": {"water": "Water {name}", "window": "Between {earliest} and {latest}"},
}
CARE_NAMES: Final[dict[str, dict[str, str]]] = {
    "de": {
        "watered": "Gegossen",
        "fertilized": "Gedüngt",
        "repotted": "Umgetopft",
        "cleaned": "Blätter gereinigt",
        "rotated": "Gedreht",
        "pest_check": "Auf Schädlinge geprüft",
        "pruned": "Geschnitten",
        "sensor_moved": "Sensor umgesteckt",
        "note": "Notiz",
        "photo": "Foto",
    },
    "en": {
        "watered": "Watered",
        "fertilized": "Fertilized",
        "repotted": "Repotted",
        "cleaned": "Leaves cleaned",
        "rotated": "Rotated",
        "pest_check": "Checked for pests",
        "pruned": "Pruned",
        "sensor_moved": "Sensor moved",
        "note": "Note",
        "photo": "Photo",
    },
}

# Measurements mirrored onto the plant device: (key, source field, device class)
MEASUREMENTS: Final[tuple[tuple[str, str, str], ...]] = (
    ("soil_moisture", CONF_MOISTURE_SENSOR, "moisture"),
    ("temperature", CONF_TEMPERATURE_SENSOR, "temperature"),
    ("air_humidity", CONF_HUMIDITY_SENSOR, "humidity"),
    ("illuminance", CONF_ILLUMINANCE_SENSOR, "illuminance"),
    ("conductivity", CONF_CONDUCTIVITY_SENSOR, "conductivity"),
    ("battery", CONF_BATTERY_SENSOR, "battery"),
)
BATTERY_LOW: Final = 15.0
MIRROR_THROTTLE: Final = timedelta(seconds=60)

# Subentry data written by the species search / Plant Monitor import (optional)
CONF_SPECIES_INFO: Final = "species_info"
CONF_RANGES: Final = "ranges"

# Entities per plant (unique id suffixes), used to clean up leftovers
PLANT_ENTITY_KEYS: Final[tuple[str, ...]] = (
    "status",
    "last_watered",
    "needs_water",
    "problem",
    CARE_WATERED,
    CARE_FERTILIZED,
    "snooze",
    "next_watering",
    "photo",
)
HUB_ENTITY_KEYS: Final[tuple[str, ...]] = (
    "care_calendar",
    "plants_needing_water",
    "vacation_mode",
    "plant_care",
)
