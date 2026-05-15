# Codex Task: Backend Auth + Database Foundation v1

## Goal
Build the first real backend architecture for AI Bot Platform.

## Stack
- Node.js backend
- PostgreSQL
- Docker Compose
- React frontend already exists

## Requirements

### Backend
Create production-ready structure:
- backend/src/routes
- backend/src/controllers
- backend/src/services
- backend/src/middleware
- backend/src/db
- backend/src/models

### Features
Implement:
- signup API
- login API
- JWT auth
- protected API middleware
- user profile endpoint

### Database
Create PostgreSQL schema:
- users
- subscriptions
- credits_ledger
- ai_tasks
- crm_leads
- crm_notes

### User model
Fields:
- id
- email
- password_hash
- credits
- plan
- created_at

### Auth
- bcrypt password hashing
- JWT tokens
- auth middleware
- protected dashboard endpoints

### Frontend
Connect login/signup pages to backend API.

### Docker
Keep docker-compose compatibility.

### Important
- Production-ready code
- Environment variables
- Keep current UI
- Preserve current routes
- Verify npm build
- Verify backend starts correctly

## Output
Create PR with all changes.
