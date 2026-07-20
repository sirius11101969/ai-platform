# AS6 Secure Staging Access AEC v1

- The canonical browser-review hostname is `staging.as6.ru`.
- Staging must retain separate PostgreSQL, Redis, attachment storage, secrets,
  Compose project, and loopback listener.
- Only the two Nginx containers may join `as6-staging-edge`; staging backend,
  database, and Redis must not join it.
- The production edge must never proxy staging traffic to production backend or
  production frontend services.
- Staging entry must require access control without consuming application
  Bearer authorization headers.
- Staging must emit no-index and no-store controls and a staging identity
  header on public responses.
- Access credentials and htpasswd material must stay outside Git with root-only
  permissions and must never appear in diagnostic output.
- A release attestation records whether the protected public edge was verified
  or not yet configured.
- DNS and TLS activation must be fail-closed; a missing or mismatched DNS record
  must stop configuration before edge mutation.
