# Autonomous Redis-Backed AI Execution Loop

## Purpose

The autonomous execution loop turns the production AI execution runner from a manual `POST /api/ai/execution/run-once` process into a continuously running backend worker loop. PostgreSQL remains the source of truth for job state, execution logs, provider usage, worker rows, metrics, and dead letters. Redis is used only as a coordination and liveness layer.

## Architecture

```text
HTTP/API backend startup
  ├─ starts Express server
  ├─ registers worker_nodes row
  ├─ connects to Redis if available
  └─ starts autonomousExecutionLoop
        ├─ writes worker heartbeat to Redis + PostgreSQL
        ├─ recovers timed-out running jobs
        ├─ claims queued/retrying jobs with PostgreSQL SKIP LOCKED
        ├─ dispatches up to AI_EXECUTION_MAX_PARALLEL jobs
        ├─ calls existing aiExecutionRunnerService execution path
        └─ records execution_logs, ai_provider_usage, worker_metrics, and dead_letter_queue rows
```

The loop lives in `backend/src/services/execution/autonomousExecutionLoop.js` and reuses the existing execution runner service. Compatibility is preserved for:

- `POST /api/ai/execution/run-once`
- `POST /api/ai/execution/enqueue-test`
- `POST /api/ai/execution/enqueue-openai-test`
- OpenAI execution and provider usage persistence
- the `x-ai-execution-key` / JWT execution admin middleware
- CRM and other `/api` routes

## Redis role

Redis does not own job state. Its responsibilities are intentionally limited to:

1. **Distributed execution lock** — short-lived `SET NX PX` locks gate recovery and dispatch polling across backend replicas.
2. **Heartbeat cache** — each worker writes a TTL heartbeat payload so operators can detect fast liveness without querying large job tables.
3. **Worker coordination** — Redis lock contention reduces duplicate polling pressure when multiple backend containers are online.

If Redis is unavailable or the `ioredis` client cannot be loaded, the loop logs a warning and continues in degraded PostgreSQL-only mode. PostgreSQL `FOR UPDATE SKIP LOCKED` still provides correctness for job claiming.

## Configuration

Recommended production values are defined in Docker Compose and `.env.example`:

```env
REDIS_URL=redis://redis:6379
AI_EXECUTION_POLL_INTERVAL_MS=2000
AI_EXECUTION_MAX_PARALLEL=4
AI_EXECUTION_ENABLE_BACKGROUND_LOOP=true
```

Docker Compose runs `redis:7-alpine` on the internal Docker network only, with durable state in the `redis_data` volume.

## Concurrency model

The loop enforces concurrency at two layers:

1. **Local process limit**: `AI_EXECUTION_MAX_PARALLEL` caps the number of jobs dispatched by a single backend process.
2. **Database ownership**: `claimNextJob()` uses PostgreSQL row locks and stores `locked_by`, `locked_at`, `heartbeat_at`, and `timeout_at` on `ai_execution_jobs`.

Job ordering remains priority-based:

```sql
ORDER BY priority ASC, run_after ASC, created_at ASC
```

Only jobs in `queued` or `retrying` status with `run_after <= NOW()` are claimable. Running jobs are owned by a `worker_nodes.id` until completion, failure, cancellation, or timeout recovery.

## Recovery model

`recoverStuckJobs()` handles jobs that are still `running` after `timeout_at` expires:

1. Locks expired running rows with `FOR UPDATE SKIP LOCKED`.
2. Increments `attempt_count` as a recovery attempt marker.
3. Clears `locked_by`, `locked_at`, and `timeout_at`.
4. Moves the job to:
   - `retrying` when attempts remain, with a future `run_after` delay.
   - `dead_lettered` when `max_attempts` is exhausted.
5. Decrements the previous worker's `current_concurrency` defensively.
6. Writes `execution_logs`, `worker_metrics`, and `dead_letter_queue` rows where applicable.

Normal runtime failures continue to use the existing runner failure path: retryable errors become `retrying`, non-retryable configuration errors become `failed`, and exhausted attempts become `dead_lettered`.

## Metrics and live status

`GET /api/ai/execution/live-status` returns:

- workers online
- active/running jobs
- queued jobs
- retrying jobs
- unresolved dead letter count
- Redis connected/disconnected state
- execution throughput
- `worker_metrics` summary:
  - `jobs_completed`
  - `jobs_failed`
  - `avg_latency_ms`
  - `queue_depth`
  - `retry_rate`

The endpoint is protected by the existing execution runner auth middleware.

## Scaling strategy

The first production scaling model is simple horizontal backend replication:

1. Run multiple backend containers with the same `REDIS_URL` and `DATABASE_URL`.
2. Keep PostgreSQL as the source of truth.
3. Let Redis locks reduce duplicate poll pressure.
4. Let PostgreSQL row locks guarantee that only one worker owns a job.
5. Tune `AI_EXECUTION_MAX_PARALLEL` per container based on CPU, provider latency, and rate limits.

Suggested operational limits:

- Start with `AI_EXECUTION_MAX_PARALLEL=4` per backend container.
- Increase gradually while monitoring OpenAI/provider latency, retry rate, and database connection pressure.
- Keep job timeout long enough for provider calls but short enough to recover crashed workers.

## Distributed workers roadmap

Future worker isolation can split the loop out of the API container:

1. Add a dedicated `execution-worker` service using the same codebase and environment.
2. Disable background execution in API containers with `AI_EXECUTION_ENABLE_BACKGROUND_LOOP=false`.
3. Assign queue-specific workers using `AI_EXECUTION_QUEUE_NAME`.
4. Add worker drain mode to stop claiming new jobs before deployments.
5. Add per-provider and per-workspace concurrency quotas.
6. Add Redis Streams or PostgreSQL notifications as a wake-up optimization while keeping PostgreSQL as the state authority.

## Future Temporal / LangGraph integration

The current loop intentionally stays small and production-compatible. Temporal or LangGraph can be introduced later for higher-order orchestration:

- **Temporal** can own long-running durable workflows, timers, signals, and human-in-the-loop steps.
- **LangGraph** can own agent state machines, multi-agent routing, and graph-based AI planning.
- The existing `ai_execution_jobs` table can remain the execution substrate for concrete provider/tool calls.
- Redis can continue to serve as a fast coordination/cache layer or be replaced by the orchestration engine's native worker coordination.

A safe migration path is to wrap each Temporal activity or LangGraph node around the existing enqueue/claim/execute abstractions instead of rewriting OpenAI execution, provider usage, or execution logs.
