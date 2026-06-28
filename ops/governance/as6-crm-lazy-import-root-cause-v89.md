# AS6 CRM Lazy Import Root Cause V89

Root cause: CRMPage.jsx was dynamically imported by App.jsx and also statically imported through CRMWorkspacePage.jsx.

Risk: Vite cannot move CRMPage into a separate lazy chunk, causing bundle split drift.

Repair: remove direct CRMPage lazy route from App.jsx and keep CRM entry through /as6-sales -> AS6SalesShellAdapter -> CRMWorkspacePage -> CRMPage.
