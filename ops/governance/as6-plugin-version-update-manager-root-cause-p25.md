# AS6 Plugin Version Update Manager Root Cause P25

Root cause: Marketplace install persistence existed, but installed plugins had no version comparison, update detection or rollback snapshot.

Repair: add version comparator, update status, update operation and rollback helper.
