import json
import subprocess
from pathlib import Path

fail = False
registry_path = Path("ops/status/diagnostic-status-registry.json")
if not registry_path.exists():
    print("AS6_DIAGNOSTIC_TRACKING_REGISTRY=FAIL:missing")
    raise SystemExit(1)
print(f"AS6_DIAGNOSTIC_TRACKING_REGISTRY=PASS:{registry_path}")

data = json.loads(registry_path.read_text())
items = data if isinstance(data, list) else data.get("diagnostics", data.get("items", data.get("entries", [])))
tracked = set(subprocess.check_output(["git", "ls-files"], text=True).splitlines())
status_lines = subprocess.check_output(["git", "status", "--short"], text=True).splitlines()
staged_added = set()
for line in status_lines:
    if len(line) >= 4 and line[0] == "A":
        staged_added.add(line[3:])

diagnostic_paths = []
for item in items:
    if isinstance(item, str):
        path = item
    elif isinstance(item, dict):
        path = item.get("path") or item.get("diagnostic") or item.get("file") or item.get("name")
    else:
        path = None
    if path and str(path).startswith("ops/bin/as6-diagnose-"):
        diagnostic_paths.append(str(path))

missing = []
for path in sorted(set(diagnostic_paths)):
    if path in tracked or path in staged_added:
        print(f"AS6_DIAGNOSTIC_GIT_TRACKING=PASS:{path}")
    else:
        print(f"AS6_DIAGNOSTIC_GIT_TRACKING=FAIL:{path}")
        missing.append(path)

focus = [
    "ops/bin/as6-diagnose-generated-python-imports",
    "ops/bin/as6-diagnose-generated-python-nameerror",
    "ops/bin/as6-diagnose-generated-python-regression",
    "ops/bin/as6-diagnose-generated-python-runtime",
]
for path in focus:
    if path in tracked or path in staged_added:
        print(f"AS6_DIAGNOSTIC_TRACKING_FOCUS=PASS:{path}")
    else:
        print(f"AS6_DIAGNOSTIC_TRACKING_FOCUS=FAIL:{path}")
        if path not in missing:
            missing.append(path)

print(f"AS6_DIAGNOSTIC_TRACKING_MISSING_COUNT={len(missing)}")
if missing:
    print("AS6_DIAGNOSTIC_TRACKING_CONSISTENCY=FAIL")
    print("AS6_DIAGNOSTIC_TRACKING_COVERAGE=FAIL")
    print("AS6_DIAGNOSTIC_TRACKING_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_DIAGNOSTIC_TRACKING_CONSISTENCY=PASS")
print("AS6_DIAGNOSTIC_TRACKING_COVERAGE=PASS")
print("AS6_DIAGNOSTIC_TRACKING_RESULT=OK")
