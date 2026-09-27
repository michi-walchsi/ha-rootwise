"""Export soil sensor data from Home Assistant to CSV for the Rootwise backtest.

Writes three files per entity into dev/data/ (git-ignored, stays on your PC):
  raw_<entity>.csv     every reported value of the last N days (recorder, max ~10 days)
  5min_<entity>.csv    5-minute statistics (only kept ~10 days by Home Assistant)
  hour_<entity>.csv    hourly mean/min/max since the sensor started (kept forever)

Also exports input_button presses you use as ground truth, e.g.
input_button.monstera_gegossen and input_button.monstera_sensor_bewegt.

PowerShell:
  $env:HA_URL = "https://<your-host>.ts.net"
  $env:HA_TOKEN = "<long-lived access token>"
  .venv\\Scripts\\python dev\\tools\\export_history.py sensor.monstera_soil_moisture `
      --buttons input_button.monstera_gegossen input_button.monstera_sensor_bewegt

Run it once a week: raw data older than ~10 days is purged by Home Assistant.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from ha_ws import HAWebSocket

OUT_DEFAULT = Path(__file__).resolve().parents[1] / "data"


def _iso(ts: float) -> str:
    # Statistics use milliseconds, history uses seconds.
    if ts > 1e11:
        ts /= 1000
    return datetime.fromtimestamp(ts, UTC).isoformat()


def _write(path: Path, header: list[str], rows: list[list[Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(header)
        writer.writerows(rows)
    print(f"  {path.name}: {len(rows)} rows")


async def export(entities: list[str], buttons: list[str], days: int, out: Path) -> None:
    """Fetch history and statistics and write CSV files."""
    out.mkdir(parents=True, exist_ok=True)
    now = datetime.now(UTC)
    stamp = now.strftime("%Y%m%d")
    async with HAWebSocket() as ha:
        stats_ids = {
            s["statistic_id"]
            for s in await ha.call("recorder/list_statistic_ids", statistic_type="mean")
        }
        history = await ha.call(
            "history/history_during_period",
            start_time=(now - timedelta(days=days)).isoformat(),
            end_time=now.isoformat(),
            entity_ids=entities + buttons,
            minimal_response=True,
            no_attributes=True,
            significant_changes_only=False,
        )
        for entity in entities:
            slug = entity.replace(".", "_")
            print(entity)
            raw = [
                [_iso(p.get("lu") or p.get("lc")), p["s"]]
                for p in history.get(entity, [])
            ]
            _write(out / f"raw_{slug}_{stamp}.csv", ["time", "value"], raw)
            if entity not in stats_ids:
                print("  no long-term statistics (state_class missing?)")
                continue
            for period, back in (("5minute", 10), ("hour", 3650)):
                result = await ha.call(
                    "recorder/statistics_during_period",
                    start_time=(now - timedelta(days=back)).isoformat(),
                    end_time=now.isoformat(),
                    statistic_ids=[entity],
                    period=period,
                    types=["mean", "min", "max"],
                    units={},
                )
                rows = [
                    [_iso(r["start"]), r.get("mean"), r.get("min"), r.get("max")]
                    for r in result.get(entity, [])
                ]
                name = "5min" if period == "5minute" else "hour"
                _write(
                    out / f"{name}_{slug}_{stamp}.csv",
                    ["start", "mean", "min", "max"],
                    rows,
                )
        for button in buttons:
            presses = [
                [_iso(p.get("lu") or p.get("lc")), p["s"]]
                for p in history.get(button, [])
                if p["s"] not in ("unknown", "unavailable")
            ]
            print(button)
            slug = button.replace(".", "_")
            _write(out / f"labels_{slug}_{stamp}.csv", ["time", "pressed_at"], presses)


def main() -> None:
    """Parse arguments and run."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("entities", nargs="+", help="soil moisture sensor entity ids")
    parser.add_argument("--buttons", nargs="*", default=[], help="ground-truth buttons")
    parser.add_argument("--days", type=int, default=10)
    parser.add_argument("--out", type=Path, default=OUT_DEFAULT)
    args = parser.parse_args()
    asyncio.run(export(args.entities, args.buttons, args.days, args.out))


if __name__ == "__main__":
    main()
