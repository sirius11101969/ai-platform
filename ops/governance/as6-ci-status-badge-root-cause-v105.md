# AS6 CI Status Badge Root Cause V105

Root cause: V104 wired AS6 DAG validation into GitHub Actions, but project documentation and governance do not yet make the canonical CI validation status visibly discoverable.

Risk: contributors can miss the required validation path or treat CI as optional/ad-hoc.

Repair: add README CI status badge, CI validation governance documentation and controls that verify the badge, workflow and as6-validate entrypoint remain aligned.
