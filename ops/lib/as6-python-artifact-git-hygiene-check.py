import subprocess
from pathlib import Path

fail = False
pycache_dirs = [p for p in Path(".").glob("**/__pycache__") if "runtime/diagnostic-backups" not in str(p)]
pyc_files = [p for p in Path(".").glob("**/*.pyc") if "runtime/diagnostic-backups" not in str(p)]

if pycache_dirs:
    for p in pycache_dirs[:40]:
        print(f"AS6_NO_PYCACHE_ARTIFACTS=FAIL:{p}")
    fail = True
else:
    print("AS6_NO_PYCACHE_ARTIFACTS=PASS")

if pyc_files:
    for p in pyc_files[:40]:
        print(f"AS6_NO_PYC_FILES=FAIL:{p}")
    fail = True
else:
    print("AS6_NO_PYC_FILES=PASS")

tracked = set(subprocess.check_output(["git", "ls-files"], text=True).splitlines())
tracked_bad = [p for p in tracked if p.endswith(".pyc") or "/__pycache__/" in p]
if tracked_bad:
    for p in tracked_bad[:40]:
        print(f"AS6_NO_TRACKED_PYCACHE=FAIL:{p}")
    fail = True
else:
    print("AS6_NO_TRACKED_PYCACHE=PASS")

status = subprocess.check_output(["git", "status", "--short"], text=True).splitlines()
untracked_pycache = [line for line in status if "__pycache__" in line or line.endswith(".pyc")]
if untracked_pycache:
    for line in untracked_pycache[:40]:
        print(f"AS6_NO_UNTRACKED_PYCACHE=FAIL:{line}")
    fail = True
else:
    print("AS6_NO_UNTRACKED_PYCACHE=PASS")

if fail:
    print("AS6_PYTHON_ARTIFACT_GIT_HYGIENE=FAIL")
    print("AS6_PYTHON_ARTIFACT_GIT_HYGIENE_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_PYTHON_ARTIFACT_GIT_HYGIENE=PASS")
print("AS6_PYTHON_ARTIFACT_GIT_HYGIENE_RESULT=OK")
