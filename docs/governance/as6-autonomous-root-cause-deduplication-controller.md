# AS6 Autonomous Root Cause Deduplication Controller

Purpose:

Detect duplicate, alias, overlap, orphan, and bloat risks in the AS6 root-cause catalog without deleting classes automatically.

Controller:

- ops/bin/as6-autonomous-root-cause-deduplication-controller

Runtime artifacts:

- runtime/root-cause-deduplication/latest.out
- runtime/root-cause-deduplication/root-cause-map.tsv
- runtime/root-cause-deduplication/root-cause-aliases.tsv
- runtime/root-cause-deduplication/root-cause-duplicates.tsv
- runtime/root-cause-deduplication/root-cause-orphans.tsv
- runtime/root-cause-deduplication/root-cause-summary.env

Policy:

- no automatic deletion
- review aliases before consolidation
- preserve diagnostics, coverage, rollback, prevention, and evidence
