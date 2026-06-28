# AS6 Living Space Registry Contract V90

Stage: AS6_LIVING_SPACE_REGISTRY_V90

Purpose:
- Make Living Spaces declarative.
- Prevent future manual route drift in App.jsx.
- Keep shell policy consistent across spaces.
- Preserve business logic inside existing page/workspace components.

Registered spaces:
- as6-one -> /as6-one -> AS6OneShellAdapter -> AS6Shell
- as6-sales -> /as6-sales -> AS6SalesShellAdapter -> AS6Shell

Required policy:
- Every Living Space has id, route, name, adapter, adapterPath and shell.
- Every Living Space uses contextBarMode="adaptive".
- Every Living Space uses intelligenceRailMode="adaptive".
- Every Living Space declares a businessLogicPolicy.
- Existing App.jsx routes must match registered routes until route rendering is migrated to registry-driven rendering.

Next migration:
- V91 may render Living Space routes from as6LivingSpaces instead of hardcoding them in App.jsx.

Validation:
- AS6_LIVING_SPACE_REGISTRY_V90=PASS
