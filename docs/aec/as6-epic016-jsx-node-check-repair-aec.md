# AS6 EPIC016 JSX Node Check Repair AEC

AEC_RULE=AS6_AEC_JSX_VALIDATION_USES_FRONTEND_BUILD
STATUS=ACTIVE

Prevented drift:
- Using Node.js direct syntax check for JSX files.
- Failing validated UI cycles because the validation tool does not support the file extension.
- Treating JSX parser-tool mismatch as application code failure.
