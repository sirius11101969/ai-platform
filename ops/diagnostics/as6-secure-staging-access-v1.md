# AS6 Secure Staging Access v1

## Diagnosis

The isolated staging stack was healthy but reachable only through the VPS
loopback listener. That made realistic browser review inconvenient and left no
canonical protected prototype URL for continued product work.

## Root causes

- `AS6_STAGING_PUBLIC_REVIEW_ACCESS_GAP`: staging had no TLS public entry.
- `AS6_STAGING_BASIC_AUTH_BEARER_COLLISION_RISK`: unconditional HTTP Basic
  authentication would replace the application's Bearer authorization header.
- `AS6_STAGING_EDGE_NETWORK_OVEREXPOSURE_RISK`: attaching a database or backend
  directly to the production network would weaken staging isolation.
- `AS6_STAGING_SEARCH_INDEXING_RISK`: a public hostname needs explicit
  no-index controls.
- `AS6_STAGING_ORIGIN_CREDENTIAL_COLLISION_RISK`: the prototype must use a
  distinct browser origin and must not set production-domain cookies.

## Repair

`staging.as6.ru` terminates TLS at the production edge and proxies only to the
staging Nginx container over a dedicated external bridge. Staging PostgreSQL,
Redis, backend, volumes, secrets, and the loopback listener remain isolated.

HTTP Basic always protects browser entry and static navigation. Only `/api/`
requests already carrying a Bearer token bypass Basic at the edge and remain
subject to normal staging backend authorization, preventing the two schemes
from competing for the single `Authorization` header without exposing the
prototype shell.

The edge emits `X-Robots-Tag`, a deny-all `robots.txt`, no-store headers, and a
staging identity header. The public smoke test verifies TLS, unauthenticated
denial, authenticated root/app/health access, no-index headers, and absence of
production-domain cookies.

## Activation state

The repository contract is implemented. Runtime activation requires the DNS A
record, certificate expansion, and one-time root-only access credentials on the
VPS through `ops/bin/as6-configure-secure-staging-access-v1`.
