# AS6 Living Documents Read-Only v2

## Диагностика

Living Documents использовал демонстрационные материалы.
Read-only API вложений уже был зарегистрирован, но не подключён к Living Space.

## Root Cause

- отсутствовал attachments adapter;
- отсутствовали loading, empty и error-состояния;
- Projects и Knowledge содержали ложные production-данные;
- не было контроля запрета мутаций.

## Изменение

- подключён fetchEmailAttachments;
- добавлена нормализация вложений;
- добавлены реальные материалы активного workspace;
- добавлены loading, empty и error-состояния;
- Projects и Knowledge переведены в честное unavailable-состояние;
- загрузка, изменение и удаление файлов отключены.

## Failure classes

- AS6_LIVING_DOCUMENTS_DEMO_DATA_PRESENT
- AS6_LIVING_DOCUMENTS_ADAPTER_GAP
- AS6_DOCUMENT_LOADING_EMPTY_ERROR_GAP
- AS6_FALSE_PROJECT_KNOWLEDGE_DATA_PRESENT
- AS6_DOCUMENT_READ_ONLY_MUTATION_LEAK
- AS6_DOCUMENT_PRODUCTION_DEPLOYMENT_DRIFT
