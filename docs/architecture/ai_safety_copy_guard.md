
## Global visible UI sanitizer

The frontend has a shared visible-text sanitizer for manager/customer-facing screens. It is a UI visibility protection layer and does not replace or weaken the backend copy guard.

- `sanitizeVisibleAiText(text)` removes internal AI scoring context from visible UI and replaces it with a safe manager summary, for example:
  - `Высокий интерес к demo и внедрению.`
  - `Сделка требует follow-up сегодня.`
  - `Есть риск потери из-за паузы в коммуникации.`
  - `Встреча запланирована, нужно подготовить agenda.`
  - `Клиент заинтересован в следующем шаге.`
- `isInternalAiContext(text)` detects internal scoring markers such as `Плюсы:`, `Минусы:`, `Итог:`, `+18`, `ai_score`, `ai_priority`, `ai_risk_level`, `Контекст:` and `scoring_reason`.
- Customer-facing draft text is shown unchanged only when safe. If customer text contains internal AI context, the UI renders: `Текст заблокирован copy guard из-за внутреннего AI контекста.`
- Internal AI context can be rendered only in debug-only developer panels when `VITE_SHOW_INTERNAL_AI_DEBUG=true`; otherwise it is hidden/sanitized.
- Every sanitization event writes `[ui-sanitizer] internal AI text sanitized` to the browser console for visibility during QA.

The sanitizer is applied across CRM cards/details, CRM execution queues, Telegram/email draft previews, AI Workers approval/history/queue views, Pipeline Copilot, Priority Inbox, and Follow-ups surfaces.

## Backend AI copy sanitizer before persistence

The Node.js backend applies a shared AI copy sanitizer before AI-generated manager copy is persisted and before JSON API responses are returned.

- Shared helper: `backend/src/utils/aiCopySanitizer.js` exports `isInternalAiContext(text)`, `sanitizeAiCopy(text)`, and `sanitizeAiActionPayload(payload)`.
- Unsafe internal context markers include `Плюсы:`, `Минусы:`, `Итог:`, `Контекст:`, `ai_score:`, `ai_priority:`, `ai_risk_level:`, `scoring_reason`, and scoring deltas such as `+18`.
- Unsafe recommendation strings are replaced with safe manager summaries:
  - `Высокий интерес к demo и внедрению.`
  - `Встреча запланирована, нужно подготовить agenda.`
  - `Есть риск потери из-за паузы в коммуникации.`
- AI action payloads are sanitized recursively before queue persistence, including fields such as `recommendation`, `message`, `text`, `suggestedText`, `customerText`, `managerReason`, `reason`, `aiReasoning`, `internalContext`, and `scoringReason`.
- AI worker queue writers sanitize `recommendation` and `payload` before insert/update for generated next-best actions, Priority Inbox actions, follow-up drafts, Telegram/email drafts, meeting proposals, and lead-scoring recommendation actions.
- API responses under `/api` pass through the sanitizer unless `SHOW_INTERNAL_AI_DEBUG=true`, which allows internal debug payloads for developer-only inspection.
- Backend sanitizer logs use `[ai-copy-sanitizer] unsafe text detected`, `[ai-copy-sanitizer] text sanitized before save`, and `[ai-copy-sanitizer] payload sanitized before response` for QA and deploy verification.

Verification after deploy:

```bash
curl -k https://www.as6.ru/api/health

docker compose logs --tail=200 backend | grep -i "ai-copy-sanitizer\|copy-guard"

docker compose exec -e PAGER=cat db psql -U postgres -d aibot -c "SELECT status,action_type,title,LEFT(recommendation,120) AS recommendation FROM ai_worker_queue WHERE recommendation ILIKE '%Плюсы:%' OR recommendation ILIKE '%Контекст:%' OR recommendation ILIKE '%Итог:%' OR recommendation ILIKE '%ai_score:%' ORDER BY created_at DESC LIMIT 20;"
```

The SQL verification should return `(0 rows)`.
