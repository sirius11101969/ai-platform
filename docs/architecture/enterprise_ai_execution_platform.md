# Enterprise AI Execution Platform Architecture

## 1. High-level architecture

The platform is split into eight production domains:

1. **API layer** — validates user/workspace requests, enforces auth/RBAC/rate limits, creates idempotent execution jobs, and returns task status.
2. **Provider layer** — isolates OpenAI text, OpenAI/Flux images, ElevenLabs voice, and async video providers behind resilient HTTP clients with retries, timeouts, usage accounting, and structured logs.
3. **Queue and worker layer** — PostgreSQL-backed durable jobs with priority, `run_after` scheduling, worker-node heartbeats, cancellation, timeout recovery, retry limits, and dead-lettering.
4. **Billing layer** — transactional credit reservations/captures/refunds with idempotency keys, provider-cost capture, margin analytics, subscription quotas, and overage rows.
5. **Orchestration layer** — workflow state machine for planner/executor agents, tool calls, memory, agent messages, parallel branches, recursive subtasks, and queue-driven continuation.
6. **Storage layer** — durable local artifact storage path that can be mounted to NFS/S3-compatible storage in production; generated image/audio/video metadata is persisted with the artifact.
7. **Observability layer** — execution logs, provider usage, worker metrics, task history, trace/span IDs, queue metrics, latency/failure analytics, and admin dashboard sources.
8. **Security layer** — secret-only environment configuration, audit-ready logs, request validation, webhook verification hooks, and future KMS-backed API-key encryption.

## 2. Final folder structure

Target structure, mapped to the current Node/Express backend in this repository:

```text
backend/app/                    # future FastAPI app boundary if backend is migrated from Express
backend/src/providers/          # OpenAI, images, voice, video, storage, resilient HTTP client
backend/src/services/execution/ # logs, provider usage, credit ledger, execution utilities
workers/                        # external worker entrypoints for horizontally scaled containers
orchestrator/                   # workflow planner/executor state machines
providers/                      # shared provider contracts if extracted from backend
executors/                      # task-specific execution handlers
pipelines/                      # chain/parallel workflow definitions
metrics/                        # metrics exporters and SLO rules
observability/                  # queue and provider dashboards
scheduling/                     # cron/scheduled job producers and stuck-job recovery
security/                       # rate limits, RBAC, webhook verification, API-key crypto
billing/                        # subscription quotas, overages, invoices, cost/margin reports
ai/                             # AI task schemas and policies
memory/                         # durable memory and vector/JSON context storage
agents/                         # planner and executor agent definitions
```

Implemented in this sprint:

- `backend/src/providers/openAiProvider.js`
- `backend/src/providers/imageProvider.js`
- `backend/src/providers/voiceProvider.js`
- `backend/src/providers/videoProvider.js`
- `backend/src/providers/fileStorage.js`
- `backend/src/providers/httpClient.js`
- `backend/src/services/execution/*`
- `db/migrations/022_enterprise_ai_execution_platform.sql`

## 3. DB schema

The new migration creates the production control-plane schema:

- `worker_nodes` — active worker registration, pool capability, concurrency, heartbeat, status.
- `worker_metrics` — time-series queue/worker metrics.
- `execution_logs` — structured execution logs with trace/span IDs and task/workflow references.
- `dead_letter_queue` — terminal failures after retry exhaustion.
- `ai_provider_usage` — provider/model/operation tokens, cost, billable credits, latency, status.
- `task_execution_history` — immutable task state transitions.
- `credit_ledger_entries` — idempotent atomic credit reserve/capture/refund/grant/overage entries.
- `subscription_usage_limits` — monthly quotas and overage tracking.
- `ai_execution_jobs` — durable priority/scheduled/cancellable execution queue.
- `orchestration_workflows` — workflow state, context, trace, parent/child recursion.
- `agent_messages` — agent-to-agent and tool-call messages.
- `agent_memory_items` — durable workflow/agent memory.

PostgreSQL best practices used:

- `UUID` primary keys with `gen_random_uuid()`.
- `CHECK` constraints for finite state machines.
- partial indexes for claimable jobs and stuck running jobs.
- uniqueness on `(workspace_id, idempotency_key)` for double-charge prevention.
- `JSONB` metadata for provider-specific payloads without schema churn.

## 4. Execution flow

```text
Client/API request
  -> request validation + auth + workspace resolution
  -> transactional credit reservation with idempotency key
  -> ai_execution_jobs insert(status=queued, priority, run_after)
  -> worker claims job with SELECT ... FOR UPDATE SKIP LOCKED
  -> worker heartbeat updates worker_nodes and job heartbeat
  -> executor calls provider abstraction
  -> provider writes structured logs + ai_provider_usage
  -> artifact storage persists image/audio/video output
  -> task_execution_history records status transition
  -> billing capture/refund finalizes ledger
  -> API/dashboard reads task, execution_logs, provider_usage, worker_metrics
```

For async video:

```text
submit video job -> persist providerJobId -> reschedule polling job -> poll provider -> persist video artifact -> complete task
```

For orchestration:

```text
workflow queued -> planner agent creates graph -> executor agents run branches -> tools enqueue jobs -> agent_messages record communication -> memory manager writes context -> reducer finalizes workflow
```

