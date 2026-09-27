"""Keep versions in sync with manifest.json and print changelog notes.

python check_versions.py            # check only (exit 1 on mismatch)
python check_versions.py --sync     # copy manifest version into the others
python check_versions.py --notes X  # print the CHANGELOG section of version X
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[4]
MANIFEST = ROOT / "custom_components" / "rootwise" / "manifest.json"
PYPROJECT = ROOT / "pyproject.toml"
PACKAGE = ROOT / "frontend" / "package.json"
CHANGELOG = ROOT / "CHANGELOG.md"


def manifest_version() -> str:
    return json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]


def check(sync: bool) -> int:
    version = manifest_version()
    problems = []
    text = PYPROJECT.read_text(encoding="utf-8")
    current = re.search(r'^version = "([^"]+)"', text, re.M)
    if current and current.group(1) != version:
        if sync:
            PYPROJECT.write_text(
                text.replace(current.group(0), f'version = "{version}"', 1),
                encoding="utf-8",
                newline="\n",  # LF on Windows too (.gitattributes)
            )
        else:
            problems.append(f"pyproject.toml has {current.group(1)}")
    if PACKAGE.exists():
        package = json.loads(PACKAGE.read_text(encoding="utf-8"))
        if package.get("version") != version:
            if sync:
                package["version"] = version
                PACKAGE.write_text(
                    json.dumps(package, indent=2) + "\n",
                    encoding="utf-8",
                    newline="\n",
                )
            else:
                problems.append(f"frontend/package.json has {package.get('version')}")
    if f"## [{version}]" not in CHANGELOG.read_text(encoding="utf-8"):
        problems.append(f"CHANGELOG.md has no '## [{version}]' section")
    for problem in problems:
        print(f"mismatch: {problem} (manifest: {version})")
    print(f"version {version}: {'OK' if not problems else 'NOT OK'}")
    return 1 if problems else 0


def notes(version: str) -> int:
    text = CHANGELOG.read_text(encoding="utf-8")
    match = re.search(
        rf"^## \[{re.escape(version)}\][^\n]*\n(.*?)(?=^## \[|\Z)", text, re.M | re.S
    )
    if not match:
        print(f"no section for {version}", file=sys.stderr)
        return 1
    print(match.group(1).strip())
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--notes"] and len(args) == 2:
        sys.exit(notes(args[1]))
    sys.exit(check(sync="--sync" in args))
