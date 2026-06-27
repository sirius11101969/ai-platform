# AS6 CRM Brand Rewrite V1 Root Cause

- Root cause: старая /crm страница визуально остаётся старым CRM-интерфейсом, а CSS-полировка не переводит её в полноценный брендовый AS6 OS стиль.
- Architecture drift: CRM воспринимается как отдельная CRM, а не как модуль внутри AS6 AI Operating System.
- Resolution: создать новую безопасную страницу /crm-v2 с нуля в AS6 OS стиле, не ломая текущий production /crm.
- Page changed: /crm-v2.
- Page not changed: /crm.
- Next control: после визуального подтверждения /crm-v2 можно делать primary cutover на /crm.
