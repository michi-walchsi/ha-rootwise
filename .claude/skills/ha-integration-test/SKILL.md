---
name: ha-integration-test
description: Run, fix and verify the Rootwise test suite (ruff, mypy, pytest with pytest-homeassistant-custom-component) locally on Windows and in GitHub Actions. Use this whenever code in custom_components/rootwise or tests/ changes, before every commit, when a CI run fails, when hassfest or the HACS validation complains, or when the user says "teste", "läuft CI?", "Tests grün?" or similar — even if they don't mention pytest.
---

# Testing the Rootwise integration

The integration must stay green on four gates: **ruff**, **mypy**, **pytest with coverage** (engine ≥ 85 %, total ≥ 80 %) and **hassfest + HACS validation**. The last one only runs in CI.

## One-time setup (Windows)

```powershell
uv venv --python 3.14 .venv
uv pip install --python .venv\Scripts\python.exe -r requirements_test.txt
.venv\Scripts\python .claude\skills\ha-integration-test\scripts\install_windows_stubs.py
```

Home Assistant imports the Unix-only modules `fcntl` and `resource`, so without the stubs `pytest` fails while importing the plugin. The stubs go into the venv only and are never committed. `tests/conftest.py` also turns off pytest-socket on Windows, because asyncio needs a TCP socket pair there. CI runs on Linux with the real guard.

## Before every commit

```powershell
.venv\Scripts\ruff check . ; .venv\Scripts\ruff format --check .
.venv\Scripts\python -m mypy custom_components/rootwise
.venv\Scripts\python -m pytest tests -q --cov=custom_components/rootwise --cov-report=term-missing
```

Fix failures at the root instead of loosening a gate. `ruff check --fix` and `ruff format .` fix most style findings.

## Writing tests (what trips people up)

- Write the failing test first (see superpowers:test-driven-development), watch it fail, then implement.
- Entity ids come from the **English translation names** (`translations/en.json`), e.g. `button.monstera_snooze_1_day`. After renaming a translation, update the tests.
- Build plants with `MockConfigEntry(subentries_data=[ConfigSubentryData(...)])` (see `tests/components/conftest.py`). Subentry flows: `hass.config_entries.subentries.async_init((entry_id, "plant"), context={"source": "user"})`.
- For time: use `freezer.tick(...)` plus `async_fire_time_changed(hass)`, then `await hass.async_block_till_done()`.
- Engine code under `engine/` stays pure Python and is tested without Home Assistant behaviour.

## CI

```powershell
git push
gh run list --limit 3
gh run watch <run-id> --exit-status
gh run view <run-id> --log-failed
```

hassfest and HACS findings show up only here. Typical causes:
- A translation key that is missing or unknown
- A manifest key in the wrong order
- An icon without the `mdi:` prefix
- A missing LICENSE, repo description or topics (HACS)

Fix the cause, push again and watch the next run until it is green.
