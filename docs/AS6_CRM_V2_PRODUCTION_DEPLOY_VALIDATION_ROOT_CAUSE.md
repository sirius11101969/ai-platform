# AS6 CRM V2 Production Deploy Validation Root Cause

- /crm-v2 route exists in source code and build passes.
- User cannot open /crm-v2 in browser.
- Most likely root cause: production is serving an old frontend bundle or nginx root points to a different directory than frontend/dist.
- Page expected to change: /crm-v2.
- Page not changed: /crm.
- Required control: verify deployed index.html/assets contain CRMBrandV2Page/as6-crm-v2 markers.
