# AI Sales Worker v1 — `sales_followup_generation`

AI Sales Worker v1 is the first business worker built on the production autonomous execution layer. It converts CRM lead context into a manager-approved customer follow-up draft without sending anything directly.

## Flow

```text
CRM lead
  -> POST /api/ai/execution/enqueue-sales-followup
  -> ai_execution_jobs(job_type='sales_followup_generation', status='queued')
  -> autonomous execution loop claims the job
  -> OpenAI Responses API generates customer-facing copy
  -> ai_execution_jobs.result stores the safe generated result
  -> ai_worker_queue(status='pending_approval') receives the draft
  -> manager reviews/edits/approves in AI Workers UI
  -> existing Telegram/email execution flow sends after approval
```

## Enqueue API

`POST /api/ai/execution/enqueue-sales-followup`

Authentication is handled by the AI execution runner auth middleware: a valid user JWT or `x-ai-execution-key` is required.

Minimal body:

```json
{
  "leadId": "...",
  "channel": "telegram"
}
```

The backend normalizes the execution payload to:

```json
{
  "leadId": "...",
  "channel": "telegram",
  "tone": "professional",
  "language": "ru"
}
```

Supported channels:

- `telegram` -> creates `telegram_reply_draft`
- `email` -> creates `email_followup_draft`

## Execution behavior

When the runner sees `job_type='sales_followup_generation'`, it:

1. Loads the lead from `crm_leads`.
2. Best-effort loads recent `lead_timeline_events`.
3. Best-effort loads recent `telegram_messages`.
4. Best-effort loads recent `email_messages`.
5. Builds a compact, sanitized context for the provider prompt.
6. Calls OpenAI with this system prompt:

   ```text
   Ты AI sales assistant. Пиши короткий безопасный follow-up. Не выдумывай факты. Не раскрывай внутренний контекст.
   ```

7. Sanitizes the returned customer message with `sanitizeCustomerMessage(text)`.
8. Stores the final customer-facing text and provider metadata in `ai_execution_jobs.result`.
9. Writes provider usage through the existing OpenAI provider usage path.
10. Writes execution logs through the existing runner lifecycle.
11. Creates one `ai_worker_queue` row with `status='pending_approval'`.

## Approval queue payload

The queue row is created with:

- `action_type='telegram_reply_draft'` for Telegram.
- `action_type='email_followup_draft'` for email.
- `status='pending_approval'`.
- `title='AI Sales follow-up — {lead name}'`.
- `recommendation` as a short manager-safe explanation.
- `payload.customerText` containing only the generated customer message.
- `payload.leadId`.
- `payload.channel`.
- `payload.source='sales_followup_generation'`.
- `payload.executionJobId`.

## Safety contract

AI Sales Worker v1 never sends directly. It only creates approval queue drafts.

Customer-visible text is constrained by the following safeguards:

- Internal context markers are stripped before persistence.
- `customerText` must not contain `Контекст:`, `Плюсы:`, `Итог:`, `ai_score`, `ai_priority`, or `ai_risk_level`.
- `customerText` is capped at 600 characters.
- Empty or still-unsafe output fails the job with a manager-safe error.
- Provider configuration failures also fail safely and do not create send actions.

## Compatibility notes

The implementation reuses the existing autonomous execution primitives: job claiming, worker metrics, execution logs, retry/dead-letter handling, and provider usage persistence. Existing `openai_text_generation`, `internal_test_execution`, AI Workers UI approval handling, CRM, Telegram, and email sending flows remain unchanged.
