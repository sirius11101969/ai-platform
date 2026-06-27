# AS6 OS Brand System Refinement

- Root cause: CRM Workspace уже выглядит близко к AS6 OS, но часть визуального языка всё ещё воспринимается как CRM/SaaS, а не как AI Operating System.
- Architecture drift: брендовые элементы OS не закреплены отдельным non-destructive CSS layer.
- Design drift: требуется единый премиальный AS6 OS look для shell, panels, assistant, focus, right rail and CRM client surface.
- Resolution: добавить отдельный brand refinement layer без изменения бизнес-логики CRM.
- Prevention: CSS layer подключается один раз и проверяется build/secret scan/pre-commit.
