"""Config flow, options flow and the 'plant' subentry flow."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    SOURCE_RECONFIGURE,
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
    BASIC_KEYS,
    CONF_AREA,
    CONF_DIGEST_TIME,
    CONF_DRAINAGE,
    CONF_LOCATION,
    CONF_MOISTURE_SENSOR,
    CONF_NOTIFY_DEVICES,
    CONF_POT_DIAMETER,
    CONF_POT_MATERIAL,
    CONF_SPECIES,
    CONF_WINDOW,
    DEFAULT_DIGEST_TIME,
    DOMAIN,
    LOCATIONS,
    POT_KEYS,
    POT_MATERIALS,
    SENSOR_DEVICE_CLASSES,
    SENSOR_KEYS,
    SUBENTRY_PLANT,
    WINDOWS,
)
from .sources import mirror_entities, resolve
from .species.db import SpeciesDb
from .suggest import suggest_sensors


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


def _sensor(device_class: str | list[str], exclude: list[str]) -> EntitySelector:
    return EntitySelector(
        EntitySelectorConfig(
            domain="sensor", device_class=device_class, exclude_entities=exclude
        )
    )


def basics_schema(db: SpeciesDb, language: str, exclude: list[str]) -> vol.Schema:
    """Step 1: name, species, room and soil sensor."""
    species = sorted(
        (SelectOptionDict(value=s.id, label=s.label(language)) for s in db.all()),
        key=lambda o: o["label"].casefold(),
    )
    return vol.Schema(
        {
            vol.Required(CONF_NAME): TextSelector(),
            # Optional: a required select would silently pick the first species.
            vol.Optional(CONF_SPECIES): SelectSelector(
                SelectSelectorConfig(options=species, mode=SelectSelectorMode.DROPDOWN)
            ),
            vol.Optional(CONF_AREA): AreaSelector(),
            # Some soil sensors report as humidity instead of moisture.
            vol.Optional(CONF_MOISTURE_SENSOR): _sensor(
                ["moisture", "humidity"], exclude
            ),
        }
    )


def sensors_schema(exclude: list[str]) -> vol.Schema:
    """Step 2: further sensors, all optional."""
    return vol.Schema(
        {
            vol.Optional(key): _sensor(device_class, exclude)
            for key, device_class in SENSOR_DEVICE_CLASSES.items()
        }
    )


def _real_sensors(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Replace mirror sensors by the real ones; drop mirrors of unknown origin."""
    result = dict(data)
    for key in (CONF_MOISTURE_SENSOR, *SENSOR_KEYS):
        if entity_id := result.get(key):
            if (real := resolve(hass, entity_id)) is None:
                result.pop(key)
            else:
                result[key] = real
    return result


def pot_schema() -> vol.Schema:
    """Step 3: pot and place."""
    return vol.Schema(
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
            vol.Optional(CONF_WINDOW, default="none"): _select(WINDOWS, CONF_WINDOW),
            vol.Optional(CONF_LOCATION, default="indoor"): _select(
                LOCATIONS, CONF_LOCATION
            ),
        }
    )


class PlantSubentryFlow(ConfigSubentryFlow):
    """Add or change a plant in three short steps."""

    def __init__(self) -> None:
        """Collect the plant across steps."""
        self._name = ""
        self._data: dict[str, Any] = {}

    @property
    def _reconfiguring(self) -> bool:
        return self.source == SOURCE_RECONFIGURE

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Step 1 when adding."""
        return await self._async_basics("user", user_input)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Step 1 when changing; starts from the stored plant."""
        if user_input is None and not self._name:
            current = self._get_reconfigure_subentry()
            self._name = current.title
            self._data = _real_sensors(self.hass, dict(current.data))
        return await self._async_basics("reconfigure", user_input)

    async def _async_basics(
        self, step_id: str, user_input: dict[str, Any] | None
    ) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            moisture = user_input.get(CONF_MOISTURE_SENSOR)
            current = self._get_reconfigure_subentry() if self._reconfiguring else None
            if moisture and _sensor_in_use(self._get_entry(), moisture, current):
                errors["base"] = "sensor_in_use"
            else:
                self._name = str(user_input[CONF_NAME]).strip()
                self._merge(user_input, BASIC_KEYS)
                return await self.async_step_sensors()

        db = await async_get_species_db(self.hass)
        values = user_input or {
            CONF_NAME: self._name,
            **{k: self._data[k] for k in BASIC_KEYS if k in self._data},
        }
        return self.async_show_form(
            step_id=step_id,
            data_schema=self.add_suggested_values_to_schema(
                basics_schema(
                    db, self.hass.config.language, mirror_entities(self.hass)
                ),
                values,
            ),
            errors=errors,
        )

    async def async_step_sensors(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Step 2: further sensors, prefilled from the soil sensor and the room."""
        if user_input is not None:
            self._merge(user_input, SENSOR_KEYS)
            return await self.async_step_pot()
        if self._reconfiguring:
            values = {k: self._data[k] for k in SENSOR_KEYS if k in self._data}
        else:
            values = suggest_sensors(
                self.hass,
                self._data.get(CONF_MOISTURE_SENSOR),
                self._data.get(CONF_AREA),
            )
        return self.async_show_form(
            step_id="sensors",
            data_schema=self.add_suggested_values_to_schema(
                sensors_schema(mirror_entities(self.hass)), values
            ),
        )

    async def async_step_pot(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Step 3: pot and place, then save."""
        if user_input is not None:
            self._merge(user_input, POT_KEYS)
            moisture = self._data.get(CONF_MOISTURE_SENSOR)
            if self._reconfiguring:
                return self.async_update_and_abort(
                    self._get_entry(),
                    self._get_reconfigure_subentry(),
                    title=self._name,
                    data=self._data,
                    unique_id=moisture,
                )
            return self.async_create_entry(
                title=self._name, data=self._data, unique_id=moisture
            )
        values = {k: self._data[k] for k in POT_KEYS if k in self._data}
        return self.async_show_form(
            step_id="pot",
            data_schema=self.add_suggested_values_to_schema(pot_schema(), values),
        )

    def _merge(self, user_input: dict[str, Any], keys: tuple[str, ...]) -> None:
        """Take this step's fields; an emptied field removes the value."""
        for key in keys:
            value = user_input.get(key)
            if value in (None, "", []):
                self._data.pop(key, None)
            else:
                self._data[key] = value


def _sensor_in_use(
    entry: ConfigEntry, entity_id: str, current: ConfigSubentry | None
) -> bool:
    return any(
        sub.data.get(CONF_MOISTURE_SENSOR) == entity_id
        for sub in entry.subentries.values()
        if current is None or sub.subentry_id != current.subentry_id
    )
