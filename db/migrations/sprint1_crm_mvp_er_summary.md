# Sprint 1 CRM MVP ER Summary

This schema supports the first paid-pilot path:

`landing form -> lead saved -> lead appears in CRM -> manager notified -> notes/activity tracked`

## Tables

| Table | Purpose |
|---|---|
| `users` | Internal users: owners, managers, operators, admins. |
| `lead_stages` | Kanban pipeline stages for CRM leads. |
| `leads` | Captured leads from landing, Telegram, or manual entry. |
| `lead_notes` | Manager/operator notes attached to a lead. |
| `activity_log` | Structured lead activity events with JSONB payloads. |

## Relationships

```mermaid
erDiagram
  users ||--o{ leads : "assigned_manager_id"
  users ||--o{ lead_notes : "author_user_id"
  users ||--o{ activity_log : "actor_user_id"
  lead_stages ||--o{ leads : "stage_id"
  leads ||--o{ lead_notes : "lead_id"
  leads ||--o{ activity_log : "lead_id"

  users {
    uuid id PK
    text email
    text full_name
    text role
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  lead_stages {
    uuid id PK
    text name
    integer position
    boolean is_terminal
    timestamptz created_at
    timestamptz updated_at
  }

  leads {
    uuid id PK
    uuid stage_id FK
    uuid assigned_manager_id FK
    text customer_name
    text phone
    text email
    text company_name
    text service_type
    text source
    text message
    timestamptz created_at
    timestamptz updated_at
  }

  lead_notes {
    uuid id PK
    uuid lead_id FK
    uuid author_user_id FK
    text note
    timestamptz created_at
    timestamptz updated_at
  }

  activity_log {
    uuid id PK
    uuid lead_id FK
    uuid actor_user_id FK
    text activity_type
    jsonb payload
    timestamptz created_at
    timestamptz updated_at
  }
```

## Required Indexes

| Index | Purpose |
|---|---|
| `leads_stage_id_idx` | Fast Kanban queries by pipeline stage. |
| `leads_assigned_manager_id_idx` | Fast manager workload views. |
| `lead_notes_lead_id_idx` | Fast lead detail note loading. |
| `activity_log_lead_id_idx` | Fast lead activity timeline loading. |

## Default Pipeline Stages

1. `New`
2. `Qualified`
3. `Proposal Sent`
4. `Booked`
5. `Closed Won`
6. `Closed Lost`
