# S1 Backend Implementation Order

## Purpose

This document defines the recommended build order for Sprint 1 backend implementation.

Goal:

Landing Lead Capture → Lead Stored → Lead Visible in CRM → Manager Processes Lead

---

## Sprint 1 Backend Scope

In scope:

* PostgreSQL CRM schema
* Default lead stages seed
* Minimal auth
* Leads API
* Lead stages API
* Lead notes API
* Activity log API
* Basic validation
* Basic error format
* Backend health endpoint

Out of scope:

* Billing
* Credits
* AI generation
* Telegram bot
* Voice agent
* Proposal automation
* Calendar booking
* Multi-workspace tenancy
* Temporal / LangGraph
* Advanced analytics

---

## Build Order

### Step 1 — Database Baseline

Implement and verify:

* 001_sprint1_crm_mvp_schema.sql
* 001_default_lead_stages.sql

Acceptance criteria:

* Database migrates cleanly
* Tables are created
* Default lead stages exist
* Foreign keys work
* updated_at trigger works

---

### Step 2 — Backend Project Scaffold

Create backend foundation:

* app entrypoint
* config module
* database connection
* environment variables
* error handler
* health route

Suggested modules:

* core/
* auth/
* users/
* leads/
* lead_stages/
* lead_notes/
* activity_log/
* health/

Acceptance criteria:

* Backend starts locally
* GET /health returns status ok
* DB connection works

---

### Step 3 — Repository Layer

Implement DB access layer:

* UserRepository
* LeadRepository
* LeadStageRepository
* LeadNoteRepository
* ActivityLogRepository

Acceptance criteria:

* CRUD methods work
* Queries are parameterized / ORM-safe
* Pagination supported for leads
* Stage ordering supported

---

### Step 4 — Service Layer

Implement business logic:

* LeadService
* LeadStageService
* LeadNoteService
* ActivityLogService
* AuthService

Acceptance criteria:

* Lead creation assigns default stage
* Lead mutations create activity log entries
* Stage changes validate target stage
* Notes validate length
* Assign manager validates user role

---

### Step 5 — Auth MVP

Implement minimal auth:

* password hashing
* login
* JWT creation
* current user endpoint
* role extraction

Endpoints:

* POST /auth/login
* GET /auth/me

Acceptance criteria:

* User can log in
* Invalid password rejected
* Protected routes require JWT
* User role available in request context

---

### Step 6 — Lead Stages API

Implement:

* GET /lead-stages

Acceptance criteria:

* Returns stages ordered by position
* Requires auth
* Used by CRM Kanban

---

### Step 7 — Public Lead Capture API

Implement:

* POST /public/leads

Purpose:

Landing form lead capture.

Validation:

* full_name required
* phone or email required
* source default = landing
* status default = active
* default stage = first stage by position

Protection:

* basic rate limit
* duplicate detection by phone/email
* no auth required

Acceptance criteria:

* Landing can submit lead
* Lead appears in CRM
* Duplicate submissions do not create uncontrolled spam
* Activity log entry lead_created is created

---

### Step 8 — CRM Leads API

Implement:

* GET /leads
* GET /leads/{lead_id}
* PATCH /leads/{lead_id}
* PATCH /leads/{lead_id}/stage
* PATCH /leads/{lead_id}/assign

Acceptance criteria:

* CRM can list leads
* CRM can open lead details
* Manager can update lead
* Manager can move lead stage
* Manager can assign lead
* Every mutation creates activity log entry

---

### Step 9 — Lead Notes API

Implement:

* GET /leads/{lead_id}/notes
* POST /leads/{lead_id}/notes

Acceptance criteria:

* Manager can add note
* Notes are linked to lead
* Note author is stored
* Activity log entry lead_note_added is created

---

### Step 10 — Activity Timeline API

Implement:

* GET /leads/{lead_id}/activity

Acceptance criteria:

* CRM can display lead timeline
* Events sorted by newest first
* Payload JSON is returned safely

---

### Step 11 — Error Handling / Validation

Standardize error format:

{
"error": {
"code": "VALIDATION_ERROR",
"message": "phone or email is required",
"details": {}
}
}

Required codes:

* VALIDATION_ERROR
* UNAUTHORIZED
* FORBIDDEN
* NOT_FOUND
* CONFLICT
* INTERNAL_ERROR

Acceptance criteria:

* API errors are consistent
* Raw DB errors are never exposed
* Validation errors are human-readable

---

### Step 12 — Integration QA

Test end-to-end flow:

Landing form
→ POST /public/leads
→ DB lead created
→ CRM GET /leads
→ CRM updates stage
→ CRM adds note
→ Activity timeline updated

Acceptance criteria:

* Full Sprint 1 flow works
* No manual DB edits required
* API contract matches documentation

---

## Recommended Implementation Sequence

1. DB migration + seed
2. Backend scaffold
3. DB repositories
4. Services
5. Auth
6. Lead stages API
7. Public lead capture API
8. CRM leads API
9. Notes API
10. Activity API
11. Error handling
12. End-to-end QA

---

## Do Not Build Yet

Avoid implementing these in Sprint 1:

* credits ledger
* billing webhooks
* AI generation jobs
* provider COGS
* Telegram bot
* voice agent
* proposal automation
* calendar booking
* multi-tenant workspaces
* advanced RBAC
* background queues
* Temporal / LangGraph

---

## Definition of Done

Sprint 1 backend is complete when:

1. Database schema and seeds apply cleanly
2. Backend starts locally
3. Health endpoint works
4. Auth works
5. Landing can create a lead
6. CRM can list and open leads
7. Manager can update lead stage
8. Manager can assign lead
9. Manager can add notes
10. Activity timeline records important lead events
11. API errors follow standard format
12. All endpoints are documented
