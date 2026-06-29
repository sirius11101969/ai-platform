# AS6 CRM Runtime UI Integration Root Cause P3

Root cause: P2 added CRM Living Space Runtime, but the React CRM/Sales shell did not yet activate or display runtime state.

Risk: CRM could remain visually page-driven while runtime existed only as a detached module.

Repair: add CRM Runtime Bridge hook/status component and integrate it into AS6SalesShellAdapter.
