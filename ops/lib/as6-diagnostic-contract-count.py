import json
import sys
from pathlib import Path

p = Path(sys.argv[1])
data = json.loads(p.read_text())
if isinstance(data, list):
    print(len(data))
elif isinstance(data, dict):
    for key in ("diagnostics", "items", "checks", "entries"):
        value = data.get(key)
        if isinstance(value, (list, dict)):
            print(len(value))
            break
    else:
        print(len(data))
else:
    print(0)
