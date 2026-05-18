# Production AI Execution Runner

## Architecture

The production AI execution runner is the backend worker path for durable AI jobs. API endpoints enqueue work in `ai_execution_jobs`; runner processes register in `worker_nodes`, claim jobs with row-level locking, execute provider calls, persist results, and release worker capacity. The runner currently supports internal smoke-test jobs and OpenAI Responses API text generation jobs.

Core tables:

- `ai_execution_jobs` stores queue, status, payload, attempts, lock ownership, timeout, result, and failure state.
- `worker_nodes` stores runner registration, supported queues, heartbeat, and concurrency.
- `worker_metrics` stores per-worker counters such as claimed, completed, and failed jobs.
- `execution_logs` stores structured job lifecycle events with redacted metadata.
- `ai_provider_usage` stores provider, model, operation, token usage, latency, status, and non-sensitive metadata.
- `dead_letter_queue` stores terminal jobs that exhausted retry attempts.

## Execution lifecycle

1. An API/admin caller enqueues a job in `ai_execution_jobs` with status `queued`.
2. A runner starts and registers/heartbeats a `worker_nodes` row.
3. The runner claims the next eligible `queued` or `retrying` job using `FOR UPDATE SKIP LOCKED`.
4. Claiming sets the job to `running`, assigns `locked_by`, increments `attempt_count`, and records `timeout_at`.
5. The provider executor validates configuration and calls OpenAI through the Responses API.
6. On success, provider usage is persisted, the job result is stored, and the job becomes `completed`.
7. On failure, the runner stores a manager-safe error, records failure telemetry, and transitions the job to `retrying`, `failed`, or `dead_lettered`.

## Retry model

- Retryable errors transition to `retrying` until `attempt_count` reaches `max_attempts`.
- Retry delay uses exponential backoff capped at five minutes.
- Non-retryable configuration errors transition directly to `failed`.
- Exhausted jobs transition to `dead_lettered` and are copied to `dead_letter_queue` for operator review.

## Failure handling

Failures are separated into manager-safe messages and technical details. The job `error_message` uses the safe message. Technical metadata is redacted before it is written to execution logs. Worker concurrency is decremented on every terminal or retrying failure path so capacity does not leak.

Old pre-production internal test failures can be cleaned with migration `db/migrations/023_archive_old_failed_test_jobs.sql`. It adds `archived` and `rejected` statuses, archives old terminal internal test jobs, and rejects stale non-terminal internal smoke jobs so production workers do not claim obsolete diagnostics.

## Provider usage tracking

OpenAI execution records one `ai_provider_usage` row per provider call attempt. Successful calls include provider, model, operation, prompt/completion/total tokens, latency, status `succeeded`, and the OpenAI response id. Failed calls include provider, model, operation, latency, status `failed`, and status-only metadata. Prompts, tokens as secrets, API keys, and raw response bodies are not logged.

## Observability

Allowed production console events are intentionally small:

- `[ai-execution-runner] worker registered`
- `[ai-execution-runner] job claimed`
- `[ai-execution-runner] job completed`
- `[ai-execution-runner] job failed`
- `openai_response_started`
- `openai_response_completed`

Durable observability is stored in `execution_logs`, `worker_metrics`, `ai_provider_usage`, and `dead_letter_queue`. Temporary SQL debug output and provider usage debug output have been removed.

## Security model

- OpenAI API keys are read from environment variables and are never stored in queue payloads or logs.
- Prompts, instructions, raw provider responses, generated text, authorization headers, secrets, passwords, and token-shaped values are redacted by the execution redaction helper before structured logging or execution-log persistence.
- Job payloads and completed job results are durable application data; only safe summaries are written to logs.
- Provider failure logs avoid raw response bodies and store status-only metadata where possible.

## Admin execution key

Internal execution endpoints can be protected with `AI_EXECUTION_ADMIN_KEY`. Requests that provide the matching `x-ai-execution-key` are accepted as internal runner/admin calls. Requests without that key must authenticate through the normal JWT path. The key should be long, random, environment-scoped, rotated regularly, and never reused outside execution administration.

## Production recommendations and future scaling roadmap

Near-term hardening:

- Add a Redis queue in front of database-backed jobs for lower-latency wakeups while keeping PostgreSQL as the source of truth.
- Add dead-letter retry tooling for operator-reviewed replay with idempotency controls.
- Add a websocket realtime execution dashboard for queue depth, worker heartbeat, active jobs, failures, token usage, and dead-letter triage.

Workflow orchestration:

- Adopt Temporal for long-running, multi-step workflows, durable timers, cancellation, and human-in-the-loop retries.
- Use LangGraph for stateful agent graphs where each node can map to a durable execution job and provider usage record.

Distributed execution:

- Run distributed workers across multiple nodes with queue-specific worker pools.
- Add autoscaling from queue depth, oldest-job age, and active worker concurrency.
- Split model/provider queues for differentiated concurrency and rate-limit policies.
- Add per-workspace rate limits, quotas, and priority lanes.

Enterprise operations:

- Export metrics to Prometheus/OpenTelemetry.
- Add alerting for stale `running` jobs, dead-letter growth, provider failure spikes, and missing worker heartbeats.
- Add a formal replay policy for archived/rejected smoke-test jobs and production dead letters.
