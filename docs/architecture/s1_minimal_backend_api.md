# S1 Minimal Backend API

## Purpose

This document defines the Sprint 1 backend API contract for the CRM MVP.

Sprint 1 goal:

Landing Lead Capture → Lead Stored → Lead Visible in CRM → Manager Processes Lead

---

## Tech Assumptions

* Backend: FastAPI or NestJS
* Database: PostgreSQL
* Auth: JWT
* Architecture: Modular monolith
* Workspace/multitenancy: not implemented in Sprint 1
* Billing, AI agents, proposals, booking: out of scope for Sprint 1

---

## Core Modules

core/
auth/
users/
leads/
lead_stages/
lead_notes/
activity_log/
health/

---

## Auth

### POST /auth/login

Login user and return JWT.

Request:

```json
{
  "email": "manager@example.com",
  "password": "password"
}
```

Response:

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "manager@example.com",
    "name": "Manager",
    "role": "manager"
  }
}
```

---

### GET /auth/me

Returns current authenticated user.

---

## Health

### GET /health

Response:

```json
{
  "status": "ok"
}
```

---

## Lead Stages

### GET /lead-stages

Returns CRM pipeline stages ordered by position.

---

## Leads

### POST /leads

Creates new lead.

Validation:

* full_name required
* phone or email required
* source default = landing
* stage_id default = first stage

---

### GET /leads

Returns paginated leads list.

Query params:

* stage_id
* assigned_manager_id
* status
* source
* search
* limit
* offset
* sort

---

### GET /leads/{lead_id}

Returns lead details.

---

### PATCH /leads/{lead_id}

Updates editable lead fields.

---

### PATCH /leads/{lead_id}/stage

Moves lead to another stage.

---

### PATCH /leads/{lead_id}/assign

Assigns lead to manager.

---

## Lead Notes

### GET /leads/{lead_id}/notes

Returns lead notes.

---

### POST /leads/{lead_id}/notes

Adds note to lead.

Validation:

* note required
* max 5000 chars

---

## Activity Log

### GET /leads/{lead_id}/activity

Returns lead activity timeline.

---

## Roles / Permissions MVP

admin:

* full access

manager:

* view leads
* create/update leads
* move stages
* assign leads
* add notes

viewer:

* read-only access

---

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "phone or email is required",
    "details": {}
  }
}
```

---

## Activity Event Types

* lead_created
* lead_updated
* lead_stage_changed
* lead_assigned
* lead_note_added

---

## Acceptance Criteria

1. Landing can create a lead via POST /leads
2. CRM can list leads grouped by stage
3. CRM can open lead details
4. Manager can update lead stage
5. Manager can assign lead
6. Manager can add notes
7. Activity timeline records important changes
8. Auth protects CRM endpoints
9. Public lead creation is allowed safely
10. API responses are consistent and documented
