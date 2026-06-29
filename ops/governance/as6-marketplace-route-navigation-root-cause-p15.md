# AS6 Marketplace Route & Navigation Root Cause P15

Root cause: P14 added Marketplace Developer Console UI, but the console was not yet exposed as a route-ready page or navigation item.

Risk: Marketplace remains a detached UI component instead of becoming part of AS6 Platform navigation.

Repair: add route page, navigation metadata, route definition and diagnostics.
