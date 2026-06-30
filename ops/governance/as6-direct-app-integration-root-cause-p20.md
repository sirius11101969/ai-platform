# AS6 Direct App Integration Root Cause P20

Root cause: P19 provided Real App Wiring, but `/marketplace` was not yet directly reachable from the real application entry.

Repair: add minimal direct App.jsx route guard for `/marketplace` using AS6RealAppWiring.
