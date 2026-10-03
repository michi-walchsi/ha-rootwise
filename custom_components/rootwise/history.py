"""Read a sensor's past from the recorder: statistics and recent states.

Hourly long-term statistics are kept forever, 5-minute statistics and raw
states for about ten days. Rootwise reads them once at start; afterwards it
follows the sensor live. Nothing here writes to the recorder.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Final, Literal

from homeassistant.core import HomeAssistant
from homeassistant.helpers.recorder import get_instance
from homeassistant.util import dt as dt_util

from .engine.series import Bucket, merge

_LOGGER = logging.getLogger(__name__)

HOURLY: Final = timedelta(days=60)
SHORT_TERM: Final = timedelta(days=3)
RAW: Final = timedelta(hours=24)


def _statistics(
    hass: HomeAssistant,
    entity_id: str,
    start: datetime,
    end: datetime,
    period: Literal["5minute", "hour"],
) -> list[Bucket]:
    from homeassistant.components.recorder.statistics import (  # noqa: PLC0415
        statistics_during_period,
    )

    rows = statistics_during_period(
        hass, start, end, {entity_id}, period, None, {"mean", "min", "max"}
    )
    buckets = []
    for row in rows.get(entity_id, []):
        mean, low, high = row.get("mean"), row.get("min"), row.get("max")
        if mean is None or low is None or high is None:
            continue
        buckets.append(
            Bucket(
                start=dt_util.utc_from_timestamp(row["start"]),
                end=dt_util.utc_from_timestamp(row["end"]),
                low=float(low),
                high=float(high),
                mean=float(mean),
            )
        )
    return buckets


def _states(hass: HomeAssistant, entity_id: str, start: datetime) -> list[Bucket]:
    from homeassistant.components.recorder.history import (  # noqa: PLC0415
        state_changes_during_period,
    )

    # Open end: a state written right now must not fall out of the range.
    states = state_changes_during_period(
        hass, start, None, entity_id, no_attributes=True, include_start_time_state=True
    ).get(entity_id, [])
    points = []
    for state in states:
        try:
            value = float(state.state)
        except ValueError:
            continue
        points.append(Bucket.point(max(state.last_updated, start), value))
    return points


async def async_history(
    hass: HomeAssistant, entity_id: str, now: datetime
) -> list[Bucket]:
    """Return the sensor's past: hourly, then 5-minute, then raw (finest wins)."""
    if "recorder" not in hass.config.components:
        return []

    instance = get_instance(hass)
    try:
        hourly = await instance.async_add_executor_job(
            _statistics, hass, entity_id, now - HOURLY, now, "hour"
        )
        short = await instance.async_add_executor_job(
            _statistics, hass, entity_id, now - SHORT_TERM, now, "5minute"
        )
        raw = await instance.async_add_executor_job(_states, hass, entity_id, now - RAW)
    except Exception:  # history is a bonus, never a reason to fail
        _LOGGER.warning("Could not read the history of %s", entity_id, exc_info=True)
        return []
    return merge(hourly, short, raw)
