# AS6 Design System Foundation

STATUS=ACTIVE
VERSION=V1
SOURCE_OF_TRUTH=Command Center
CURRENT_STAGE=V222_58
PROJECT_READINESS=99%

## Правила
- Command Center считается визуальным эталоном AS6.
- Все новые страницы должны использовать единые токены и компоненты.
- Новые карточки строятся через BaseCard или производные компоненты.
- Новые кнопки строятся через PrimaryButton / SecondaryButton.
- Inline-style допускается только для динамических значений.
- Старые page-specific CSS overrides постепенно удаляются при миграции страниц.

## Порядок миграции
1. CRM
2. Revenue
3. AI Workers
4. Analytics
5. Communications
6. DevOps
7. Settings
