# AS6 Business Home Route Integration Root Cause

Root cause: Business Home Foundation existed as a component but was not reachable through the app router.

Repair: register /business-home route in frontend/src/App.jsx using existing ProtectedRoute.
