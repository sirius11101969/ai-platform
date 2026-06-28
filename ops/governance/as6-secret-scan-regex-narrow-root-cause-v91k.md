# AS6 Secret Scan Regex Narrow Root Cause V91K

Root cause: V91J hook still blocked safe documentation because the regex matched generic words like secret instead of real secret value patterns.

Repair: narrow pre-commit scan to assignment/value-like secret patterns and known token formats only.
