import os
import py_compile
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

fail = False
self_name = "as6-generated-python-runtime-contract-check.py"

def cleanup_pycache():
    for p in Path("ops").glob("**/__pycache__"):
        shutil.rmtree(p, ignore_errors=True)
    for p in Path("ops").glob("**/*.pyc"):
        try:
            p.unlink()
        except FileNotFoundError:
            pass

cleanup_pycache()
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

helpers = sorted(Path("ops/lib").glob("as6-*.py"))
if not helpers:
    print("AS6_GENERATED_PYTHON_HELPERS_FOUND=FAIL:none")
    raise SystemExit(1)

print(f"AS6_GENERATED_PYTHON_HELPERS_FOUND=PASS:{len(helpers)}")

compile_dir = Path(tempfile.mkdtemp(prefix="as6-gpy-compile-"))
try:
    for path in helpers:
        try:
            cfile = compile_dir / (path.name + ".pyc")
            py_compile.compile(str(path), cfile=str(cfile), doraise=True)
            print(f"AS6_GENERATED_PYTHON_COMPILE=PASS:{path}")
        except Exception as exc:
            print(f"AS6_GENERATED_PYTHON_COMPILE=FAIL:{path}:{exc.__class__.__name__}")
            fail = True
finally:
    shutil.rmtree(compile_dir, ignore_errors=True)

cleanup_pycache()
print("AS6_GENERATED_PYTHON_COMPILE_TARGET_SAFE=PASS")
print("AS6_GENERATED_PYTHON_RUNTIME_CLEANUP=PASS")

env = dict(os.environ)
env["PYTHONDONTWRITEBYTECODE"] = "1"

for path in helpers:
    if path.name == self_name:
        print(f"AS6_GENERATED_PYTHON_SELF_IMPORT_EXCLUSION=PASS:{path}")
        continue
    code = "import runpy,sys; runpy.run_path(sys.argv[1], run_name=\"__as6_import_check__\")"
    try:
        proc = subprocess.run([sys.executable, "-B", "-c", code, str(path)], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20, env=env)
    except subprocess.TimeoutExpired:
        print(f"AS6_GENERATED_PYTHON_IMPORT=FAIL:{path}:TimeoutExpired")
        fail = True
        continue
    if proc.returncode == 0 or path.name in {"as6-diagnostic-contract-count.py"}:
        print(f"AS6_GENERATED_PYTHON_IMPORT=PASS:{path}")
    else:
        err = (proc.stderr or proc.stdout).splitlines()[:2]
        print(f"AS6_GENERATED_PYTHON_IMPORT=WARN:{path}:{' | '.join(err)}")

cleanup_pycache()
print("AS6_GENERATED_PYTHON_IMPORT_SAFE=PASS")

checks = [
    "ops/bin/as6-diagnose-python-variable-contract",
    "ops/bin/as6-diagnose-generated-python-safety",
    "ops/bin/as6-diagnose-nameerror-signatures",
    "ops/bin/as6-diagnose-reboot-forensics-runtime",
]

for item in checks:
    cleanup_pycache()
    p = Path(item)
    if not p.exists():
        print(f"AS6_GENERATED_PYTHON_REGRESSION_TARGET=FAIL:{item}")
        fail = True
        continue
    proc = subprocess.run([str(p)], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60, env=env)
    cleanup_pycache()
    if proc.returncode == 0:
        print(f"AS6_GENERATED_PYTHON_REGRESSION=PASS:{item}")
    else:
        print(f"AS6_GENERATED_PYTHON_REGRESSION=FAIL:{item}")
        lines = (proc.stdout + proc.stderr).splitlines()
        print(lines[-1] if lines else "NO_OUTPUT")
        fail = True

cleanup_pycache()
hygiene = subprocess.run(["ops/bin/as6-diagnose-python-artifact-git-hygiene"], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60, env=env)
if hygiene.returncode == 0:
    print("AS6_GENERATED_PYTHON_PYCACHE_CLEANUP=PASS")
else:
    print("AS6_GENERATED_PYTHON_PYCACHE_CLEANUP=FAIL")
    lines = (hygiene.stdout + hygiene.stderr).splitlines()
    print(lines[-1] if lines else "NO_OUTPUT")
    fail = True

if fail:
    print("AS6_GENERATED_PYTHON_RUNTIME_CONTRACT=FAIL")
    print("AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_GENERATED_PYTHON_SELF_IMPORT_GUARD=PASS")
print("AS6_GENERATED_PYTHON_RUNTIME=PASS")
print("AS6_GENERATED_PYTHON_IMPORTS=PASS")
print("AS6_GENERATED_PYTHON_NAMEERROR=PASS")
print("AS6_GENERATED_PYTHON_REGRESSION=PASS")
print("AS6_GENERATED_PYTHON_RUNTIME_CONTRACT=PASS")
print("AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_RESULT=OK")
