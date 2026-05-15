# Demo Sales Pipeline

## Назначение

Демо-воронка нужна для безопасной демонстрации AS6 AI CRM Platform и проверки AI Workers на реалистичных CRM данных без загрузки production-лидов.

## Endpoint

`POST /api/demo/seed-sales-pipeline`

Endpoint защищён стандартными middleware:

- `requireAuth` — нужен действующий JWT пользователя.
- `requireWorkspace` — данные создаются только в активном workspace из `X-Workspace-Id`.

## Что создаётся

При первом запуске для текущего пользователя и активного workspace создаются 5 лидов:

1. **Горячий лид** — хочет демо и просит цену.
2. **Тёплый лид** — интересуется Telegram AI.
3. **Холодный лид** — спросил «что умеете?».
4. **Лид из email** — попросил презентацию.
5. **Лид на встречу** — хочет созвон.

Для лидов заполняются поля CRM:

- `name`
- `company`
- `email`
- `telegram_username`
- `value`
- `status` / `stage`
- `source`

Также создаются связанные данные:

- CRM notes в `crm_notes`.
- CRM activity в `crm_activity`.
- Timeline события в `lead_timeline_events`.
- Telegram история в `telegram_messages`, где релевантно.
- Email события в `email_messages` и `email_logs`, где релевантно.
- AI scoring через существующий `analyzeLeadIntelligence` и связанные follow-up рекомендации, если scoring поддерживается текущей схемой БД.

## Безопасность и идемпотентность

Демо-записи маркируются в `crm_leads.metadata`:

```json
{
  "demoSeedKey": "as6-demo-sales-pipeline-v1",
  "safeDemoData": true
}
```

Перед созданием endpoint проверяет наличие такого маркера в текущей паре `user_id + workspace_id`. Если демо-воронка уже есть, API возвращает сообщение:

```text
Демо-воронка уже создана.
```

Повторный запуск не создаёт дубликаты. Endpoint не обновляет и не удаляет существующие production-данные.

Для защиты от параллельных повторных запусков используется транзакционный advisory lock PostgreSQL по ключу demo seed + workspace + user.

## Frontend

На странице `/ai-workers` добавлен блок «Безопасный демо-режим» с кнопкой:

```text
Создать демо-воронку
```

Пользователь видит предупреждение:

```text
Демо-данные будут добавлены только в текущий workspace.
```

После успешного запуска UI показывает количество созданных лидов. Если seed уже был выполнен, UI показывает:

```text
Демо-воронка уже создана.
```

## Проверка после merge / deploy

Рекомендуемый production deploy после merge:

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```

Smoke-check:

1. Открыть login и войти в аккаунт.
2. Проверить API health: `GET /health`.
3. Открыть `/crm` и убедиться, что production CRM не изменена до запуска демо.
4. Открыть `/ai-workers` и нажать «Создать демо-воронку».
5. Повторно нажать кнопку и убедиться, что дубликаты не создаются.
6. Открыть `/crm` и проверить 5 демо-лидов в текущем workspace.
7. Проверить, что AI scoring и очередь рекомендаций появились только для демо-лидов текущего workspace.
