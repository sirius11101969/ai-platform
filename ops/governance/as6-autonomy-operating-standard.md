# AS6 Autonomy Operating Standard

This file is the repository-persisted operating memory for AS6 autonomous engineering.

Required workflow:
1. Diagnostics first.
2. Structure before change.
3. Safe bounded change.
4. Repeat diagnostics.
5. Add new artifacts to diagnostics.
6. Add new checks to diagnostics.
7. Add new controls for every discovered failure class.
8. Add newly discovered error classes to root-cause governance.
9. Add new AEC rules to diagnostics.
10. Register every new diagnostic in registry, coverage, tracking, and root-cause governance.
11. Add automation and monitoring for repeat prevention.
12. Always report exactly what was added to diagnostics.

Patch construction rule:
- Prefer one external quoted heredoc.
- No nested heredocs inside generated scripts.
- No base64 patch payloads.
- No oversized single-line python command patches.
- No secret values printed in terminal, logs, diagnostics, diffs, or commits.

AEC signal required by diagnostics:
AEC_AUTONOMY_OPERATING_STANDARD=PASS
