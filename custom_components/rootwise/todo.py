"""The 'Plant care' to-do list: plants that need water now."""

from __future__ import annotations

from collections.abc import Hashable
from typing import TYPE_CHECKING

from homeassistant.components.todo import TodoItem, TodoListEntity
from homeassistant.components.todo.const import TodoItemStatus, TodoListEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CARE_WATERED, TODO_WATER_SUMMARY
from .entity import RootwiseHubEntity

if TYPE_CHECKING:
    from . import RootwiseConfigEntry
    from .hub import PlantRuntime, RootwiseHub

UID_PREFIX = "water"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RootwiseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the plant care list."""
    async_add_entities([PlantCareTodoList(entry.runtime_data)])


def _uid(plant: PlantRuntime) -> str:
    # Stable while the plant waits; changes after the next watering.
    return f"{UID_PREFIX}:{plant.config.plant_id}:{plant.last_watered_id or 'new'}"


class PlantCareTodoList(RootwiseHubEntity, TodoListEntity):
    """Check an item to log watering; delete it to postpone by one day."""

    _attr_supported_features = (
        TodoListEntityFeature.UPDATE_TODO_ITEM | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(self, hub: RootwiseHub) -> None:
        """Init."""
        super().__init__(hub, "plant_care")

    def _due_plants(self) -> list[PlantRuntime]:
        if self._hub.vacation:
            return []
        return sorted(self._hub.plants_needing_water(), key=lambda p: p.config.name)

    def _refresh(self) -> Hashable:
        template = TODO_WATER_SUMMARY.get(
            self.hass.config.language[:2], TODO_WATER_SUMMARY["en"]
        )
        self._attr_todo_items = [
            TodoItem(
                summary=template.format(name=plant.config.name),
                uid=_uid(plant),
                status=TodoItemStatus.NEEDS_ACTION,
            )
            for plant in self._due_plants()
        ]
        return tuple(item.uid for item in self._attr_todo_items)

    def _plant_for(self, uid: str | None) -> PlantRuntime | None:
        for plant in self._due_plants():
            if _uid(plant) == uid:
                return plant
        return None

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Log the watering when an item is completed."""
        plant = self._plant_for(item.uid)
        if plant and item.status == TodoItemStatus.COMPLETED:
            plant.async_log_care(CARE_WATERED, source="todo")

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Postpone deleted items by one day."""
        for uid in uids:
            if plant := self._plant_for(uid):
                plant.async_snooze()
