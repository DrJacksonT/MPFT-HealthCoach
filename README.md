# MPFT Behaviour Change Research Platform

A standalone Next.js research platform for a governed feasibility pilot of AI-assisted smoking behaviour change. The repository also contains a staff-only gambling-harm simulation. All supplied accounts, records, screenshots, exports and reports are fictional.

Current status: **technically pilot-ready with synthetic/staff test data; not authorised for a live pilot**. Recruitment, live AI and gambling participant access each require an environment flag plus a matching named, dated database release. The seeded releases deliberately fail those gates.

## What works

- Invitation-based email or low-PII alias registration, verification, password reset, Argon2id passwords, expiring/revocable sessions, CSRF, durable rate limits and staff TOTP.
- Versioned information, consent and smoking baseline; goals; daily check-ins; honest missing-data progress; structured coaching; optional bounded AI fallback; surveys; follow-ups; support; account rights and withdrawal.
- Separate MFA-gated staff workspace for participant flow, outcomes, surveys, safety/quality review, AI cost/reliability, data quality, evidence and release status, subject-rights requests, exports and gambling simulation.
- PostgreSQL schema with forward migrations, deterministic synthetic seed, PGlite local/test runtime, Docker Compose PostgreSQL/Mailpit option, CSV/JSON exports, generated dictionary/report, backup/restore, retention jobs, tamper-evident audit and CycloneDX SBOM.

The tool is research support, not clinical care. It is not monitored, does not diagnose or prescribe, cannot alert a clinician, and is not emergency care.

## Requirements

- Node.js 24.x and npm (the build deliberately declares Node 24; other versions are not the supported runtime).
- Optional: Docker Desktop for PostgreSQL and Mailpit. PGlite requires neither Docker nor `psql`.
- Optional: an OpenAI API key. All essential actions work without it and the seeded live-AI gate is closed.

## Fast local start with PGlite

```powershell
npm ci
Copy-Item .env.example .env.local
$env:PGLITE_DATA_DIR='.data/mpft-local'
npm run db:migrate
npm run db:seed
npm run db:verify
npm run dev
```

Open `http://localhost:3000`.

Fictional participant: alias `rowan-fictional-01`, password `Fictional-only-2026!`.

Fictional administrator: email `fictional.admin@example.invalid`, the same password, and TOTP secret `JBSWY3DPEHPK3PXP` in a local authenticator. This development secret must never be configured in production.

Invitation codes are `SMOKE-FICTIONAL-2026` for the synthetic smoking participant route and `GAMBLE-STAFF-ONLY-2026` for staff simulation. Gambling has no participant route.

## Docker PostgreSQL and Mailpit

```powershell
docker compose up -d
npm ci
Copy-Item .env.example .env.local
```

Set these values in `.env.local`:

```text
DATABASE_URL=postgres://mpft:mpft-local-only@127.0.0.1:5432/mpft_coach
MAIL_TRANSPORT=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
```

Then run:

```powershell
npm run db:migrate
npm run db:seed
npm run db:verify
npm run dev
```

Mailpit is at `http://localhost:8025`. Docker and `psql` were unavailable in the final Windows verification environment, so the checked restore/fresh-store evidence uses PGlite; PostgreSQL remains the production data model and must be exercised in the selected pre-production host before release.

## Quality and assurance commands

```powershell
npm run lint
npm run test:unit
npm run build
npm run e2e
npm run evidence:freshness
npm audit --omit=dev
npm run sbom
```

`npm run e2e` resets only `.data/mpft-e2e-test`, migrates and seeds it, starts the app on port 3100, then runs Chromium journeys and axe WCAG checks. It never uses real data.

Generate research artefacts against a chosen synthetic store:

```powershell
$env:PGLITE_DATA_DIR='.data/mpft-local'
$env:REPORT_AS_OF='2026-08-20T15:45:00Z'
npm run report:synthetic
npm run audit:verify
npm run retention:dry-run
npm run rights:dry-run
```

The report/export examples are under `artifacts/synthetic-pilot/`; the SBOM is `artifacts/security/sbom.cdx.json`; browser QA images and the Playwright report are under `artifacts/qa/` and `artifacts/playwright-report/`.

## Backup and restore drill

Stop the app before copying a PGlite directory.

```powershell
$env:PGLITE_DATA_DIR='.data/mpft-local'
$env:PGLITE_BACKUP_OUTPUT='.data/backups/mpft-local-2026-08-20'
npm run backup:pglite

$env:PGLITE_RESTORE_SOURCE='.data/backups/mpft-local-2026-08-20'
$env:PGLITE_RESTORE_TARGET='.data/mpft-restore-check'
npm run restore:pglite
$env:PGLITE_DATA_DIR='.data/mpft-restore-check'
npm run db:verify
```

Both commands refuse overwrite. Production PostgreSQL uses encrypted `pg_dump`/`pg_restore` under the selected hosting backup policy; see the operations runbook.

## Live gates and data boundaries

- `LIVE_PILOT_ENABLED`, `LIVE_AI_ENABLED` and `GAMBLING_PARTICIPANT_ENABLED` default to `false`.
- An environment flag alone is never sufficient. The matching release must be authorised, named, dated, not revoked, and contain governance, clinical-safety and deployment approvals.
- Production startup rejects PGlite, HTTP origins, the file mail sink, the development TOTP adapter, default session secrets, missing live-AI key/budget/pricing, and raw-text storage without an encryption key.
- Default analysis exports exclude contact identity and raw text. Raw coaching text storage is off. `store: false` is used for OpenAI calls, but this is not described as zero retention.
- Synthetic evidence may support synthetic journeys. Live claims additionally require named release approval, a verified claim decision, active non-expired sources, exact locators, hashed passages and citation linkage.

## Documentation map

- [Architecture and data flow](docs/architecture-and-data-flow.md)
- [Database and data dictionary](docs/data-dictionary.md)
- [API and event contracts](docs/api-and-event-contracts.md)
- [Surveys and measures](docs/surveys-and-measures.md)
- [Release, evidence and AI governance](docs/release-evidence-ai-governance.md)
- [Security, privacy and pre-live checklist](docs/security-privacy-and-pre-live.md)
- [Safety and operating model](docs/safety-and-operating-model.md)
- [Backup, restore, retention and incident runbook](docs/operations-runbook.md)
- [Deployment guide](docs/deployment-guide.md)
- [Pilot analysis plan](docs/pilot-analysis-plan.md)
- [Synthetic QA record](docs/qa-record.md)
- [External approvals and services](docs/external-dependencies.md)
- [Implementation status](docs/implementation-status.md)
- [Authoritative blueprint](docs/pilot-ready-product-blueprint.md), [minimum dataset](docs/pilot-minimum-dataset.md) and [evidence manifest](docs/evidence-source-manifest.md)

## Deployment boundary

No deployment is performed by this repository handoff. A future deployment must use Node 24, PostgreSQL, TLS, an approved mail/MFA/provider configuration, secrets management, encrypted backups, monitoring that excludes health text, and the exact release manifest. “Technically pilot-ready” never means “authorised for live pilot.”
