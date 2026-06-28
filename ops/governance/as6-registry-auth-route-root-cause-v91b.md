# AS6 Registry Auth Route Root Cause V91B

Root cause: V91 attempted to remove manual Living Space routes, but App.jsx had /as6-one wrapped in RequireAuth. The first patcher only removed simple route shapes.

Risk: registry-driven routing could accidentally drop auth protection or leave duplicate manual routes in App.jsx.

Repair: move Living Space auth policy into registry metadata and render RequireAuth inside AS6LivingSpaceRoutes when required.
