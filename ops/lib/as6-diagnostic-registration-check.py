#!/usr/bin/env python3
import json, os, subprocess, sys
from pathlib import Path
root = Path(".")
diag_registry = root / "ops/registry/as6-diagnostic-registry.md"
cov_registry = root / "ops/registry/as6-coverage-registry.md"
status_registry = root / "ops/status/diagnostic-status-registry.json"
fail = 0
# AS6_SUMMARY_MODE_PATCH_V1
verbose = os.environ.get("AS6_DIAGNOSTIC_REGISTRATION_VERBOSE") == "1"
summary_counts = {}
def out(s):
    key = s.split("=", 1)[0]
    if "=PASS:" in s or "=WARN:" in s:
        summary_counts[key] = summary_counts.get(key, 0) + 1
        if verbose:
            print(s, flush=True)
    else:
        print(s, flush=True)
for p,name in [(diag_registry,"AS6_DIAGNOSTIC_REGISTRY_FILE"),(cov_registry,"AS6_COVERAGE_REGISTRY_FILE"),(status_registry,"AS6_STATUS_REGISTRY_FILE")]:
    if p.exists(): out(f"{name}=PASS:{p}")
    else: out(f"{name}=FAIL:{p}"); fail = 1
diag_text = diag_registry.read_text(errors="ignore") if diag_registry.exists() else ""
cov_text = cov_registry.read_text(errors="ignore") if cov_registry.exists() else ""
try:
    data = json.loads(status_registry.read_text()) if status_registry.exists() else {}
except Exception as e:
    out(f"AS6_STATUS_REGISTRY_JSON=FAIL:{e}")
    data = {}
    fail = 1
status_paths = set()
items = data.get("diagnostics", []) if isinstance(data, dict) else []
if isinstance(items, list):
    for item in items:
        if isinstance(item, dict) and item.get("path"):
            status_paths.add(item["path"])
else:
    out("AS6_STATUS_REGISTRY_SCHEMA=FAIL:diagnostics_not_array")
    fail = 1
try:
    tracked = set(subprocess.check_output(["git","ls-files"], text=True).splitlines())
except Exception:
    tracked = set()
paths = []
for p in sorted(Path("ops/bin").glob("as6-diagnose-*")):
    path = str(p)
    if ".backup." in path:
        continue
    paths.append(path)
out("AS6_DIAGNOSTIC_FILE_EXISTS=PASS" if paths else "AS6_DIAGNOSTIC_FILE_EXISTS=FAIL")
for path in paths:
    if path in tracked: out(f"AS6_DIAGNOSTIC_GIT_TRACKED=PASS:{path}")
    else: out(f"AS6_DIAGNOSTIC_GIT_TRACKED=FAIL:{path}"); fail = 1
    if path in diag_text: out(f"AS6_DIAGNOSTIC_IN_REGISTRY=PASS:{path}")
    else: out(f"AS6_DIAGNOSTIC_IN_REGISTRY=FAIL:{path}"); fail = 1
    if path in cov_text: out(f"AS6_DIAGNOSTIC_IN_COVERAGE=PASS:{path}")
    else: out(f"AS6_DIAGNOSTIC_IN_COVERAGE=FAIL:{path}"); fail = 1
    if path in status_paths: out(f"AS6_DIAGNOSTIC_IN_STATUS_REGISTRY=PASS:{path}")
    else: out(f"AS6_DIAGNOSTIC_IN_STATUS_REGISTRY=FAIL:{path}"); fail = 1
helpers = sorted(Path("ops/lib").glob("*.py"))
for h in helpers:
    hp = str(h)
    if hp in tracked: out(f"AS6_DIAGNOSTIC_HELPER_GIT_TRACKED=PASS:{hp}")
    else: out(f"AS6_DIAGNOSTIC_HELPER_GIT_TRACKED=WARN:{hp}")
for key in sorted(summary_counts):
    out(f"{key}_COUNT={summary_counts[key]}")
if fail == 0:
    out("AS6_DIAGNOSTIC_REGISTRATION=PASS")
    out("AS6_DIAGNOSTIC_REGISTRATION_RESULT=OK")
    sys.exit(0)
out("AS6_DIAGNOSTIC_REGISTRATION=FAIL")
out("AS6_DIAGNOSTIC_REGISTRATION_RESULT=FAIL")
sys.exit(1)
