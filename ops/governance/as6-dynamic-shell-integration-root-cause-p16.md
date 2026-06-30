# AS6 Dynamic Shell Integration Root Cause P16

Root cause: P15 added Marketplace route/navigation metadata, but AS6 Shell still lacked a dynamic registry/bridge for route and navigation consumption.

Risk: each new route or plugin navigation item can require manual Shell/App wiring.

Repair: add Dynamic Shell Registry, React bridge, navigation helper and Marketplace bootstrap.
