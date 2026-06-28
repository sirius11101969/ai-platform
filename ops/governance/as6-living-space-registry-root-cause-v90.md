# AS6 Living Space Registry Root Cause V90

Root cause: /as6-one and /as6-sales are now shell-based Living Spaces, but their route metadata and adapter policy are still distributed across App.jsx and individual adapter files.

Risk: adding future spaces directly in App.jsx can create manual route drift, duplicated shell policy, and inconsistent Context Bar / Intelligence Rail behavior.

Repair: create a Living Space Registry as the declarative source of truth for Living Space ids, routes, adapters, shell policy and business-logic preservation policy.
