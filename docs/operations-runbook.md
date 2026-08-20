# Backup, restore, retention and incident runbook

PGlite backup and restore commands are in the README. They hash every file, refuse overwrite and require the app to be stopped. The verified drill copied 1,240 files into a fresh target and passed `db:verify`.

For PostgreSQL, use the selected host's encrypted backup service plus regular logical `pg_dump --format=custom`. Restore into a new database with `pg_restore`, run migrations only after verifying the backup version, execute `db:verify`, reconcile row counts/release gates/audit head, and never overwrite the only known-good database. RPO, RTO, encryption keys, off-site region and restore frequency need approval.

`retention:dry-run` records counts without deletion. `retention:apply` removes expired optional coach messages, old one-time tokens and sessions, and releases expired budget reservations; it records a retention job and audit event. `rights:dry-run` is default. `rights:apply:synthetic` processes only synthetic restriction/deletion records, revokes sessions and preserves audit. Live rights processing remains blocked pending identity verification and approved research-retention decisions.

Incident sequence: contain/disable affected capability; keep live flags closed; preserve logs/audit and timestamps; rotate exposed credentials; assess data/safety impact with authorised leads; notify controller/sponsor/IG/CSO under their approved procedure; restore into a new environment if needed; validate gates and data; document decision/lessons; obtain explicit re-release. Never use participant coach text in generic incident tooling.

Provider/database failure returns no fabricated success. The structured coach remains available for provider failures; database failure prevents unsafe writes. Stale budget reservations fail closed until retention reconciliation.

`GET /api/health` performs a minimal database readiness query and returns only `ready` (200) or `unavailable` (503), with `no-store`; it exposes no exception, version or configuration detail. Monitor it from the approved hosting environment, but never interpret readiness as release, safety or governance approval.
