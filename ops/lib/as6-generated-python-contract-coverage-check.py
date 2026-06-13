import json
import subprocess
from pathlib import Path

fail = False
registry_path = Path("ops/status/diagnostic-status-registry.json")
contracts_diag = Path("ops/bin/as6-diagnose-generated-python-contracts")
contracts_helper = Path("ops/lib/as6-generated-python-contracts-check.py")

if not registry_path.exists():
    print("AS6_GPY_CONTRACT_COVERAGE_REGISTRY=FAIL:missing")
    raise SystemExit(1)
print(f"AS6_GPY_CONTRACT_COVERAGE_REGISTRY=PASS:{registry_path}")

registry_text = registry_path.read_text()
contracts_text = contracts_helper.read_text(errors="replace") if contracts_helper.exists() else ""
tracked = set(subprocess.check_output(["git", "ls-files"], text=True).splitlines())
status = subprocess.check_output(["git", "status", "--short"], text=True).splitlines()
staged_added = set(line[3:] for line in status if len(line) >= 4 and line[0] == "A")

generated_diags = sorted(Path("ops/bin").glob("as6-diagnose-generated-python-*"))
generated_helpers = sorted(Path("ops/lib").glob("as6-generated-python-*.py"))

if not generated_diags:
    print("AS6_GPY_DIAGNOSTICS_FOUND=FAIL:none")
    fail = True
else:
    print(f"AS6_GPY_DIAGNOSTICS_FOUND=PASS:{len(generated_diags)}")

if not generated_helpers:
    print("AS6_GPY_HELPERS_FOUND=FAIL:none")
    fail = True
else:
    print(f"AS6_GPY_HELPERS_FOUND=PASS:{len(generated_helpers)}")

for path in generated_diags:
    s = str(path)
    if s in registry_text:
        print(f"AS6_GPY_DIAGNOSTIC_IN_REGISTRY=PASS:{s}")
    else:
        print(f"AS6_GPY_DIAGNOSTIC_IN_REGISTRY=FAIL:{s}")
        fail = True
    if s in tracked or s in staged_added:
        print(f"AS6_GPY_DIAGNOSTIC_GIT_TRACKING=PASS:{s}")
    else:
        print(f"AS6_GPY_DIAGNOSTIC_GIT_TRACKING=FAIL:{s}")
        fail = True
    if path.name == "as6-diagnose-generated-python-contracts" or path.name.replace("as6-diagnose-", "") in contracts_text or s in contracts_text:
        print(f"AS6_GPY_DIAGNOSTIC_IN_CONTRACTS=PASS:{s}")
    else:
        print(f"AS6_GPY_DIAGNOSTIC_IN_CONTRACTS=FAIL:{s}")
        fail = True

for path in generated_helpers:
    s = str(path)
    if s in tracked or s in staged_added:
        print(f"AS6_GPY_HELPER_GIT_TRACKING=PASS:{s}")
    else:
        print(f"AS6_GPY_HELPER_GIT_TRACKING=FAIL:{s}")
        fail = True
    if path.name == "as6-generated-python-contracts-check.py" or s in contracts_text or "runtime-contract-check.py" in path.name:
        print(f"AS6_GPY_HELPER_IN_CONTRACTS=PASS:{s}")
    else:
        print(f"AS6_GPY_HELPER_IN_CONTRACTS=FAIL:{s}")
        fail = True

required_signals = [
    "AS6_GENERATED_PYTHON_IMPORT_CONTRACT=PASS",
    "AS6_GENERATED_PYTHON_NAMEERROR_CONTRACT=PASS",
    "AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_AGGREGATE=PASS",
    "AS6_GENERATED_PYTHON_COMPILE_CONTRACT=PASS",
    "AS6_GENERATED_PYTHON_REGRESSION_CONTRACT=PASS",
    "AS6_GENERATED_PYTHON_CONTRACTS=PASS",
]
for signal in required_signals:
    if signal in contracts_helper.read_text(errors="replace"):
        print(f"AS6_GPY_CONTRACT_SIGNAL_DECLARED=PASS:{signal}")
    else:
        print(f"AS6_GPY_CONTRACT_SIGNAL_DECLARED=FAIL:{signal}")
        fail = True

if fail:
    print("AS6_GENERATED_PYTHON_CONTRACT_COVERAGE=FAIL")
    print("AS6_GENERATED_PYTHON_CONTRACT_COVERAGE_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_GENERATED_PYTHON_DIAGNOSTIC_CONTRACT_COVERAGE=PASS")
print("AS6_GENERATED_PYTHON_HELPER_CONTRACT_COVERAGE=PASS")
print("AS6_GENERATED_PYTHON_CONTRACT_REGISTRY_COVERAGE=PASS")
print("AS6_GENERATED_PYTHON_CONTRACT_TRACKING_COVERAGE=PASS")
print("AS6_GENERATED_PYTHON_CONTRACT_COVERAGE=PASS")
print("AS6_GENERATED_PYTHON_CONTRACT_COVERAGE_RESULT=OK")
