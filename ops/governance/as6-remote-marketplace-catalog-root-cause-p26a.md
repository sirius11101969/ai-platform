# AS6 Remote Marketplace Catalog Root Cause P26A

Root cause: Marketplace could install and update local plugins, but had no contract for remote catalog synchronization.

Repair: add remote catalog contract with local fallback and registration helper.
