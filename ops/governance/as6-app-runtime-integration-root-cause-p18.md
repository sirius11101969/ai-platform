# AS6 App Runtime Integration Root Cause P18

Root cause: P17 added Shell runtime helpers, but App-level helpers were still missing for consuming runtime navigation and route outlet from application code.

Risk: dynamic plugin routes can still require manual wiring at App integration level.

Repair: add App Runtime Integration hook, navigation, route outlet and integration panel.
