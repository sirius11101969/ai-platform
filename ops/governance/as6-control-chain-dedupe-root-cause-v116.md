# AS6 Control Chain Dedupe Root Cause V116

Root cause: after V102 introduced AS6 Control Runner DAG, newer controls still retained legacy direct calls to previous controls. This caused old stages such as V92-V101 to appear repeatedly through nested validation paths.

Risk: validation logs become noisy, execution becomes slower, and two validation models coexist: legacy direct chaining and manifest-driven DAG execution.

Repair: remove direct control-to-control calls from V106-V115 controls and keep dependency ordering exclusively in ops/registry/as6-control-dependency-manifest.tsv through AS6 Control Runner.
