import json
import sys
from pathlib import Path

catalog = Path(sys.argv[1])
data = json.loads(catalog.read_text())
failed = False

for key, value in sorted(data.items()):
    ok = bool(value.get("fix")) and bool(value.get("rollback")) and bool(value.get("prevention"))
    status = "PASS" if ok else "FAIL"
    print(f"AS6_ROOT_CAUSE_REMEDIATION_PLAN={status}:{key}")
    if not ok:
        failed = True

if failed:
    print("AS6_ROOT_CAUSE_REMEDIATION=FAIL")
    print("AS6_ROOT_CAUSE_REMEDIATION_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_ROOT_CAUSE_REMEDIATION=PASS")
print("AS6_ROOT_CAUSE_REMEDIATION_RESULT=OK")
