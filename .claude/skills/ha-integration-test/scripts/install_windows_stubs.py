"""Install fcntl/resource stubs into the active venv (Windows dev only).

Home Assistant's runner imports these Unix modules; tests never use them.
Run with the venv's Python: .venv\\Scripts\\python install_windows_stubs.py
"""

from pathlib import Path
import sys
import sysconfig

STUBS = {
    "fcntl.py": (
        '"""Windows dev stub (not shipped)."""\n'
        "LOCK_EX = LOCK_NB = LOCK_SH = LOCK_UN = F_GETFL = F_SETFL = 0\n"
        "def flock(*a, **k): return None\n"
        "def lockf(*a, **k): return None\n"
        "def fcntl(*a, **k): return 0\n"
        "def ioctl(*a, **k): return 0\n"
    ),
    "resource.py": (
        '"""Windows dev stub (not shipped)."""\n'
        "RLIMIT_NOFILE = 7\n"
        "RLIM_INFINITY = -1\n"
        "def getrlimit(*a): return (1024, 4096)\n"
        "def setrlimit(*a): return None\n"
    ),
}

if sys.platform != "win32":
    sys.exit("Only needed on Windows.")
if sys.prefix == sys.base_prefix:
    sys.exit("Run this with the venv's Python, not the system Python.")

site = Path(sysconfig.get_paths()["purelib"])
for name, content in STUBS.items():
    (site / name).write_text(content, encoding="utf-8")
    print(f"wrote {site / name}")
