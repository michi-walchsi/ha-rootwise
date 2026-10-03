"""Repairs: a plant that reads mirror sensors instead of the real ones."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import timedelta
from typing import Any

from homeassistant.components.repairs import RepairsFlow
from homeassistant.components.repairs.const import FlowType
from homeassistant.components.repairs.models import RepairsFlowResult
from homeassistant.config_entries import SOURCE_RECONFIGURE, ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
import voluptuous as vol

from .const import CONF_MOISTURE_SENSOR, DOMAIN, MEASUREMENTS, SUBENTRY_PLANT
from .sources import is_mirror, resolve

ISSUE_MIRROR = "mirror_source"
ISSUE_OFFLINE = "sensor_offline"
OFFLINE_REPAIR_AFTER = timedelta(hours=12)
SOURCE_FIELDS = tuple(field for _, field, _ in MEASUREMENTS)


def _issue_id(plant_id: str) -> str:
    return f"{ISSUE_MIRROR}_{plant_id}"


def mirror_replacements(
    hass: HomeAssistant, data: Mapping[str, Any]
) -> dict[str, tuple[str, str | None]]:
    """Return {field: (mirror, real sensor or None)} for mirrored sources."""
    return {
        field: (entity_id, resolve(hass, entity_id))
        for field in SOURCE_FIELDS
        if (entity_id := data.get(field)) and is_mirror(hass, entity_id)
    }


@callback
def async_check_sources(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Raise or clear the mirror issue of every plant."""
    wanted: set[str] = set()
    for plant_id, plant in entry.subentries.items():
        if plant.subentry_type != SUBENTRY_PLANT:
            continue
        if any(is_mirror(hass, plant.data.get(f) or "") for f in SOURCE_FIELDS):
            wanted.add(_issue_id(plant_id))
            ir.async_create_issue(
                hass,
                DOMAIN,
                _issue_id(plant_id),
                is_fixable=True,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key=ISSUE_MIRROR,
                translation_placeholders={"plant": plant.title},
                data={"entry_id": entry.entry_id, "plant_id": plant_id},
            )
    # Plants that were fixed or removed. Offline issues start over: after a
    # restart the plant counts its offline hours again.
    for domain, issue_id in list(ir.async_get(hass).issues):
        if domain != DOMAIN:
            continue
        stale_mirror = (
            issue_id.startswith(f"{ISSUE_MIRROR}_") and issue_id not in wanted
        )
        if stale_mirror or issue_id.startswith(f"{ISSUE_OFFLINE}_"):
            ir.async_delete_issue(hass, DOMAIN, issue_id)


@callback
def async_raise_offline(
    hass: HomeAssistant, entry_id: str, plant_id: str, plant: str, sensor: str
) -> None:
    """Tell the user that a plant's soil sensor stopped reporting."""
    ir.async_create_issue(
        hass,
        DOMAIN,
        f"{ISSUE_OFFLINE}_{plant_id}",
        is_fixable=True,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=ISSUE_OFFLINE,
        translation_placeholders={"plant": plant, "sensor": sensor},
        data={"entry_id": entry_id, "plant_id": plant_id},
    )


@callback
def async_clear_offline(hass: HomeAssistant, plant_id: str) -> None:
    """Remove the offline issue once the sensor reports again."""
    ir.async_delete_issue(hass, DOMAIN, f"{ISSUE_OFFLINE}_{plant_id}")


class OfflineSensorFixFlow(RepairsFlow):
    """Explain, then open the plant settings to pick another sensor."""

    def __init__(self, entry_id: str, plant_id: str) -> None:
        """Remember which plant to fix."""
        self._entry_id = entry_id
        self._plant_id = plant_id

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> RepairsFlowResult:
        """Go straight to the confirmation."""
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict[str, str] | None = None
    ) -> RepairsFlowResult:
        """Show the advice; on submit open the plant settings."""
        entry = self.hass.config_entries.async_get_entry(self._entry_id)
        plant = entry.subentries.get(self._plant_id) if entry else None
        if entry is None or plant is None:
            return self.async_abort(reason="plant_removed")
        if user_input is None:
            return self.async_show_form(
                step_id="confirm",
                data_schema=vol.Schema({}),
                description_placeholders={
                    "plant": plant.title,
                    "sensor": str(plant.data.get(CONF_MOISTURE_SENSOR, "")),
                },
            )
        flow = await self.hass.config_entries.subentries.async_init(
            (entry.entry_id, SUBENTRY_PLANT),
            context={"source": SOURCE_RECONFIGURE, "subentry_id": plant.subentry_id},
        )
        return self.async_create_entry(
            data={}, next_flow=(FlowType.CONFIG_SUBENTRIES_FLOW, flow["flow_id"])
        )


class MirrorSourceFixFlow(RepairsFlow):
    """Switch a plant to the real sensors, or open its settings."""

    def __init__(self, entry_id: str, plant_id: str) -> None:
        """Remember which plant to fix."""
        self._entry_id = entry_id
        self._plant_id = plant_id

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> RepairsFlowResult:
        """Go straight to the confirmation."""
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict[str, str] | None = None
    ) -> RepairsFlowResult:
        """Show what changes, then change it."""
        entry = self.hass.config_entries.async_get_entry(self._entry_id)
        plant = entry.subentries.get(self._plant_id) if entry else None
        if entry is None or plant is None:
            return self.async_abort(reason="plant_removed")
        changes = mirror_replacements(self.hass, plant.data)

        if user_input is None:
            lines = [f"- {old} → {new or '?'}" for old, new in changes.values()]
            return self.async_show_form(
                step_id="confirm",
                data_schema=vol.Schema({}),
                description_placeholders={
                    "plant": plant.title,
                    "changes": "\n".join(lines),
                },
            )

        if all(new for _, new in changes.values()):
            data = {**plant.data, **{f: new for f, (_, new) in changes.items()}}
            self.hass.config_entries.async_update_subentry(
                entry, plant, data=data, unique_id=data.get(CONF_MOISTURE_SENSOR)
            )
            return self.async_create_entry(data={})

        # A mirror whose source is unknown: let the user pick in the plant settings.
        flow = await self.hass.config_entries.subentries.async_init(
            (entry.entry_id, SUBENTRY_PLANT),
            context={"source": SOURCE_RECONFIGURE, "subentry_id": plant.subentry_id},
        )
        return self.async_create_entry(
            data={}, next_flow=(FlowType.CONFIG_SUBENTRIES_FLOW, flow["flow_id"])
        )


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None
) -> RepairsFlow:
    """Create the fix flow for an issue."""
    if data is None:
        raise ValueError(issue_id)
    if issue_id.startswith(f"{ISSUE_OFFLINE}_"):
        return OfflineSensorFixFlow(str(data["entry_id"]), str(data["plant_id"]))
    return MirrorSourceFixFlow(str(data["entry_id"]), str(data["plant_id"]))
