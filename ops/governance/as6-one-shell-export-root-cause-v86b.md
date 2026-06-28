# AS6 ONE Shell Export Root Cause V86B

Root cause: V86 created a real /as6-one adapter, but imported AS6Shell as default. The actual AS6Shell module exposes shell via named export, so Vite/Rollup rejected the default import.

Repair: detect shell export style and patch AS6OneShellAdapter import to match the real module interface.
