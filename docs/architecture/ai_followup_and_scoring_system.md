# AS6 AI Follow-up and Lead Scoring System

## Назначение

Система превращает CRM AS6 в AI-native sales operating system: каждый лид получает AI score 0–100, вероятность сделки, риск, срочность и черновики follow-up без автоотправки. Все операции изолированы по `workspace_id` и используют существующую JWT/workspace модель доступа.

## Хранилище данных

### `lead_ai_scores`

Таблица хранит immutable-снимки AI оценки лида:

- `workspace_id`, `lead_id` — multi-tenant изоляция и связь с CRM.
- `score` — общий AI score 0–100.
- `temperature` / `engagement_level` — `cold`, `warm`, `hot`.
- `deal_probability` — вероятность сделки в процентах.
- `urgency_level` — `low`, `medium`, `high`.
- `risk_level`, `ideal_contact_timing`, `objections_detected`, `recommended_cta`, `recommended_channel` — расширенный слой revenue intelligence.
- `ai_summary`, `next_best_action`, `generated_at` — объяснение и рекомендация для менеджера.

### `ai_followup_sequences`

Таблица хранит черновики и очередь follow-up:

- `status`: `draft`, `queued`, `approved`, `sent`, `skipped`.
- `followup_type`: `telegram`, `email`, `reminder_task`.
- `generated_message` — контекстный текст сообщения или задачи.
- `recommended_at`, `scheduled_for` — рекомендация по времени касания.
- `approved_by_user`, `sent_at` — подготовлено для будущей автономной отправки, но сейчас автоотправка выключена.

## Scoring logic

AI score считается из реального контекста:

1. Этап сделки: новый лид получает низкий базовый score, proposal/booked — высокий, won/lost фиксируют крайние значения.
2. Engagement: Telegram история, CRM notes, timeline activity, AI tasks и email sent/opened события повышают score.
3. Recency: недавний контакт повышает score, отсутствие активности 48–72 часа повышает риск и снижает score.
4. Intent detection: слова про оплату, договор, КП, встречу повышают вероятность; «дорого», «позже», «не актуально» снижают.
5. AI output override: если OpenAI анализ `analyze_lead` вернул `conversionProbability`, он смешивается с heuristics, чтобы не ломать работу без ключа OpenAI.

Температура:

- `cold`: score < 40.
- `warm`: score 40–69.
- `hot`: score >= 70.

Urgency:

- `high`: нет реакции 48 часов или proposal без активности 24 часа.
- `medium`: нет активности 24 часа или обнаружены возражения.
- `low`: активный контакт без явных рисков.

## Follow-up lifecycle

1. Background worker или ручной запуск собирает контекст лида.
2. Lead scoring service рассчитывает AI score, risk, next best action и канал связи.
3. Если срочность `medium/high` или score >= 40, создаётся `ai_followup_sequences` со статусом `draft`.
4. UI показывает черновик, рекомендуемое время и канал.
5. Менеджер может вручную отправить Telegram/email через существующие безопасные CRM действия.
6. Будущая автономная версия сможет переводить `draft -> approved -> sent`, но текущая версия намеренно не отправляет сообщения автоматически.

## AI analysis flow

```text
CRM lead + notes + Telegram + email + timeline + AI actions
        ↓
leadIntelligenceService.scoreLeadContext()
        ↓
lead_ai_scores snapshot + crm_activity event
        ↓
ai_followup_sequences draft when follow-up is needed
        ↓
CRM card, modal, dashboard widgets, timeline intelligence
```

OpenAI `AI Sales Agent` остаётся совместимым: завершённый `analyze_lead` сохраняет output в `ai_agent_actions`, затем пересчитывает `lead_ai_scores`. `generate_follow_up` дополнительно создаёт черновик `ai_followup_sequences`, но не отправляет сообщение.

## Dashboard revenue intelligence

CRM stats теперь возвращают:

- hot leads;
- AI predicted revenue;
- at-risk deals;
- AI follow-ups pending;
- average lead score;
- AI conversion forecast.

Эти показатели отображаются на CRM странице и главном dashboard.

## Multi-tenant and safety

- Все новые таблицы имеют `workspace_id` и внешние ключи на workspace/lead.
- API routes используют `requireAuth` и `requireWorkspace`.
- Existing CRM, Telegram, email, AI tasks и workspace данные не изменяются destructive-операциями.
- Score snapshots append-only: существующие данные остаются интактными.
- Follow-up engine создаёт только drafts; автоотправка запрещена текущей архитектурой.

## Future autonomous automation design

Следующий этап после production validation:

1. Approval policies per workspace: manual, semi-auto, full-auto.
2. Rate limits and quiet hours per channel.
3. Human-in-the-loop approval UI для `ai_followup_sequences`.
4. Delivery worker для `approved` сообщений.
5. Outcome feedback loop: reply/open/payment updates автоматически recalibrate score weights.
6. Audit log для каждой autonomous action.
