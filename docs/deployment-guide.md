# Deployment guide

This guide describes a future controlled deployment. It does not authorise one. No deployment is part of the current software-completion goal.

## Supported shape

- Node.js 24 LTS runs the Next.js application behind an approved TLS reverse proxy.
- A managed PostgreSQL service supplies `DATABASE_URL`; PGlite is for local development and automated assurance only.
- Transactional email uses an approved SMTP service. Mailpit and the local-file adapter are development-only. Set `MAIL_TRANSPORT=disabled` for a production synthetic deployment until an approved provider and sending domain exist; email registration and reset delivery then fail closed.
- Application instances share no durable local state. Secrets come from the hosting platform, not files committed to source control.
- The public health check is `GET /api/health`. It returns only `ready` or `unavailable` and no configuration details.

## Pre-deployment sequence

1. Complete the external approvals in `external-dependencies.md`, including controller/processor, clinical-safety, information-governance, evidence/content, accessibility, penetration-test, hosting-region and operating-model decisions.
2. Pin and review the Node/runtime and dependency lockfile; run the complete QA commands in `qa-record.md` on the release commit.
3. Provision a new PostgreSQL database, encrypted backups and tested restore target. Run `npm run db:migrate`, `npm run db:seed` only for an explicitly synthetic environment, and `npm run db:verify`.
4. Configure production secrets and URLs from `.env.example`. Production startup must fail if test MFA, local mail, missing prices or unsafe live settings are supplied.
5. Keep `ENABLE_LIVE_PILOT=false`, `ENABLE_LIVE_AI=false` and gambling participant access closed during smoke testing.
6. Record reviewed application and evidence release manifests. Live recruitment or AI additionally requires the matching named, dated database approval record; software checks cannot create that human approval.
7. Validate TLS, headers, health monitoring, alert routing, backup restore, incident contacts, staff identity/second factor, email delivery and the structured non-AI path before considering traffic.

## Release and rollback

Use immutable builds and forward-only migrations. Back up before migrations, deploy to a non-public environment, run readiness and synthetic smoke tests, then use an authorised change process. A rollback restores the prior application image; if a schema rollback is unsafe, restore the verified backup into a new database and reconcile audit/release state before switching traffic. Close live flags first whenever safety, evidence, identity, database or provider behaviour is uncertain.

Never copy synthetic seeds, local MFA secrets, `.data` stores or development mail into production. Never put participant text into deployment logs or generic monitoring payloads.
