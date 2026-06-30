# AS6 Signed Plugin Packages Trust Validation Root Cause P27

Root cause: Remote catalog and update manager existed, but Marketplace had no trust validation for package integrity, signatures or trusted publishers.

Repair: add plugin trust layer, publisher trust registry and Marketplace trust status integration.
