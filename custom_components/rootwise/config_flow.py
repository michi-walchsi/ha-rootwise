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
    CONF_RANGES,
    CONF_SPECIES,
    CONF_SPECIES_INFO,
    CONF_WINDOW,
    DEFAULT_DIGEST_TIME,
    DOMAIN,
    LOCATIONS,
    MEASUREMENTS,
    POT_KEYS,
    POT_MATERIALS,
    SENSOR_DEVICE_CLASSES,
    SENSOR_KEYS,
    SUBENTRY_PLANT,
    WINDOWS,
)
from .hub import species_range
from .opb import OpbError, async_search, async_species_info, opb_available
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


# Target ranges set in the flow: key → (unit, step, upper limit).
RANGE_FIELDS: dict[str, tuple[str, float, float]] = {
    "temperature": ("°C", 0.5, 50),
    "air_humidity": ("%", 1, 100),
    "illuminance": ("lx", 100, 150000),
    "conductivity": ("µS/cm", 10, 10000),
}


def ranges_schema(keys: list[str]) -> vol.Schema:
    """Build the min/max fields for each climate value that has a sensor."""
    fields: dict[Any, Any] = {}
    for key in keys:
        unit, step, upper = RANGE_FIELDS[key]
        number = NumberSelector(
            NumberSelectorConfig(
                min=0,
                max=upper,
                step=step,
                unit_of_measurement=unit,
                mode=NumberSelectorMode.BOX,
            )
        )
        fields[vol.Optional(f"{key}_min")] = number
        fields[vol.Optional(f"{key}_max")] = number
    return vol.Schema(fields)


class PlantSubentryFlow(ConfigSubentryFlow):
    """Add or change a plant: species, basics, sensors, target ranges, pot."""

    def __init__(self) -> None:
        """Collect the plant across steps."""
        self._name = ""
        self._data: dict[str, Any] = {}
        self._query = ""
        self._hits: list[tuple[str, str]] = []

    @property
    def _reconfiguring(self) -> bool:
        return self.source == SOURCE_RECONFIGURE

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Start: search OpenPlantbook if it is set up, else the basics."""
        if opb_available(self.hass):
            return self.async_show_menu(
                step_id="user", menu_options=["search", "basics"]
            )
        return await self.async_step_basics()

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Change a plant; starts from the stored plant."""
        current = self._get_reconfigure_subentry()
        self._name = current.title
        self._data = _real_sensors(self.hass, dict(current.data))
        if opb_available(self.hass):
            return self.async_show_menu(
                step_id="reconfigure", menu_options=["search", "basics"]
            )
        return await self.async_step_basics()

    async def async_step_search(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Search a species in OpenPlantbook."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._query = str(user_input.get("query", "")).strip()
            try:
                self._hits = (
                    await async_search(self.hass, self._query) if self._query else []
                )
            except OpbError:
                errors["base"] = "opb_failed"
            else:
                if self._hits:
                    return await self.async_step_pick()
                errors["base"] = "no_results"
        elif not self._query:
            self._query = await self._default_query()
        schema = vol.Schema({vol.Required("query"): TextSelector()})
        return self.async_show_form(
            step_id="search",
            data_schema=self.add_suggested_values_to_schema(
                schema, {"query": self._query}
            ),
            errors=errors,
        )

    async def async_step_pick(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Pick one of the hits; nothing picked searches again."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if not (pid := user_input.get("pid")):
                return await self.async_step_search()
            try:
                info = await async_species_info(self.hass, str(pid))
            except OpbError:
                errors["base"] = "opb_failed"
            else:
                await self._apply_species(info)
                return await self.async_step_basics()
        options = [SelectOptionDict(value=pid, label=name) for pid, name in self._hits]
        mode = (
            SelectSelectorMode.LIST
            if len(options) <= 8
            else SelectSelectorMode.DROPDOWN
        )
        return self.async_show_form(
            step_id="pick",
            data_schema=vol.Schema(
                {
                    vol.Optional("pid"): SelectSelector(
                        SelectSelectorConfig(options=options, mode=mode)
                    )
                }
            ),
            errors=errors,
            description_placeholders={
                "query": self._query,
                "count": str(len(self._hits)),
            },
        )

    async def async_step_basics(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Name, species (watering style), room and soil sensor."""
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
            step_id="basics",
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
        """Further sensors, prefilled from the soil sensor and the room."""
        if user_input is not None:
            self._merge(user_input, SENSOR_KEYS)
            return await self.async_step_ranges()
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

    async def async_step_ranges(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Target ranges for the climate values that have a sensor."""
        keys = [
            key
            for key, field, _ in MEASUREMENTS
            if key in RANGE_FIELDS and self._data.get(field)
        ]
        if not keys:
            self._data.pop(CONF_RANGES, None)
            return await self.async_step_pot()
        db = await async_get_species_db(self.hass)
        species = db.get(str(self._data.get(CONF_SPECIES, "")))
        info = self._data.get(CONF_SPECIES_INFO)
        defaults = {key: species_range(key, info, species)[0] for key in keys}

        if user_input is not None:
            custom: dict[str, dict[str, float | None]] = {}
            for key in keys:
                low = user_input.get(f"{key}_min")
                high = user_input.get(f"{key}_max")
                default = defaults[key]
                if default is not None and (low, high) == (default.min, default.max):
                    continue  # unchanged: stays with the species
                if low is None and high is None:
                    continue
                custom[key] = {"min": low, "max": high}
            if custom:
                self._data[CONF_RANGES] = custom
            else:
                self._data.pop(CONF_RANGES, None)
            return await self.async_step_pot()

        stored = self._data.get(CONF_RANGES, {})
        values: dict[str, float] = {}
        for key in keys:
            default = defaults[key]
            current = stored.get(key) or (
                {"min": default.min, "max": default.max} if default else {}
            )
            for bound in ("min", "max"):
                if current.get(bound) is not None:
                    values[f"{key}_{bound}"] = current[bound]
        return self.async_show_form(
            step_id="ranges",
            data_schema=self.add_suggested_values_to_schema(
                ranges_schema(keys), values
            ),
        )

    async def async_step_pot(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Pot and place, then save."""
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

    async def _default_query(self) -> str:
        """First search term: the known species, else the plant's name."""
        if info := self._data.get(CONF_SPECIES_INFO):
            return str(info.get("scientific", ""))
        db = await async_get_species_db(self.hass)
        if species := db.get(str(self._data.get(CONF_SPECIES, ""))):
            return species.scientific
        return self._name

    async def _apply_species(self, info: dict[str, Any]) -> None:
        """Store the snapshot, match the offline species, propose a name."""
        self._data[CONF_SPECIES_INFO] = info
        db = await async_get_species_db(self.hass)
        if match := db.find_scientific(info["scientific"]):
            self._data[CONF_SPECIES] = match.id
        else:
            self._data.pop(CONF_SPECIES, None)
        if not self._reconfiguring:
            self._name = info.get("common") or info["scientific"]

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
