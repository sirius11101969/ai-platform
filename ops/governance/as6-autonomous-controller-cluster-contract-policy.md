# AS6 Autonomous Controller Cluster Contract Policy

Rule:

Autonomous governance controllers must use one shared fast contract.

Required behavior:

- knowledge base controller validates state, registry, coverage, status and root-cause knowledge linkage.
- incident governance controller validates governance, prevention and incident linkage.
- incident lifecycle controller validates incident state and lifecycle linkage.
- change approval controller validates production policy and change approval linkage.
- Controllers must not fail because of already accepted WARN-only weak linkage.
- Controllers must not recursively run full diagnose-all.
