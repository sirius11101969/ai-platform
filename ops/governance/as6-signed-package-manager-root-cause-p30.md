# AS6 Signed Package Manager Root Cause P30

Root cause: Trust UI and installation policy existed, but AS6 had no explicit signed package import/export manager for .as6plugin packages.

Repair: add signed package manager with manifest, export, import, validation and local repository helpers.
