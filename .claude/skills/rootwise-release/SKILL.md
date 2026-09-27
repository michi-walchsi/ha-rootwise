---
name: rootwise-release
description: Cut a Rootwise release — sync the version, update the changelog, run all gates, tag vX.Y.Z and publish the GitHub release that HACS picks up. Use this whenever a phase is finished, when the user says "release", "Tag", "neue Version", "veröffentlichen", "v0.N.0", or wants to test the current state via a HACS update on the Pi.
---

# Releasing Rootwise

HACS installs whatever the newest **GitHub release** points to. A release must therefore only ever contain a green, fully built state.

## Rules

- **Single source of truth for the version:** `custom_components/rootwise/manifest.json`. `pyproject.toml` (and, from phase 2, `frontend/package.json`) follow it. The E-Paper project showed that versions kept by hand in three places drift apart and break cache busting.
- **Commit author** is `michi-walchsi`. Never add a `Co-Authored-By` line; that is the owner's explicit wish.
- Work on `main`; one release per finished phase: `v0.<phase>.0`, fixes `v0.<phase>.<n>`.

## Steps

1. Clean tree on `main`: `git status` shows nothing to commit.
2. Bump the version in `manifest.json`, then run
   `python .claude/skills/rootwise-release/scripts/check_versions.py --sync`
   to copy it into the other files and check the CHANGELOG heading.
3. In `CHANGELOG.md`, turn `## [Unreleased]` content into `## [X.Y.Z] - YYYY-MM-DD` (today) and keep an empty `## [Unreleased]` above it.
4. From phase 2 on: `npm ci && npm run build` in `frontend/` and commit the built files. The panel shows the old version if the build is stale.
5. Run all gates (skill **ha-integration-test**): ruff, mypy and pytest with coverage.
6. Commit: `git commit -m "Release vX.Y.Z"`, then push.
7. Wait for green CI: `gh run watch <id> --exit-status` for the CI and Validate workflows.
8. Tag and release:
   ```bash
   git tag -a vX.Y.Z -m "Rootwise vX.Y.Z"
   git push origin vX.Y.Z
   gh release create vX.Y.Z --title "Rootwise vX.Y.Z" --notes-file <changelog section>
   ```
   Extract the notes with `python .claude/skills/rootwise-release/scripts/check_versions.py --notes X.Y.Z > notes.md`, and delete `notes.md` afterwards.
9. Tell the owner, in German, what changed and what to test on the phone. The update appears in HACS, possibly after "Nach Updates suchen".
