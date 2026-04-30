# ADR-005: Redis for Cache and Queue Layer

## Status

Accepted

## Date

2026-04-30

## Context

Platform requires caching, session storage, rate limiting, and lightweight background job queues.

## Decision

Use Redis as unified cache/queue/session layer during MVP/Growth.

## Consequences

### Positive

* Simple operational model
* Fast in-memory performance
* Supports caching and queue primitives
* Reduces infrastructure footprint

### Negative

* Not ideal for very large event streams
* Queue guarantees weaker than dedicated brokers

## Migration Trigger

Adopt dedicated message broker when:

* Queue throughput exceeds Redis capability
* Delivery guarantees become critical
* Event-driven microservices architecture introduced

## Alternatives Considered

* RabbitMQ
* Kafka

## Why Rejected

Overkill for current scale and complexity.
