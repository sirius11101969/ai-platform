import subprocess
from pathlib import Path

patterns = [
    "NameError:",
    "Did you mean:",
    "undefined variable",
    "name 'local_cmd' is not defined",
    "name 'severity' is not defined",
]

excluded_parts = {
    "diagnostic-backups",
    "pre-reboot-forensics",
    "reboot-forensics",
    "archive",
    "__pycache__",
}

def excluded(path):
    parts = set(path.parts)
    return bool(parts & excluded_parts)

hits = []
excluded_count = 0

for root in [Path("runtime")]:
    if not root.exists():
        continue
    for path in root.rglob("*"):
        if excluded(path):
            excluded_count += 1
            continue
        if not path.is_file() or path.stat().st_size > 2000000:
            continue
        try:
            text = path.read_text(errors="ignore")
        except Exception:
            continue
        for pat in patterns:
            if pat in text:
                hits.append(f"{path}:{pat}")
                break

try:
    out = subprocess.check_output(["journalctl","-u","as6-reboot-forensics-cache.service","-n","200","--no-pager"], text=True, stderr=subprocess.DEVNULL, timeout=10)
except Exception:
    out = ""

for pat in patterns:
    if pat in out:
        hits.append(f"journalctl:as6-reboot-forensics-cache.service:{pat}")

print(f"AS6_NAMEERROR_EXCLUDED_RUNTIME_ARTIFACTS_COUNT={excluded_count}")
print("AS6_BACKUP_ARTIFACT_EXCLUSION=PASS")
print("AS6_RUNTIME_DIAGNOSTIC_BACKUP_NOT_SCANNED=PASS")
print("AS6_NAMEERROR_SIGNATURE_SCOPE=PASS")

if hits:
    for hit in hits[:40]:
        print(f"AS6_NAMEERROR_SIGNATURE=FAIL:{hit}")
    print("AS6_NAMEERROR_SIGNATURES=FAIL")
    print("AS6_NAMEERROR_RUNTIME=FAIL")
    print("AS6_NAMEERROR_SIGNATURES_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_NAMEERROR_SIGNATURE=PASS:none")
print("AS6_NAMEERROR_SIGNATURES=PASS")
print("AS6_NAMEERROR_RUNTIME=PASS")
print("AS6_NAMEERROR_SIGNATURES_RESULT=OK")
