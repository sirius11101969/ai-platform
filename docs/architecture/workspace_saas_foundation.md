# Workspace SaaS Foundation

## Что добавлено

AS6 AI CRM теперь имеет базовую multi-tenant модель SaaS: рабочие пространства, участников с ролями, тарифные лимиты, пул AI-кредитов пространства и workspace-scoped CRM/AI/Telegram/email данные.

## Модель данных

Новые таблицы:

- `workspaces` — рабочее пространство SaaS с владельцем, тарифом и `credits_pool`.
- `workspace_members` — связь пользователей с пространствами и ролями `owner`, `admin`, `sales`, `viewer`.

Workspace scope добавлен в существующие сущности без удаления данных:

- `crm_leads.workspace_id`
- `crm_stages.workspace_id`
- `crm_notes.workspace_id`
- `crm_activity.workspace_id`
- `crm_followups.workspace_id`
- `ai_tasks.workspace_id`
- `telegram_messages.workspace_id`
- `credits_ledger.workspace_id`
- `email_attachments.workspace_id`
- `email_messages.workspace_id`
- `email_logs.workspace_id`

## Миграционные заметки

Миграция безопасная и недеструктивная:

1. Для каждого существующего пользователя создаётся default workspace с названием `<email-prefix> workspace`.
2. Пользователь добавляется в `workspace_members` как `owner`.
3. `plan` и текущий баланс `users.credits` копируются в `workspaces.plan` и `workspaces.credits_pool`.
4. Существующие лиды, CRM-этапы, заметки, AI-задачи, Telegram-сообщения, email-сущности и ledger-записи получают `workspace_id` default workspace владельца.
5. Старые `user_id` поля сохранены для обратной совместимости и аудита.
6. Миграция не удаляет таблицы, строки или пользовательские данные.

После merge production deploy остаётся стандартным:

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```

## Backend API

Добавлены endpoints:

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/current`
- `POST /api/workspaces/:id/members`
- `PATCH /api/workspaces/:id`

Активное пространство определяется через заголовок `X-Workspace-Id`. Если заголовок не передан, backend выбирает default workspace пользователя и проверяет membership.

## Роли

- `owner` — владелец пространства, может менять настройки и добавлять участников.
- `admin` — администратор, может менять настройки и добавлять участников.
- `sales` — рабочая роль для CRM и продаж.
- `viewer` — просмотр данных пространства.

## Тарифы и лимиты

Foundation поддерживает тарифы:

- `free`
- `starter`
- `pro`
- `business`
- `enterprise`

Для каждого тарифа определены лимиты:

- monthly AI credits
- leads limit
- team members limit
- Telegram automation availability
- email actions availability

## Usage tracking

`GET /api/workspaces/current` возвращает usage:

- `aiCreditsUsed`
- `leadsCount`
- `emailActionsCount`
- `telegramMessagesCount`

## Frontend

В защищённом AppShell добавлены:

- selector рабочего пространства;
- отображение текущего workspace name;
- modal настроек пространства;
- UI команды и ролей;
- отображение тарифных лимитов и usage.

Интерфейс сохранён на русском языке и выполнен в тёмном premium SaaS стиле.
