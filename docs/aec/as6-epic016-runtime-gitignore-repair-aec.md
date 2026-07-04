# AS6 EPIC016 Runtime Gitignore Repair AEC

AEC_RULE=AS6_AEC_RUNTIME_EVIDENCE_STAGING_FOR_IGNORED_PATHS
STATUS=ACTIVE

Prevented drift:
- Losing diagnostic runtime evidence because runtime/ is ignored.
- Stopping a validated cycle at git add due to ignored paths.
- Repeating plain git add on ignored runtime paths.
