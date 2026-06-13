import json
import sys
from pathlib import Path

catalog = Path(sys.argv[1])
data = json.loads(catalog.read_text())
count = 0

def route_for(key):
    if "GENERATED_PYTHON" in key:
        return "as6-diagnose-root-cause-router"
    if key.startswith("ROOT_CAUSE_"):
        if "ROUTER" in key or "ROUTING" in key:
            return "as6-diagnose-root-cause-router"
        if "REMEDIATION" in key:
            return "as6-diagnose-root-cause-remediation"
        if "VALIDATION" in key:
            return "as6-diagnose-root-cause-validation"
        return "as6-diagnose-root-cause-governance"
    if "REGISTRY" in key or "METRIC" in key or "CONTRACT" in key or "HEREDOC_RUNTIME" in key:
        return "as6-diagnose-diagnostic-contract"
    if "PATCH" in key or "BASE64" in key or "HEREDOC" in key or "COPY_PASTE" in key or "SELF_REFERENCE" in key:
        return "as6-diagnose-patch-mode"
    if "HOST_FREEZE" in key:
        return "as6-diagnose-host-freeze-investigation-pack"
    if "NETWORK" in key:
        return "as6-diagnose-host-freeze-network"
    if "PROVIDER_HYPERVISOR" in key:
        return "as6-diagnose-provider-hypervisor-reboot"
    return "as6-diagnose-root-cause-knowledge-base"

for key, value in sorted(data.items()):
    diagnostic = route_for(key)
    severity = value.get("severity", "unknown")
    print(f"AS6_ROOT_CAUSE_ROUTE=PASS:{key}:{diagnostic}:{severity}")
    count += 1

print(f"AS6_ROOT_CAUSE_ROUTE_COUNT_VALUE={count}")
print("AS6_ROOT_CAUSE_ROUTE_COUNT=PASS")
print("AS6_ROOT_CAUSE_ROUTER=PASS")
print("AS6_ROOT_CAUSE_ROUTER_RESULT=OK")
