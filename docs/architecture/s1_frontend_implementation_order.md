# S1 Frontend Implementation Order

## Purpose

This document defines the recommended build order for Sprint 1 frontend implementation.

Goal:

Landing Lead Capture → Lead Stored → Lead Visible in CRM → Manager Processes Lead

---

## Sprint 1 Frontend Scope

In scope:

- Landing form integration
- CRM login screen
- CRM authenticated layout
- Leads list / Kanban view
- Lead detail panel
- Stage update UI
- Manager assignment UI
- Lead notes UI
- Activity timeline UI
- API client layer
- Basic loading/error states

Out of scope:

- AI generation UI
- Billing UI
- Credits UI
- Telegram bot UI
- Voice agent UI
- Proposal builder
- Calendar booking UI
- Advanced analytics dashboard
- Multi-workspace UI
- Advanced admin panel

---

## Build Order

### Step 1 — Frontend Project Baseline

Implement and verify:

- app structure
- routing
- environment variables
- API base URL config
- shared layout
- shared UI components

Acceptance criteria:

- Frontend starts locally
- Routes load correctly
- API base URL can be configured via env

---

### Step 2 — API Client Layer

Create frontend API client for:

- auth
- leads
- lead stages
- notes
- activity

Acceptance criteria:

- API client has typed request/response contracts
- Handles auth token
- Handles API errors consistently
- No direct fetch calls scattered across UI

---

### Step 3 — Auth UI

Implement:

- login page
- token storage
- protected routes
- logout
- current user loading

Routes:

- /login
- /crm

Acceptance criteria:

- User can log in
- Invalid login shows error
- CRM routes require auth
- Logout clears token

---

### Step 4 — CRM Shell Layout

Implement CRM layout:

- sidebar / topbar
- user info
- navigation
- main content area

Acceptance criteria:

- CRM layout loads after auth
- User sees authenticated shell
- Layout works on desktop and tablet

---

### Step 5 — Lead Stages Loading

Implement:

- fetch lead stages
- display pipeline columns
- empty states

Acceptance criteria:

- Stages load from GET /lead-stages
- Stages are ordered by position
- Empty stages show clean placeholder

---

### Step 6 — Leads List / Kanban View

Implement:

- fetch leads
- group leads by stage
- search/filter UI
- loading state
- empty state

Acceptance criteria:

- CRM displays leads from GET /leads
- Leads grouped by stage
- Search works
- Empty CRM state is understandable

---

### Step 7 — Landing Form Integration

Implement public lead capture:

- landing form fields
- validation
- POST /public/leads integration
- success state
- error state

Required fields:

- full_name
- phone or email

Optional fields:

- service_type
- location
- message

Acceptance criteria:

- Visitor can submit form without auth
- Lead is created in database
- Lead appears in CRM
- Duplicate/error response is handled gracefully

---

### Step 8 — Lead Detail Panel

Implement lead detail drawer or page:

- lead basic info
- contact info
- service type
- location
- message
- stage
- assigned manager
- timestamps

Acceptance criteria:

- Clicking lead opens detail view
- Lead details load from GET /leads/{lead_id}
- Missing fields display cleanly

---

### Step 9 — Stage Update UI

Implement:

- stage dropdown or drag/move action
- PATCH /leads/{lead_id}/stage
- optimistic or reload update
- error rollback

Acceptance criteria:

- Manager can move lead to another stage
- UI updates after successful request
- Error does not leave UI in inconsistent state

---

### Step 10 — Manager Assignment UI

Implement:

- assign manager control
- PATCH /leads/{lead_id}/assign

Acceptance criteria:

- Manager can assign/reassign lead
- Assigned manager displayed in lead card/details
- Errors handled clearly

---

### Step 11 — Lead Notes UI

Implement:

- notes list
- add note form
- POST /leads/{lead_id}/notes
- GET /leads/{lead_id}/notes

Acceptance criteria:

- Manager can add note
- Notes appear immediately after submit
- Empty notes state is clear
- Validation prevents empty note

---

### Step 12 — Activity Timeline UI

Implement:

- GET /leads/{lead_id}/activity
- timeline display
- event type labels
- timestamps

Acceptance criteria:

- Activity timeline displays lead events
- New events appear after mutations
- Unknown event types display safely

---

### Step 13 — Error / Loading / Empty States

Standardize UX for:

- loading
- empty data
- validation errors
- API errors
- unauthorized state

Acceptance criteria:

- No blank broken screens
- API errors show user-friendly messages
- Auth expiration redirects to login

---

### Step 14 — End-to-End QA

Test full Sprint 1 frontend flow:

Landing form  
→ POST /public/leads  
→ CRM login  
→ CRM leads view  
→ Open lead  
→ Move stage  
→ Assign manager  
→ Add note  
→ View activity timeline

Acceptance criteria:

- Full flow works without manual DB edits
- Frontend matches backend API contract
- Basic mobile/tablet layout does not break
- No critical console errors

---

## Recommended Implementation Sequence

1. Frontend baseline
2. API client
3. Auth UI
4. CRM shell
5. Lead stages loading
6. Leads list / Kanban
7. Landing form integration
8. Lead detail panel
9. Stage update UI
10. Assignment UI
11. Notes UI
12. Activity timeline UI
13. Error/loading states
14. End-to-end QA

---

## Do Not Build Yet

Avoid implementing these in Sprint 1:

- AI generation interface
- billing dashboard
- credits balance UI
- proposal builder
- calendar booking
- voice agent console
- Telegram management UI
- advanced analytics cockpit
- multi-workspace switcher
- advanced admin panel

---

## Definition of Done

Sprint 1 frontend is complete when:

1. Landing form can create a lead
2. CRM login works
3. Protected CRM routes work
4. CRM displays leads from backend
5. Leads are grouped by stage
6. Manager can open lead details
7. Manager can update stage
8. Manager can assign lead
9. Manager can add notes
10. Activity timeline shows lead events
11. Loading/error/empty states are handled
12. Full landing-to-CRM flow works end-to-end
