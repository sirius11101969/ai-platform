# AS6 Guardian External Infrastructure Failure Repair AEC

- Guardian must classify project failures separately from external infrastructure failures.
- Guardian must classify registry failures separately from security and governance failures.
- Guardian must separate BUILD_RESULT from MERGE_DECISION.
- Recovered external registry failures may allow merge when project, security and governance failures are zero.
- Confirmed project, security and governance failures remain blocking.
