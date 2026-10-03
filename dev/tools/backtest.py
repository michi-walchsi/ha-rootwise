"""Replay Rootwise's watering detection and forecast on exported real data.

Reads the CSV files written by export_history.py from dev/data/ (they stay on
your PC) and prints:

- the waterings found in the data, next to the journal entries,
- the thresholds Rootwise learns from them,
- the drying rate of every finished cycle,
- how far off the forecast would have been at 25 %, 50 % and 75 % of each
  finished cycle (target: the level the next watering started at),
- the forecast for the cycle that is running now.

PowerShell:
  .venv/Scripts/python dev/tools/backtest.py sensor.<your_soil_sensor>
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime, timedelta
from itertools import pairwise
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from custom_components.rootwise.engine.detect import EPISODE, detect
from custom_components.rootwise.engine.forecast import (
    cycle_rates,
    forecast,
)
from custom_components.rootwise.engine.learn import learned_thresholds
from custom_components.rootwise.engine.series import Bucket, merge

DATA = Path(__file__).resolve().parents[1] / "data"
HOUR = timedelta(hours=1)


def _latest(pattern: str) -> Path | None:
    files = sorted(DATA.glob(pattern))
    return files[-1] if files else None


def _hourly(path: Path) -> list[Bucket]:
    with path.open(encoding="utf-8") as f:
        return [
            Bucket(
                start=(start := datetime.fromisoformat(r["start"])),
                end=start + HOUR,
                low=float(r["min"]),
                high=float(r["max"]),
                mean=float(r["mean"]),
            )
            for r in csv.DictReader(f)
            if r["mean"] and r["min"] and r["max"]
        ]


def _raw(path: Path) -> list[Bucket]:
    points = []
    with path.open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                points.append(
                    Bucket.point(datetime.fromisoformat(r["time"]), float(r["value"]))
                )
            except ValueError:
                continue
    return points


def _journal(path: Path | None) -> list[tuple[datetime, str, str]]:
    if path is None:
        return []
    with path.open(encoding="utf-8") as f:
        return [
            (datetime.fromisoformat(r["time"]), r["type"], r["source"])
            for r in csv.DictReader(f)
            if r["type"] == "watered"
        ]


def _local(at: datetime) -> str:
    return at.astimezone().strftime("%a %d.%m. %H:%M")


def main() -> None:
    """Load the exports and print the report."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("sensor", help="soil sensor entity id, as exported")
    args = parser.parse_args()
    slug = args.sensor.replace(".", "_")
    hourly_file = _latest(f"hour_{slug}_*.csv")
    if hourly_file is None:
        sys.exit(f"No export for {args.sensor} in {DATA}; run export_history.py")
    raw_file = _latest(f"raw_{slug}_*.csv")
    data = merge(_hourly(hourly_file), _raw(raw_file) if raw_file else [])
    now = max(b.end for b in data)
    journal = _journal(_latest("journal_*.csv"))

    print(f"Data: {_local(data[0].start)} to {_local(now)} ({len(data)} points)\n")
    waterings = detect(data, now)
    print("Waterings found in the sensor data:")
    for w in waterings:
        logged = [j for j in journal if abs(j[0] - w.at) <= EPISODE]
        mark = (
            f"journal: {logged[0][2]} {_local(logged[0][0])}"
            if logged
            else "not in journal"
        )
        settled = f"{w.settled:.1f}" if w.settled is not None else "?"
        print(
            f"  {_local(w.at)}  {w.before:5.1f} -> peak {w.peak:5.1f} -> "
            f"settled {settled}  ({mark})"
        )
    missed = [j for j in journal if all(abs(j[0] - w.at) > EPISODE for w in waterings)]
    for at, _, source in missed:
        print(f"  journal only: {_local(at)} ({source}) - no rise in the data")

    learned = learned_thresholds(waterings)
    print(
        f"\nLearned thresholds: {learned if learned else 'not yet (need 2 waterings)'}"
    )
    rates = cycle_rates(data, [w.at for w in waterings])
    print("Drying per finished cycle:", ", ".join(f"{r:.2f}/day" for r in rates) or "-")

    print("\nForecast replay (target: the level the next watering started at):")
    for i, (begin, end) in enumerate(pairwise(waterings)):
        span = end.at - begin.at
        for share in (0.25, 0.5, 0.75):
            at = begin.at + span * share
            past = [b for b in data if b.start <= at]
            result = forecast(past, end.before, at, begin.at, rates[:i])
            if result is None:
                print(f"  cycle {i + 1} at {share:.0%}: no forecast")
                continue
            error = (result.due - end.at) / HOUR
            inside = result.earliest <= end.at <= result.latest
            print(
                f"  cycle {i + 1} at {share:.0%}: due {_local(result.due)}, "
                f"actual {_local(end.at)}, off {error:+.0f} h, "
                f"window {'hit' if inside else 'missed'} ({result.confidence.value})"
            )

    if waterings:
        threshold = learned[0] if learned else waterings[-1].before
        result = forecast(data, threshold, now, waterings[-1].at, rates)
        print(f"\nNow (threshold {threshold}):", end=" ")
        if result is None:
            print("no forecast")
        else:
            print(
                f"level {result.level:.1f}, drying {result.rate:.2f}/day, due "
                f"{_local(result.due)} (between {_local(result.earliest)} and "
                f"{_local(result.latest)}, {result.confidence.value})"
            )


if __name__ == "__main__":
    main()
