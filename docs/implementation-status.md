# Standalone pilot platform implementation status

Last updated: 20 August 2026

## Status

- **Technically pilot-ready:** yes, for fictional participant and staff testing. The ten software completion criteria were exercised locally and are evidenced below.
- **Authorised for live pilot:** no. Recruitment, live AI and gambling participant access remain fail-closed until authorised humans record the required release approvals and an approved deployment exists.

This is a software assurance statement, not ethics, research-governance, clinical-safety, information-governance, accessibility, penetration-test, deployment or service approval.

## Completion evidence

| Criterion | Local evidence | Result |
|---|---|---|
| 1. Reproducible local start | README, `.env.example`, PGlite zero-service path, Docker Compose PostgreSQL/Mailpit option, migrations `0000`–`0007`, idempotent fictional seed and `db:verify` | Met |
| 2. Complete fictional participant journey | Playwright covers registration, verification, login, consent/baseline, goal/plan, check-in, honest progress, structured/AI-fallback coaching, due survey, due follow-up, help, optional-consent change, data-copy request and withdrawal | Met |
| 3. Functional without AI | Structured coaching is complete; forced provider-disabled path returns the reviewed fallback and is exercised in Playwright | Met |
| 4. Authorised fictional researcher | MFA-rotated administrator session opens protected de-identified flow, survey/outcome, AI/cost, data-quality, gambling, safety, export and release views; participant route/API access is denied | Met |
| 5. Research outputs | Researcher-only stable CSV/JSON export, generated dictionary, immutable export audit and deterministic Markdown report; three synthetic analysis rows generated in the final run | Met |
| 6. Gambling staff simulation | Synthetic baseline/check-ins/outcome, protective actions, deterministic hazard routing, staff UI and API tests; participant gate remains closed | Met |
| 7. Server enforcement | Argon2id, session/CSRF/rate controls, MFA/RBAC, entry/consent/release/evidence gates, immutable survey versions, deterministic safety, serialized hash-chain audit and atomic AI budget reservations | Met |
| 8. Assurance | 55 unit tests, 2 rendered-HTML checks, 4 serial Playwright journeys, axe critical-page checks, desktop/mobile screenshots, TypeScript, lint and Next production build pass | Met |
| 9. No deceptive/dead product state | Visible controls exercised or backed by state-changing handlers; legacy public admin/API surfaces closed; synthetic labels and non-monitoring/non-approval wording retained; placeholder scan found only legitimate form hint attributes and the named fail-closed measure candidate | Met |
| 10. Technical/gated/external documentation | Current architecture, data dictionary, contracts, surveys, release/evidence/AI, security/privacy, safety, operations, deployment, analysis, QA and external-dependency documents | Met |

## Final local assurance record

- `npm test`: 55/55 Vitest tests, production build and 2/2 rendered-HTML tests passed.
- `npm run e2e`: 4/4 Chromium journeys passed in 1.1 minutes on a reset, migrated and seeded PGlite store.
- `npm run audit:verify`: 21 events, one segment, canonical version 2, valid matching head after the final operational dry runs.
- `npm run report:synthetic`: generated three analysis rows and the synthetic pilot report.
- `npm run evidence:freshness`: 18 runtime records checked; none overdue or structurally invalid. This does not assign human verification.
- `npm audit --omit=dev`: zero vulnerabilities.
- `npm run sbom`: 27 production components written to `artifacts/security/sbom.cdx.json`.
- Backup/restore drill: 1,240 files copied to a new target and `db:verify` passed.

The full development-tree audit reports four moderate advisories in Drizzle Kit's development-only legacy esbuild loader. The suggested automatic fix is an unsafe breaking downgrade to Drizzle Kit 0.18.1, so it was not applied. The production dependency audit is clear.

## Boundaries and next authorised stage

Docker and `psql` were unavailable on this Windows host, and its installed Node was 25.5 rather than the declared Node 24.x runtime. The PostgreSQL-compatible PGlite path was fully exercised; a Node 24 plus real PostgreSQL run is mandatory in the eventual controlled pre-production environment.

The precise external decisions and services still required are maintained in `external-dependencies.md`. No deployment, real email, real participant/staff data, recruitment, provider call or governance approval was performed or claimed.
