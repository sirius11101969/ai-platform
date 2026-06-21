# AS6 Physical Page Refactor Migration V109

Base commit: 765a539.

## Physical refactor target pages
- CRM
- Dashboard
- Revenue
- Workforce
- Approval
- Execution
- Executive Brain

## Physical primitives
- AS6PhysicalPageRefactorBridge
- AS6PhysicalKpiRow
- AS6PhysicalActionBar
- AS6DataSurface
- AS6DataState

## Migration result
- Real Page Conversion target: 100%

## Failure classes
- PHYSICAL_PAGE_REFACTOR_MISSING
- PHYSICAL_CRM_REFACTOR_GAP
- PHYSICAL_DASHBOARD_REFACTOR_GAP
- PHYSICAL_REVENUE_REFACTOR_GAP
- PHYSICAL_WORKFORCE_REFACTOR_GAP
- PHYSICAL_APPROVAL_REFACTOR_GAP
- PHYSICAL_EXECUTION_REFACTOR_GAP
- PHYSICAL_EXECUTIVE_REFACTOR_GAP
- LEGACY_LAYOUT_PHYSICAL_DRIFT
- PHYSICAL_REFACTOR_PRIMITIVE_GAP
