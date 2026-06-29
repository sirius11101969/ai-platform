# AS6 Platform V2 — Living Spaces 2.0 Specification

Stage: AS6_PLATFORM_V2_LIVING_SPACES_SPEC_P1

## Purpose

Living Spaces 2.0 turns AS6 spaces from pages into platform modules.

Each Living Space owns:

- manifest
- routes
- navigation
- widgets
- services
- commands
- permissions
- policies
- capabilities
- AI actions
- search providers
- context providers
- settings
- lifecycle

## Manifest Contract

Required fields:

- id
- title
- version
- category
- routeBase
- status
- routes
- navigation
- widgets
- services
- commands
- permissions
- policies
- capabilities
- aiActions
- searchProviders
- contextProviders
- settings

## Runtime Lifecycle

Every Living Space must support:

1. register
2. validate
3. load
4. activate
5. render
6. deactivate
7. dispose

## Integration Contract

Living Spaces must integrate with:

- Service Registry
- Plugin SDK
- Capability Registry
- Permission Engine
- Policy Engine
- Event Bus
- Release Evidence
- Snapshot Gate

## Product Goal

Living Spaces 2.0 is the foundation for AS6 Platform V2, AI Operating System, Plugin Marketplace and future Organization / Tenant Boundary Engine.
