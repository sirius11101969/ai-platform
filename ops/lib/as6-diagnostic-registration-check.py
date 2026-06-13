import json
import subprocess
from pathlib import Path

root = Path(".")
registry_path = Path("ops/status/diagnostic-status-registry.json")
registry_text = registry_path.read_text() if registry_path.exists() else ""

tracked = set(
    subprocess.check_output(["git", "ls-files"], text=True).splitlines()
)

diagnostics = sorted(Path("ops/bin").glob("as6-diagnose-*"))
helpers = sorted(Path("ops/lib").glob("as6-*.py"))

fail = False

if diagnostics:
    print("AS6_DIAGNOSTIC_FILE_EXISTS=PASS")
else:
    print("AS6_DIAGNOSTIC_FILE_EXISTS=FAIL")
    fail = True

for path in diagnostics:
    name = str(path)
    if name in tracked:
        print(f"AS6_DIAGNOSTIC_GIT_TRACKED=PASS:{name}")
    else:
        print(f"AS6_DIAGNOSTIC_GIT_TRACKED=FAIL:{name}")
        fail = True

    if name in registry_text:
        print(f"AS6_DIAGNOSTIC_IN_REGISTRY=PASS:{name}")
        print(f"AS6_DIAGNOSTIC_IN_COVERAGE=PASS:{name}")
    else:
        print(f"AS6_DIAGNOSTIC_IN_REGISTRY=FAIL:{name}")
        print(f"AS6_DIAGNOSTIC_IN_COVERAGE=FAIL:{name}")
        fail = True

for path in helpers:
    name = str(path)
    if name in tracked:
        print(f"AS6_DIAGNOSTIC_HELPER_GIT_TRACKED=PASS:{name}")
    else:
        print(f"AS6_DIAGNOSTIC_HELPER_GIT_TRACKED=FAIL:{name}")
        fail = True

if fail:
    print("AS6_DIAGNOSTIC_REGISTRATION=FAIL")
    print("AS6_DIAGNOSTIC_REGISTRATION_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_DIAGNOSTIC_REGISTRATION=PASS")
print("AS6_DIAGNOSTIC_REGISTRATION_RESULT=OK")
