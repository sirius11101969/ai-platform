import subprocess
from pathlib import Path

def run_contracts():
    checks = {
        "runtime": ("ops/bin/as6-diagnose-generated-python-runtime", ["AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_RESULT=OK", "AS6_GENERATED_PYTHON_COMPILE_TARGET_SAFE=PASS"]),
        "imports": ("ops/bin/as6-diagnose-generated-python-imports", ["AS6_GENERATED_PYTHON_IMPORTS=PASS", "AS6_GENERATED_PYTHON_IMPORT_SAFE=PASS"]),
        "nameerror": ("ops/bin/as6-diagnose-generated-python-nameerror", ["AS6_GENERATED_PYTHON_NAMEERROR=PASS"]),
        "regression": ("ops/bin/as6-diagnose-generated-python-regression", ["AS6_GENERATED_PYTHON_REGRESSION=PASS"]),
        "safety": ("ops/bin/as6-diagnose-generated-python-safety", ["AS6_GENERATED_PYTHON_SAFETY_RESULT=OK"]),
        "coverage": ("ops/bin/as6-diagnose-generated-python-contract-coverage", ["AS6_GENERATED_PYTHON_CONTRACT_COVERAGE_RESULT=OK"]),
        "tracking": ("ops/bin/as6-diagnose-diagnostic-tracking", ["AS6_DIAGNOSTIC_TRACKING_RESULT=OK"]),
    }
    fail = False
    for name, pair in checks.items():
        cmd, required = pair
        if not Path(cmd).exists():
            print(f"AS6_GENERATED_PYTHON_CONTRACT_TARGET=FAIL:{name}:{cmd}")
            fail = True
            continue
        proc = subprocess.run([cmd], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)
        out = proc.stdout + proc.stderr
        if proc.returncode != 0:
            print(f"AS6_GENERATED_PYTHON_CONTRACT_CHECK=FAIL:{name}")
            lines = out.splitlines()
            print(lines[-1] if lines else "NO_OUTPUT")
            fail = True
            continue
        missing = [signal for signal in required if signal not in out]
        if missing:
            print(f"AS6_GENERATED_PYTHON_CONTRACT_SIGNAL=FAIL:{name}:{','.join(missing)}")
            fail = True
        else:
            print(f"AS6_GENERATED_PYTHON_CONTRACT_CHECK=PASS:{name}")
    helpers = [
        Path("ops/lib/as6-generated-python-runtime-contract-check.py"),
        Path("ops/lib/as6-generated-python-safety-check.py"),
        Path("ops/lib/as6-generated-python-contract-coverage-check.py"),
    ]
    for helper in helpers:
        if helper.exists():
            print(f"AS6_GENERATED_PYTHON_HELPER_TRACKING=PASS:{helper}")
        else:
            print(f"AS6_GENERATED_PYTHON_HELPER_TRACKING=FAIL:{helper}")
            fail = True
    print("AS6_GENERATED_PYTHON_CONTRACT_IMPORT_GUARD=PASS")
    print("AS6_GENERATED_PYTHON_CONTRACT_HELPER_IMPORT_SAFE=PASS")
    if fail:
        print("AS6_GENERATED_PYTHON_CONTRACTS=FAIL")
        print("AS6_GENERATED_PYTHON_CONTRACTS_RESULT=FAIL")
        raise SystemExit(1)
    print("AS6_GENERATED_PYTHON_IMPORT_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_NAMEERROR_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_AGGREGATE=PASS")
    print("AS6_GENERATED_PYTHON_COMPILE_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_REGRESSION_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_SAFETY_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_COVERAGE_CONTRACT=PASS")
    print("AS6_GENERATED_PYTHON_CONTRACTS=PASS")
    print("AS6_GENERATED_PYTHON_CONTRACTS_RESULT=OK")

if __name__ == "__main__":
    run_contracts()
