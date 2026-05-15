# Codex Task: Auth + Dashboard + CRM v1

## Goal
Add a production-ready first version of:
- signup/login UI
- protected dashboard UI
- CRM page UI
- credits overview
- AI tasks overview

## Current project
React + Vite frontend, Node backend, Docker Compose.

## Requirements
- Do not break the current landing.
- Keep landing at `/`.
- Add routes:
  - `/signup`
  - `/login`
  - `/dashboard`
  - `/crm`
- Use React only. If routing library is missing, add React Router.
- Create clean reusable components.
- Russian UI copy.
- Premium dark SaaS style consistent with the landing.
- Mock auth is acceptable for v1, but structure should be ready for real backend auth later.
- Dashboard should show:
  - user profile block
  - credits balance
  - AI tasks
  - orders/subscription block
  - quick actions
- CRM should show:
  - leads pipeline
  - stages
  - lead cards
  - notes/activity preview
  - AI follow-up suggestions
- Ensure `npm run build` works.
- Keep Docker compatibility.

## Output
Commit changes to a branch and create a PR.
