# AS6 V78C Root Cause

V78B diagnostics passed.
V78B control failed because npm is not installed on the host shell.
Repair: make control use an adaptive frontend build runner: host npm when available, otherwise Docker Compose Node container.
