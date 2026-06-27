# AS6 CRM Brand Rewrite V1 Governance

- Rule: старый /crm не удалять до визуального подтверждения владельца.
- Rule: новая CRM v2 должна быть отдельной страницей /crm-v2.
- Rule: никаких destructive changes для production CRM в этом этапе.
- Rule: build, import-count, route-count, secret scan, registry and coverage update обязательны.
- Failure class: old-crm-brand-architecture-drift.
- AEC rule: crm-brand-rewrite-must-use-safe-parallel-route-before-cutover.
