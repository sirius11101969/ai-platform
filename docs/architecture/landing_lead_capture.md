# Landing Lead Capture Architecture

## Goal

The public landing page now sends real visitor requests directly into AS6 AI CRM through an unauthenticated, hardened endpoint:

```http
POST /api/public/leads
```

The endpoint converts CTA/contact/demo submissions into CRM leads, records timeline context, and queues AI SDR review so the sales team sees new demand immediately.

## Accepted fields

| Field | Description |
| --- | --- |
| `name` | Visitor name. |
| `email` | Visitor email. Must be a valid email if supplied. |
| `phone` | Visitor phone. Basic phone-character validation. |
| `telegram` | Telegram username, with or without `@`. |
| `company` | Company name. |
| `message` | Visitor request or automation context. |
| `source` | Landing form source, stored in metadata. CRM `source` is always `landing`. |
| `page_url` | Landing page URL. Must be HTTP/HTTPS if supplied. |
| `utm_source` | UTM source. |
| `utm_medium` | UTM medium. |
| `utm_campaign` | UTM campaign. |

## Security controls

- The endpoint is mounted under `/api/public` before authenticated CRM routes and does **not** require JWT authentication.
- Basic in-memory IP rate limiting protects `POST /api/public/leads`.
  - `PUBLIC_LEADS_RATE_LIMIT_MAX` defaults to `10` requests.
  - `PUBLIC_LEADS_RATE_LIMIT_WINDOW_MS` defaults to `15 minutes`.
- Submissions must include at least one contact channel (`email`, `phone`, or `telegram`) and at least one intent/context field (`name`, `company`, or `message`).
- Field lengths are bounded and strings are trimmed before persistence.
- Public responses never expose internal stack traces or SQL/OpenAI errors.

## Workspace routing

1. If `PUBLIC_LEADS_WORKSPACE_ID` points to an existing workspace, that workspace receives public leads.
2. Otherwise, the service falls back to the first workspace by creation date.
3. The owner/admin/sales member is assigned as `crm_leads.user_id`; if no member is found, `workspaces.owner_user_id` is used.
4. If no workspace or owner exists, lead creation fails instead of creating an orphan lead.

## CRM writes

For each valid submission the backend creates:

- `crm_leads` row:
  - `source = landing`
  - `status = new`
  - `stage = new`
  - `value = 0`
  - `workspace_id` from routing rules
  - `user_id` owner/admin/sales fallback
  - landing message, page URL, UTM data, IP and user-agent in `metadata`
- `crm_activity` record with type `lead_created_from_landing`.
- `lead_timeline_events` record with type `lead_created_from_landing` and landing metadata.
- Initial `lead_ai_scores` record from local lead-intelligence scoring.

## AI automation

After the database transaction commits:

- A queued `ai_agent_actions` row is created with `task_type = analyze_lead`.
- Background processing is scheduled with `aiAgentModel.processAction(actionId)`.
- An `ai_workers` row for `ai_sdr_agent` is ensured.
- An `ai_worker_queue` approval item is created:
  - title: `Проверить нового лида`
  - status: `pending_approval`
  - action type: `create_reminder`

If OpenAI credentials are unavailable or the AI request fails, the lead remains safely in CRM and the AI action records retry/failure state without breaking the public API response.

## Frontend integration

The landing page includes Russian lead capture forms in the hero/demo CTA flow and final CTA. On success it shows:

> Заявка отправлена. Мы скоро свяжемся с вами.

On failure it shows:

> Не удалось отправить заявку. Попробуйте ещё раз.

The frontend submits to `/api/public/leads` without auth and includes the current `page_url` and UTM parameters.

## Dashboard/CRM visibility

- New landing leads appear in CRM because they are standard `crm_leads` rows in the routed workspace.
- CRM stats include:
  - `landingLeadsToday`
  - `newLeadsCount`
- Dashboard cards surface landing leads today and the current new-leads count.

## Production deployment

After merge:

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
