"""Config flow, options flow and the 'plant' subentry flow."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentry,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import section
from homeassistant.helpers.selector import (
    AreaSelector,
    BooleanSelector,
    DeviceSelector,
    DeviceSelectorConfig,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TimeSelector,
)
import voluptuous as vol

from .const import (
    CONF_AREA,
    CONF_BATTERY_SENSOR,
    CONF_DIGEST_TIME,
    CONF_DRAINAGE,
    CONF_LOCATION,
    CONF_MOISTURE_SENSOR,
    CONF_NOTIFY_DEVICES,
    CONF_POT_DIAMETER,
    CONF_POT_MATERIAL,
    CONF_SPECIES,
    CONF_TEMPERATURE_SENSOR,
    CONF_WINDOW,
    DEFAULT_DIGEST_TIME,
    DOMAIN,
    LOCATIONS,
    POT_MATERIALS,
    SECTION_FIELDS,
    SECTION_POT,
    SECTION_SENSORS,
    SUBENTRY_PLANT,
    WINDOWS,
)
from .species.db import SpeciesDb


async def async_get_species_db(hass: HomeAssistant) -> SpeciesDb:
    """Load the bundled species database outside the event loop."""
    return await hass.async_add_executor_job(SpeciesDb.load)


class RootwiseConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up Rootwise once; plants are added as subentries."""

    VERSION = 1
    MINOR_VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm and create the entry."""
        if user_input is not None:
            return self.async_create_entry(
                title="Rootwise",
                data={},
                options={
                    CONF_NOTIFY_DEVICES: [],
                    CONF_DIGEST_TIME: DEFAULT_DIGEST_TIME,
                },
            )
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> RootwiseOptionsFlow:
        """Return the options flow."""
        return RootwiseOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Plants are subentries."""
        return {SUBENTRY_PLANT: PlantSubentryFlow}


class RootwiseOptionsFlow(OptionsFlow):
    """Notification targets and digest time (used from phase 2)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        schema = vol.Schema(
            {
                vol.Optional(CONF_NOTIFY_DEVICES, default=[]): DeviceSelector(
                    DeviceSelectorConfig(integration="mobile_app", multiple=True)
                ),
                vol.Optional(
                    CONF_DIGEST_TIME, default=DEFAULT_DIGEST_TIME
                ): TimeSelector(),
            }
        )
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                schema, self.config_entry.options
            ),
        )


def _select(options: list[str], key: str) -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=options, translation_key=key, mode=SelectSelectorMode.DROPDOWN
        )
    )


def _sensor(device_class: str | list[str]) -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(domain="sensor", device_class=device_class)
    )


def plant_schema(db: SpeciesDb, language: str) -> vol.Schema:
    """Form for adding or changing a plant."""
    species = sorted(
        (SelectOptionDict(value=s.id, label=s.label(language)) for s in db.all()),
        key=lambda o: o["label"],
    )
    return vol.Schema(
        {
            vol.Required(CONF_NAME): TextSelector(),
            vol.Required(CONF_SPECIES): SelectSelector(
                SelectSelectorConfig(
                    options=species, custom_value=True, mode=SelectSelectorMode.DROPDOWN
                )
            ),
            vol.Optional(CONF_AREA): AreaSelector(),
            vol.Required(SECTION_SENSORS): section(
                vol.Schema(
                    {
                        # Some soil sensors report as humidity instead of moisture.
                        vol.Optional(CONF_MOISTURE_SENSOR): _sensor(
                            ["moisture", "humidity"]
                        ),
                        vol.Optional(CONF_TEMPERATURE_SENSOR): _sensor("temperature"),
                        vol.Optional(CONF_BATTERY_SENSOR): _sensor("battery"),
                    }
                ),
                {"collapsed": False},
            ),
            vol.Required(SECTION_POT): section(
                vol.Schema(
                    {
                        vol.Optional(CONF_POT_DIAMETER, default=18): NumberSelector(
                            NumberSelectorConfig(
                                min=5,
                                max=80,
                                step=1,
                                unit_of_measurement="cm",
                                mode=NumberSelectorMode.BOX,
                            )
                        ),
                        vol.Optional(CONF_POT_MATERIAL, default="plastic"): _select(
                            POT_MATERIALS, CONF_POT_MATERIAL
                        ),
                        vol.Optional(CONF_DRAINAGE, default=True): BooleanSelector(),
                        vol.Optional(CONF_WINDOW, default="none"): _select(
                            WINDOWS, CONF_WINDOW
                        ),
                        vol.Optional(CONF_LOCATION, default="indoor"): _select(
                            LOCATIONS, CONF_LOCATION
                        ),
                    }
                ),
                {"collapsed": True},
            ),
        }
    )


def flatten(user_input: Mapping[str, Any]) -> dict[str, Any]:
    """Turn form input (with sections) into flat subentry data."""
    data: dict[str, Any] = {
        k: v
        for k, v in user_input.items()
        if k not in SECTION_FIELDS and k != CONF_NAME and v not in (None, "")
    }
    for section_key in SECTION_FIELDS:
        for key, value in user_input.get(section_key, {}).items():
            if value not in (None, ""):
                data[key] = value
    return data


def unflatten(name: str, data: Mapping[str, Any]) -> dict[str, Any]:
    """Turn subentry data back into form values (with sections)."""
    values: dict[str, Any] = {CONF_NAME: name}
    for key in (CONF_SPECIES, CONF_AREA):
        if key in data:
            values[key] = data[key]
    for section_key, keys in SECTION_FIELDS.items():
        values[section_key] = {k: data[k] for k in keys if k in data}
    return values


class PlantSubentryFlow(ConfigSubentryFlow):
    """Add or change a plant."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Add a plant."""
        return await self._async_form("user", user_input, None)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Change a plant."""
        return await self._async_form(
            "reconfigure", user_input, self._get_reconfigure_subentry()
        )

    async def _async_form(
        self,
        step_id: str,
        user_input: dict[str, Any] | None,
        current: ConfigSubentry | None,
    ) -> SubentryFlowResult:
        entry = self._get_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data = flatten(user_input)
            moisture = data.get(CONF_MOISTURE_SENSOR)
            if moisture and _sensor_in_use(entry, moisture, current):
                errors["base"] = "sensor_in_use"
            else:
                name = str(user_input[CONF_NAME]).strip()
                if current is None:
                    return self.async_create_entry(
                        title=name, data=data, unique_id=moisture
                    )
                return self.async_update_and_abort(
                    entry, current, title=name, data=data, unique_id=moisture
                )

        db = await async_get_species_db(self.hass)
        schema = plant_schema(db, self.hass.config.language)
        suggested = user_input or (
            unflatten(current.title, current.data) if current else None
        )
        if suggested:
            schema = self.add_suggested_values_to_schema(schema, suggested)
        return self.async_show_form(step_id=step_id, data_schema=schema, errors=errors)


def _sensor_in_use(
    entry: ConfigEntry, entity_id: str, current: ConfigSubentry | None
) -> bool:
    return any(
        sub.data.get(CONF_MOISTURE_SENSOR) == entity_id
        for sub in entry.subentries.values()
        if current is None or sub.subentry_id != current.subentry_id
    )
