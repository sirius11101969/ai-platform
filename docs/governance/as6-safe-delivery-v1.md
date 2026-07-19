# AS6 Safe Delivery v1

## Decision

AS6 production is not a development or prototype environment. A commit may reach
production only after the same immutable backend and frontend images pass the
isolated staging environment.

## Environments

| Environment | Purpose | Data | External mutations |
| --- | --- | --- | --- |
| Preview/prototype | UX and visual experiments | fixtures only | forbidden |
| Staging | production-equivalent validation | isolated or sanitized | test providers only |
| Production | real users and business operations | real | explicitly configured |

The initial staging stack may share the production VPS, but it uses a separate
Compose project, PostgreSQL volume, Redis volume, attachment volume, secrets and
loopback-only HTTP port. It must never share the production database or file
volume. A separate VPS becomes mandatory when resource contention, availability,
regulatory requirements, or the value of production data makes a shared host an
unacceptable failure domain.

A clean-database bootstrap check verifies that every foreign-key target is
created before it is referenced. This exposes migration-order defects in
staging that an existing production database can otherwise hide.

## Release gates

1. Build the requested Git commit once with `ops/bin/as6-build-release-v1`.
2. Deploy those exact image IDs to staging.
3. Require root, app, API health and the staging environment header.
4. Store a staging attestation bound to commit SHA and image IDs.
5. Create a full production backup of PostgreSQL and attachment storage.
6. Create and push a pre-release Git restore tag.
7. Promote the exact attested images without rebuilding.
8. Run production smoke checks; automatically restore prior images on failure.

Pushes to `main` no longer deploy automatically. Production promotion is a
manual GitHub Actions workflow requiring an exact 40-character SHA and the
`PRODUCTION` confirmation.

Operational fetches update `main` without fetching every remote tag. Restore
tags are fetched individually only when the requested target is not already
available locally. An unrelated conflicting local tag therefore cannot block
staging installation or production promotion.

## Backup contract

The daily backup contains:

- PostgreSQL custom-format dump;
- attachment and AI artifact storage archive;
- Git commit and running image identifiers;
- checksum manifest.

The populated `.env` file is never copied into the backup bundle. Only its
checksum is recorded. Secrets must be kept in a separate encrypted secret
manager or encrypted offline recovery package.

`AS6_BACKUP_OFFSITE_DIR` may point to a mounted off-host destination. A local
backup on the production VPS is not sufficient for disaster recovery.

Google Drive may be used as one encrypted off-host copy through a dedicated
`rclone crypt` remote, but never as the only backup and never as live storage
for PostgreSQL. `ops/bin/as6-backup-offsite-rclone-v1` accepts only completed,
timestamped bundles below the configured backup root, verifies their local
checksums, uploads with immutable semantics, and requires `rclone cryptcheck`
to pass before reporting success. Content and file names are encrypted before
leaving the VPS.

The unattended configuration lives outside the repository in `/etc/as6` with
root-only permissions. The rclone configuration itself must be encrypted. Its
encryption marker is validated as the first non-empty, non-comment data line
to remain compatible with rclone versions that prepend a descriptive comment.
configuration password is kept in a separate root-only file and is injected
only into the backup process. OAuth tokens, encryption passwords, `.env`
contents, and rclone configuration must never be committed.

Run `ops/bin/as6-configure-google-drive-offsite-v1` once on the production VPS
to authorize Google Drive and establish the encrypted remote. Preserve an
offline recovery copy of the rclone configuration plus both required
passwords. Without the crypt password, encrypted backup data is unrecoverable.
Retain an independent restore path outside both the production VPS and the
Google account.

## Restore contract

`ops/bin/as6-restore-drill-v1` verifies checksums, attachment archive integrity,
and restores PostgreSQL into a temporary isolated container and volume. The
temporary environment is removed after validation. Restoring over production is
always a separate, explicitly approved incident operation.

## Accessing initial staging

The initial staging HTTP listener is bound to `127.0.0.1:18080`. Use an SSH
tunnel rather than exposing it publicly:

```bash
ssh -L 18080:127.0.0.1:18080 root@production-host
```

Then open `http://127.0.0.1:18080`. A future `staging.as6.ru` edge may proxy to
the same service after DNS, TLS and access control are configured.

## Failure classes closed

- `AS6_DIRECT_MAIN_TO_PRODUCTION_DEPLOYMENT`
- `AS6_STAGING_DATA_ISOLATION_GAP`
- `AS6_RELEASE_REBUILD_DRIFT`
- `AS6_STAGING_RELEASE_TAG_INTERPOLATION_GAP`
- `AS6_CLEAN_DATABASE_BOOTSTRAP_ORDER_GAP`
- `AS6_ATTACHMENT_BACKUP_GAP`
- `AS6_RESTORE_DRILL_GAP`
- `AS6_UNENCRYPTED_OFFSITE_BACKUP_GAP`
- `AS6_OFFSITE_UPLOAD_WITHOUT_INTEGRITY_CHECK_GAP`

## Remaining operational requirements

- complete one-time Google Drive OAuth authorization and verify the first encrypted upload;
- verify the daily timer on production;
- run and record restore drills regularly;
- move staging to a separate VPS before production scale or compliance requires it;
- use sanitized production-like fixtures, never an uncontrolled copy of personal data.
