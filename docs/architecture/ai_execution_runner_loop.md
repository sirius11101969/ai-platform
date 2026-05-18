# AI Execution Runner Loop

## Purpose

The AI execution runner moves enterprise execution jobs out of manual SQL smoke testing and into backend-owned production code. It provides a durable API-driven runner loop for jobs stored in `ai_execution_jobs`, with worker registration, atomic queue claiming, structured logs, metrics, and retry/dead-letter recovery.

## Backend entry points

The runner is exposed under `/api/ai/execution`:

```bash
curl -k https://www.as6.ru/api/ai/execution/health
curl -k -X POST https://www.as6.ru/api/ai/execution/enqueue-test
curl -k -X POST https://www.as6.ru/api/ai/execution/run-once
```

Optional request body/query parameters:

- `queueName` / `queue_name` — defaults to `ai-execution`.
- `priority` on `enqueue-test` — lower values run first; defaults to `100`.
- `payload` on `enqueue-test` — JSON payload persisted on the job.
- `idempotencyKey` / `idempotency_key` on `enqueue-test` — optional dedupe key for safe clients.

## Worker registration

Each endpoint registers or refreshes a `worker_nodes` row before runner work:

- `node_name`: `process.env.AI_WORKER_NODE_NAME || os.hostname()`
- `node_type`: `general`
- `status`: `online`
- `queues`: `['default', 'priority', 'ai-execution']`
- `max_concurrency`: `process.env.AI_MAX_CONCURRENT_JOBS || 4`

Registration updates `heartbeat_at`, clears `stopped_at`, and writes the required backend log line:

```text
[ai-execution-runner] worker registered
```

## Claiming algorithm

`run-once` calls the runner service to claim exactly one job for the requested queue. Claiming is performed inside a PostgreSQL transaction and uses row-level locking to stay safe under concurrent callers:

```sql
SELECT id
  FROM ai_execution_jobs
 WHERE queue_name = $1
   AND status IN ('queued', 'retrying')
   AND run_after <= NOW()
 ORDER BY priority ASC, run_after ASC, created_at ASC
 FOR UPDATE SKIP LOCKED
 LIMIT 1
```

The claimed row is updated atomically to:

- `status = 'running'`
- `locked_by = worker_nodes.id`
- `locked_at = NOW()`
- `heartbeat_at = NOW()`
- `timeout_at = NOW() + AI_EXECUTION_JOB_TIMEOUT_SECONDS` (default `300` seconds)
- `attempt_count = attempt_count + 1`

The worker row is locked during the same transaction so `current_concurrency` never exceeds `max_concurrency` for that node.

## Execution behavior

The first production job type is `internal_test_execution`. It completes without calling an external AI provider and writes deterministic result JSON containing:

- `ok`
- `jobId`
- `jobType`
- `queueName`
- `attempt`
- `payload`
- `completedAt`

Completion updates the job to `completed`, clears timeout/error state, stores the result JSON, writes `execution_logs`, writes `worker_metrics`, optionally writes `task_execution_history` when a job has `task_id`, decrements worker concurrency, and logs:

```text
[ai-execution-runner] job completed
```

## Failure and recovery

If execution throws, the runner only updates rows it still owns (`status = 'running'` and `locked_by = worker.id`) to preserve idempotency.

Failure recovery rules:

1. Retryable failure with remaining attempts → `status = 'retrying'`, `run_after` is moved forward using exponential backoff capped at 300 seconds.
2. Retryable failure with exhausted attempts → `status = 'dead_lettered'` and a `dead_letter_queue` row is inserted.
3. Non-retryable failure, such as an unsupported `job_type` → `status = 'failed'`.

Every failure path writes `execution_logs`, `worker_metrics`, optional `task_execution_history`, decrements worker concurrency, and logs:

```text
[ai-execution-runner] job failed
```

## Health behavior

`GET /api/ai/execution/health` returns:

- refreshed `worker` node row
- job counts grouped by status (`queued`, `retrying`, `running`, `completed`, `failed`, `cancelled`, `dead_lettered`)
- optional queue filter when `queueName` / `queue_name` is supplied

## Operational notes

- Lower numeric priority values execute first.
- `run_after` supports delayed jobs and retry backoff.
- The runner is safe for concurrent calls because claim selection uses `FOR UPDATE SKIP LOCKED` and completion/failure updates verify job ownership.
- The endpoint currently runs one job per request. A daemon loop can later call the same service repeatedly without changing the claim/execute/recover semantics.
