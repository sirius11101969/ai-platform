
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