## 5. Dependency graph

```text
API routes
  -> billing/credit ledger
  -> ai_execution_jobs
  -> workers/executors
      -> providers/httpClient
      -> providers/OpenAI/Image/Voice/Video
      -> providers/fileStorage
      -> execution_logs
      -> ai_provider_usage
      -> task_execution_history
  -> observability dashboards
      -> worker_nodes
      -> worker_metrics
      -> execution_logs
      -> ai_provider_usage
      -> dead_letter_queue
  -> orchestrator
      -> orchestration_workflows
      -> agent_messages
      -> agent_memory_items
      -> ai_execution_jobs
```

## 6. Critical path

1. Apply schema migration and verify all tables/indexes exist.
2. Replace direct provider calls with provider abstractions.
3. Make every AI execution write `ai_provider_usage` and `execution_logs`.
4. Introduce durable `ai_execution_jobs` claiming with `FOR UPDATE SKIP LOCKED`.
5. Move synchronous task execution out of API process into worker containers.
6. Add credit ledger reservations/refunds around execution jobs.
7. Add orchestration workflows and agent messages.
8. Expose admin observability APIs and dashboard.
9. Harden security: RBAC, rate limits, webhook verification, encrypted tenant provider keys.

## 7. Sprint implementation order

### Sprint 1 — Real AI execution foundation

- OpenAI provider with retries, timeouts, streaming method, structured logs, and usage tracking.
- Image provider for OpenAI Images and Flux-compatible HTTP endpoint with artifact persistence.
- ElevenLabs voice provider with async-safe generation and audio artifact storage.
- Async video provider with submit/status/cancel/poll architecture.
- Provider usage and execution-log database writes.

### Sprint 2 — Durable worker system

- `ai_execution_jobs` claim/retry/dead-letter implementation.
- Worker-node registration and heartbeat.
- Queue recovery for stale `running` jobs.
- cancellation and priority scheduling.

### Sprint 3 — Billing hardening

- Replace legacy credit deduction with `credit_ledger_entries` reservations.
- capture/refund on terminal task states.
- quota and overage calculations from provider usage.

### Sprint 4 — Multi-agent orchestration

- Planner/executor workflow engine.
- graph state transitions.
- agent messages and memory context manager.
- parallel branches and recursive child workflows.

### Sprint 5 — Observability and admin panels

- Queue depth and latency APIs.
- provider analytics, failure analytics, worker health.
- trace timeline per task/workflow.

### Sprint 6 — Security

- rate-limit middleware.
- RBAC policy map.
- encrypted tenant provider secrets.
- webhook signature verification and audit logs.

## Environment variables

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1
OPENAI_TIMEOUT_MS=60000
OPENAI_RETRIES=3
OPENAI_STREAM_TIMEOUT_MS=180000
IMAGE_PROVIDER=openai # or flux
OPENAI_IMAGE_MODEL=gpt-image-1
IMAGE_PROVIDER_TIMEOUT_MS=120000
IMAGE_PROVIDER_RETRIES=2
FLUX_API_KEY=...
FLUX_API_URL=https://provider.example/v1/images
FLUX_MODEL=flux-pro
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
ELEVENLABS_MODEL=eleven_multilingual_v2
ELEVENLABS_TIMEOUT_MS=120000
VIDEO_PROVIDER_API_KEY=...
VIDEO_PROVIDER_SUBMIT_URL=https://provider.example/v1/video/jobs
VIDEO_PROVIDER_STATUS_URL_TEMPLATE=https://provider.example/v1/video/jobs/{jobId}
VIDEO_PROVIDER_CANCEL_URL_TEMPLATE=https://provider.example/v1/video/jobs/{jobId}/cancel
VIDEO_PROVIDER_MODEL=default
VIDEO_PROVIDER_POLL_INTERVAL_MS=10000
VIDEO_PROVIDER_MAX_WAIT_MS=900000
AI_ARTIFACT_STORAGE_ROOT=/var/lib/as6/ai-artifacts
```

## Health checks

- `/health` and `/api/health` remain API liveness checks.
- Worker health is derived from `worker_nodes.status` and `heartbeat_at`.
- Queue health is derived from claimable/running/dead-letter counts in `ai_execution_jobs` and `dead_letter_queue`.
- Provider health is derived from recent `ai_provider_usage.status` and latency percentiles.

## Curl tests

```bash
curl -fsS https://www.as6.ru/api/health
curl -fsS -H "Authorization: Bearer $TOKEN" -H "X-Workspace-Id: $WORKSPACE_ID" https://www.as6.ru/api/ai/tasks
curl -fsS -X POST -H "Authorization: Bearer $TOKEN" -H "X-Workspace-Id: $WORKSPACE_ID" -H 'Content-Type: application/json' \
  -d '{"type":"ai_content_generation","prompt":"Напиши B2B follow-up для enterprise клиента"}' \
  https://www.as6.ru/api/ai/tasks
```

## Deployment commands

```bash
docker compose build backend
docker compose run --rm backend node -e "require('./src/db/schema').migrate().then(()=>process.exit(0)).catch((e)=>{console.error(e);process.exit(1)})"
docker compose up -d backend
curl -fsS https://www.as6.ru/api/health
```
