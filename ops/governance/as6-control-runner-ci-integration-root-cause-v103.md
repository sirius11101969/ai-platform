# AS6 Control Runner CI Integration Root Cause V103

Root cause: V102 added a DAG Control Runner, but CI/manual validation still lacks a single stable entrypoint that always runs the compact DAG validation.

Risk: developers can continue using legacy chained controls directly, causing long duplicated logs and inconsistent validation entrypoints.

Repair: add ops/bin/as6-validate as the canonical validation entrypoint backed by AS6 Control Runner DAG.
