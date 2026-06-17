# AS6 Diagnostics-First Operating Standard

This is the canonical AS6 operating rule.

Required workflow:
1. Diagnostics first.
2. Structure validation.
3. Controlled change.
4. Repeat diagnostics.
5. Add every newly discovered artifact to diagnostics.
6. Add every newly discovered check to diagnostics.
7. Add every newly discovered control to diagnostics.
8. Add every newly discovered error/root-cause class to diagnostics.
9. Add every newly required AEC rule to diagnostics.
10. Register diagnostics in coverage and registry.
11. Update docs/AS6_PROJECT_STATE.md.
12. Run secret scan.
13. Run full diagnose-all watcher.
14. Commit and push only after green diagnostics.

Command style:
- Prefer one large command/script/patch/prompt/hybrid.
- Use one external quoted heredoc.
- Avoid nested heredocs.
- Avoid base64.
- Avoid long inline python3.
- Never print or request secrets unless explicitly required, and always mark exact secret insertion locations.
