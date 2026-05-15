# Codex Task: Real CRM Logic v1

## Goal
Implement real CRM backend logic and connect it to the existing CRM UI.

## Current state
Project has:
- React/Vite frontend
- Node.js backend
- PostgreSQL
- JWT auth
- Docker Compose
- CRM UI exists

## Requirements

### Backend API
Implement protected CRM endpoints:
- GET /api/crm/leads
- POST /api/crm/leads
- PATCH /api/crm/leads/:id
- DELETE /api/crm/leads/:id
- POST /api/crm/leads/:id/notes
- GET /api/crm/stats

### Database
Use existing crm_leads and crm_notes tables if present.
If missing, add migrations/schema safely.

### Lead fields
- id
- user_id
- name
- email
- phone
- company
- status
- value
- source
- created_at
- updated_at

### CRM stages
Use statuses:
- new
- qualified
- proposal
- booked
- won
- lost

### Frontend
Connect CRM page to backend:
- load real leads
- create lead form
- update status
- add note
- show stats
- handle loading/error states

### Security
- All CRM endpoints protected by JWT
- Users can only access their own leads

### Important
- Do not break landing
- Do not break auth
- Keep Docker compatibility
- Verify frontend build
- Verify backend starts

## Output
Create PR with all changes.
