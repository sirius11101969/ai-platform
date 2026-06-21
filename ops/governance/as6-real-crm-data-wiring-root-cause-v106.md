# AS6 V106 Root Cause

Base commit: f655ea7.
V105 wired Dashboard live data and raised live operational data to 95%.
Remaining gap: CRM page family needs explicit wiring to AS6OperationalStore, pipeline data, lead status, SLA, activities, AI recommendations, freshness badges and cached fallback contract.
Repair/prevention: add CRM live data wiring, status component, CSS, contract docs, diagnostics/control/governance and CRM data drift classes.
