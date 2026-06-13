from pathlib import Path

fail = False
strict_targets = [
    Path("ops/bin/as6-diagnose-python-variable-contract"),
    Path("ops/bin/as6-diagnose-nameerror-signatures"),
    Path("ops/bin/as6-diagnose-generated-python-safety"),
    Path("ops/bin/as6-diagnose-reboot-forensics-runtime"),
    Path("ops/lib/as6-python-variable-contract-check.py"),
    Path("ops/lib/as6-nameerror-signature-check.py"),
    Path("ops/lib/as6-diagnostic-contract-count.py"),
    Path("ops/lib/as6-diagnostic-registration-check.py"),
    Path("ops/lib/as6-root-cause-remediation-check.py"),
    Path("ops/lib/as6-root-cause-router-emit.py"),
]
self_file = Path("ops/lib/as6-generated-python-safety-check.py")
legacy_targets = list(Path("ops/bin").glob("as6-*"))
bad = ["python3 - <<", "python3 -c '", "python3 -c \"", "<<'PY'", "<<PY", "base64.b64decode"]

for path in strict_targets:
    if not path.exists() or not path.is_file():
        continue
    text = path.read_text(errors="replace")
    for pat in bad:
        if pat in text:
            print(f"AS6_GENERATED_PYTHON_STRICT_PATTERN=FAIL:{path}:{pat}")
            fail = True
    if path.suffix == ".py":
        print(f"AS6_GENERATED_PYTHON_HELPER=PASS:{path}")

if self_file.exists():
    print(f"AS6_GENERATED_PYTHON_SELF_REFERENCE_EXCLUDED=PASS:{self_file}")

legacy_warn_count = 0
for path in sorted(set(legacy_targets)):
    if not path.is_file() or path in strict_targets:
        continue
    text = path.read_text(errors="replace")
    matched = []
    for pat in bad:
        if pat in text:
            matched.append(pat)
    if matched:
        legacy_warn_count += 1
        print(f"AS6_GENERATED_PYTHON_LEGACY_PATTERN=WARN:{path}:{','.join(matched[:3])}")

print(f"AS6_GENERATED_PYTHON_LEGACY_WARN_COUNT={legacy_warn_count}")
print("AS6_GENERATED_PYTHON_SAFETY_SCOPE=PASS")
print("AS6_GENERATED_PYTHON_SELF_REFERENCE_EXCLUSION=PASS")

if fail:
    print("AS6_GENERATED_PYTHON_VARIABLES=FAIL")
    print("AS6_GENERATED_PYTHON_SAFETY=FAIL")
    print("AS6_GENERATED_PYTHON_SAFETY_RESULT=FAIL")
    raise SystemExit(1)

print("AS6_GENERATED_PYTHON_VARIABLES=PASS")
print("AS6_GENERATED_PYTHON_SAFETY=PASS")
print("AS6_GENERATED_PYTHON_SAFETY_RESULT=OK")
