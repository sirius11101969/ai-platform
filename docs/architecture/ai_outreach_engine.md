# AS6 AI CRM — Automatic AI Outreach Engine

## Purpose

The Automatic AI Outreach Engine extends the AI lead qualification pipeline so that qualified leads receive ready-to-review personalized outreach drafts without bypassing human approval.

Pipeline:

```text
Lead created
→ AI qualification
→ AI score / temperature
→ outreach generation
→ approval queue
→ follow-up execution
```

## Trigger and priority logic

After `lead_ai_scores` is written, the engine evaluates the latest score and temperature:

| Lead priority | Condition | Generation behavior |
| --- | --- | --- |
| Hot | `score >= 70` or `temperature = hot` | Generate all outreach types immediately. |
| Warm | `temperature = warm` | Generate only `first_contact`. |
| Cold | `temperature = cold` | Create a CRM recommendation follow-up job only; no Telegram/email send drafts. |

## Outreach types

For hot leads the engine generates:

- `first_contact`
- `followup_24h`
- `followup_3d`
- `meeting_request`
- `demo_offer`

Each outreach type produces:

- a `telegram_draft` approval item;
- an `email_draft` approval item;
- an `ai_followup_jobs` row with `status = suggested`, `suggested_channel`, and `generated_message`.

## Personalization inputs

Drafts are deterministic fallback AI copy generated from CRM intelligence context:

- lead name;
- company;
- source (`landing`, `telegram`, manual CRM, etc.);
- original message / CRM notes / first Telegram message;
- detected intent from `intent_summary` or `ai_summary`;
- recommended channel;
- AI score and temperature.

Telegram drafts are short, human Russian messages without spam tone. Email drafts include:

- subject;
- body;
- CTA;
- optional demo proposal for `meeting_request` and `demo_offer`.

## Approval queue integration

Generated sendable drafts are stored in `ai_worker_queue`:

```text
action_type = telegram_draft | email_draft
status = pending_approval
payload.source = ai_outreach_engine
payload.outreachType = first_contact | followup_24h | followup_3d | meeting_request | demo_offer
```

The existing AI approval queue aliases map:

- `telegram_draft` → `telegram_followup`
- `email_draft` → `email_followup`

So approved queue items can be executed through the current Telegram and email execution services.

## Duplicate prevention

The engine prevents duplicate drafts by checking for an existing item with the same:

- workspace;
- lead;
- `action_type` (`telegram_draft` or `email_draft`);
- `payload.outreachType`;
- `created_at > now() - 24 hours`;
- active status (`pending_approval`, `approved`, `executing`, `completed`).

Follow-up jobs use the same 24-hour window with `rule_type = ai_outreach_<outreachType>`.

## CRM lead modal integration

Lead cards expose the generated outreach in three places:

- **Telegram tab · AI outreach drafts** — shows pending Telegram draft text and approval status.
- **Email client section** — shows email subject, body, CTA, demo proposal, and approval status.
- **AI recommendations section** — shows outreach readiness alongside score, recommended CTA, and objections.

The side AI follow-up panel also lists generated outreach drafts together with follow-up jobs and older AI follow-up sequences.

## Dashboard metrics

CRM stats include outreach-specific metrics for the dashboard:

- `outreachGeneratedToday` — Telegram/email draft items generated today.
- `outreachPendingApprovals` — generated drafts still waiting for human approval.
- `aiResponseReadiness` — percentage of leads with pending generated AI responses.

## Operational verification

Recommended manual verification flow:

1. Create a hot lead with a company, Telegram or email contact, and a message mentioning AI CRM / sales automation / demo.
2. Confirm AI qualification writes a `lead_ai_scores` row with `score >= 70` or `temperature = hot`.
3. Confirm `ai_worker_queue` contains `telegram_draft` and `email_draft` rows with `status = pending_approval`.
4. Confirm `ai_followup_jobs` contains suggested jobs with generated messages.
5. Open the CRM lead modal and verify Telegram drafts, Email drafts, and AI recommendations are visible.
6. Approve a queue item and execute it through the existing approval queue flow.

## Deployment

```bash
cd /var/www/ai-platform
git pull
docker compose up -d --build
```
