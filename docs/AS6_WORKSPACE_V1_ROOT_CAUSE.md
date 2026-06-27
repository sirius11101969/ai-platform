# AS6 Workspace V1 Root Cause

- AS6 имеет каноническую архитектуру, но единый Workspace foundation ещё не закреплён как reusable UI layer.
- Риск: CRM и будущие модули могут развиваться как отдельные страницы вместо единой AS6 Operating System.
- Решение: добавить первый reusable AS6 Workspace shell: Sidebar, Header, Right Rail, Core, Focus, Assistant.
