# S1 Backend Implementation Order

## Purpose

This document defines the recommended build order for Sprint 1 backend implementation.

Goal:

Landing Lead Capture → Lead Stored → Lead Visible in CRM → Manager Processes Lead

---

## Sprint 1 Backend Scope

In scope:

- PostgreSQL CRM schema
- Default lead stages seed
- Minimal auth
- Leads API
- Lead stages API
- Lead notes API
- Activity log API
- Basic validation
- Basic error format
- Backend health endpoint

Out of scope:

- Billing
- Credits
- AI generation
- Telegram bot
- Voice agent
- Proposal automation
- Calendar booking
- Multi-workspace tenancy
- Temporal / LangGraph
- Advanced analytics

---

## Build Order

### Step 1 — Database Baseline

Implement and verify:

- `001_sprint1_crm_mvp_schema.sql`
- `001_default_lead_stages.sql`

Acceptance criteria:

- Database migrates cleanly
- Tables are created
- Default lead stages exist
- Foreign keys work
- `updated_at` trigger works

---

### Step 2 — Backend Project Scaffold

Create backend foundation:

- app entrypoint
- config module
- database connection
- environment variables
- error handler
- health route

Suggested modules:

```text
core/
auth/
users/
leads/
lead_stages/
lead_notes/
activity_log/
health/
