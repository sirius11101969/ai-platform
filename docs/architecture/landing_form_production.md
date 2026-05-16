# Landing lead form production flow

## Purpose

The public landing form captures real visitor demand and turns it into a CRM lead without exposing internal system details to the browser. The production path is:

1. Visitor submits the Russian landing form.
2. `POST /api/public/leads` validates, normalizes, and spam-checks the payload.
3. A `crm_leads` record is created with `source = 'landing'` and the original message stored in `notes` plus metadata.
4. Existing AI qualification paths are preserved: `ai_agent_actions`, SDR qualification queue, lead prioritization, and outreach drafts remain queued for the new lead.
5. Manager notification is sent through Telegram when `TELEGRAM_MANAGER_CHAT_ID` is configured; otherwise email is attempted when SMTP/admin configuration is available.
6. The dashboard exposes landing-lead production counters for daily volume, hot landing leads, and pending website leads.

## Frontend UX

The landing form includes:

- name
- email
- phone
- telegram
- company
- message
- submit button
- hidden honeypot field named `website`

Russian user-facing states:

- CTA: `Получить демо`
- Submit: `Оставить заявку`
- Success: `Заявка отправлена. Мы скоро свяжемся с вами.`
- Error: `Не удалось отправить заявку. Попробуйте ещё раз.`

The browser never renders backend exception details. Any non-2xx response is mapped to the generic Russian error message.

## Backend validation and anti-spam

`POST /api/public/leads` uses layered protection:

- honeypot rejection for bot-filled hidden fields (`website`, `url`, `homepage`, `company_site`, `honeypot`)
- IP rate limiting in the public route, controlled by:
  - `PUBLIC_LEADS_RATE_LIMIT_WINDOW_MS` (default: 15 minutes)
  - `PUBLIC_LEADS_RATE_LIMIT_MAX` (default: 10)
- required `name`, `email`, and `message`
- email lowercasing and RFC-like format validation
- phone normalization to a compact international-style value (`+<digits>`)
- Telegram normalization to lowercase `@username` from raw handles or `t.me/username` links
- repeated-submission rejection for recent landing leads in the same workspace using email, phone, Telegram, or same IP + same message within 30 minutes

Controllers return only safe public errors:

- `429` -> `Too many requests`
- other validation/server failures -> `Unable to submit lead`

## CRM link

Manager notifications use this CRM deep link format:

```text
https://www.as6.ru/crm?leadId=<lead_id>
```

The link is included as `CRM link` in the notification body.

## Manager notifications

Notification body starts with:

```text
Новая заявка с сайта
```

It includes:

- name
- company
- phone
- email
- telegram
- message
- AI score (`в очереди` immediately after capture, before asynchronous AI scoring completes)
- recommended next step
- CRM link

Delivery order:

1. Telegram if `TELEGRAM_MANAGER_CHAT_ID` and `TELEGRAM_BOT_TOKEN` are present.
2. Email fallback if no manager chat id exists and SMTP/admin configuration is present.

Email fallback recipient resolution:

1. `ADMIN_EMAIL`
2. `SMTP_ADMIN_EMAIL`
3. `EMAIL_ADMIN`
4. `SMTP_FROM`
5. `EMAIL_FROM`
6. `GMAIL_FROM`

SMTP/Gmail delivery still requires host/user/password configuration used by the existing email service.

## AI queue preservation

The lead creation flow still creates:

- `ai_agent_actions` with `task_type = 'analyze_lead'`
- SDR qualification queue item via `createQualificationQueueItem`
- asynchronous `scheduleLeadQualification`
- asynchronous `schedulePublicLeadAnalysis`

This preserves AI qualification, lead prioritization, and outreach draft generation for landing leads.

## Dashboard counters

CRM stats expose:

- `landingLeadsToday` — landing leads created today
- `hotLandingLeads` — landing leads whose latest AI score is `>= 75` or temperature is `hot`
- `pendingWebsiteLeads` — landing leads still in `new` status

The dashboard renders those values as production monitoring cards.
