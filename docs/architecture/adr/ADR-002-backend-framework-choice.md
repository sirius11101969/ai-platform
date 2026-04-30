# ADR-002: Backend Framework Choice

## Status

Accepted

## Date

2026-04-30

## Context

The platform requires API development, CRM backend logic, integrations, AI orchestration, and workflow support.

## Decision

Primary backend stack will use FastAPI unless TypeScript ecosystem needs outweigh Python advantages.

## Consequences

### Positive

* Strong AI/ML ecosystem alignment
* Fast API development
* Easy LLM/tool integration
* High developer productivity

### Negative

* Less unified stack if frontend remains TypeScript
* Some enterprise tooling stronger in NestJS ecosystem

## Alternatives Considered

* NestJS
* Django

## Why Rejected

NestJS adds TypeScript consistency but weaker AI-native ecosystem.
Django too opinionated/heavy for service-style backend.
