# AS6 Repair V74 Docs Secret Scan False Positive Control
- Documentation and registry text must avoid null-token-initializer wording that triggers secret-scan false positives.
- Code may keep safe null initializers; docs must describe them as null-token-initializer.
- Runtime artifacts must not be staged.
- V74 analytics targeted render wiring must remain build-clean and no-visible-UI.
