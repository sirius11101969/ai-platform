# Automatic AI Lead Qualification Pipeline

## Цель

После создания публичного лида из лендинга или API AS6 AI CRM автоматически квалифицирует заявку, рассчитывает AI score, определяет приоритет и готовит действие для менеджера в approval queue.

## Поток

```text
Landing/API Lead
  → crm_leads
  → ai_worker_queue(action_type=lead_prioritization)
  → AI qualification worker
  → lead_ai_scores
  → priority / recommended_channel / recommended_next_step
  → ai_followup_jobs for hot leads
  → CRM card + dashboard widgets
```

## Автоматический запуск

`publicLeadService.createPublicLead` после записи `crm_leads` создаёт задачу `ai_worker_queue` с `action_type = lead_prioritization` и статусом `pending_approval`. Затем `scheduleLeadQualification` запускает in-process квалификацию сразу после commit, а `startLeadQualificationWorker` периодически подбирает непросчитанные задачи как fallback.

## lead_ai_scores

Для каждой квалификации создаётся новая запись с полями:

- `lead_id`
- `workspace_id`
- `score` от 0 до 100
- `temperature` как приоритет: `hot`, `warm`, `cold`
- `urgency`
- `budget_probability`
- `intent_summary`
- `recommended_channel`: `telegram`, `email`, `phone`, `crm_task`
- `recommended_next_step`
- `confidence`
- `created_at`

Сохранены существующие поля совместимости (`deal_probability`, `urgency_level`, `ai_summary`, `next_best_action`, `generated_at`), чтобы не ломать CRM, timeline и старые отчёты.

## Скоринг

Базовая логика находится в `leadIntelligenceService.scoreLeadContext` и объединяет CRM-состояние с lead-capture эвристиками.

### Положительные факторы

- бизнес-email;
- указанная компания;
- Telegram контакт;
- длинное сообщение;
- слова намерения: `demo`, `crm`, `automation`, `ai`, `sales`, `integration`, `команда`, `внедрение`, `тариф`, `стоимость`;
- положительный intent и свежая активность.

### Негативные факторы

- disposable email;
- пустое сообщение;
- отсутствие компании;
- spam-like текст;
- негативный intent.

## Приоритет

`leadQualificationService.priorityFromScore` классифицирует лиды так:

- `hot`: score >= 75;
- `warm`: score >= 45;
- `cold`: score < 45.

## Рекомендации

AI-рекомендация создаётся на русском языке, например:

- `Рекомендуется связаться в Telegram в течение 15 минут.`
- `Лид проявил высокий интерес к AI CRM и автоматизации продаж.`
- `Запросить размер команды и текущую CRM.`

Текст сохраняется в `lead_ai_scores.recommended_next_step` и обновляет `ai_worker_queue.recommendation`.

## Approval queue

Каждый публичный лид получает approval item:

- `action_type = lead_prioritization`
- `status = pending_approval`
- title: `Квалифицировать лида — <lead name>`

Менеджер видит эту запись в AI Approval Queue как безопасную рекомендацию, а не как автоматическую отправку сообщения.

## Follow-up интеграция

Если `score > 75`, worker автоматически создаёт `ai_followup_jobs` со статусом `suggested`. Канал берётся из рекомендации (`telegram`, `email` или `crm`) и требует дальнейшего approval перед отправкой.

## UI

CRM карточка показывает:

- AI Score;
- priority badge (`HOT`, `WARM`, `COLD`);
- recommended channel;
- AI recommendation / next step.

Dashboard показывает:

- hot leads;
- warm leads;
- avg AI score;
- conversion probability.

## Проверка после merge/deploy

1. Создать лид через публичную форму или `/api/public/leads`.
2. Проверить, что в `crm_leads` появилась запись с `source = landing`.
3. Проверить `ai_worker_queue`: есть `lead_prioritization`, `pending_approval`.
4. Проверить `lead_ai_scores`: создан score, priority, канал и recommendation.
5. Если score > 75, проверить `ai_followup_jobs` со статусом `suggested`.
6. Открыть CRM карточку: score и recommendation должны отображаться.
7. Открыть Dashboard: hot/warm/avg/conversion widgets должны обновиться.

## Deploy after merge

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
