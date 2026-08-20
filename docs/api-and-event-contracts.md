# API and event contracts

All JSON mutations require same-origin requests where applicable, an authenticated session for protected routes, and `x-csrf-token` matching the readable CSRF cookie and server-stored hash. Sensitive responses use `Cache-Control: no-store`. Errors avoid identity disclosure.

Key route families:

- `/api/auth/*`: invitation registration, verification, login/logout, MFA, reset and session status.
- `/api/participant/*`: onboarding, plan, check-in, coaching, surveys, follow-ups, referrals and account rights.
- `/api/staff/*`: exports, safety review, data quality and gambling staff simulation.
- `/api/account`, `/api/coach`, `/api/evidence-summary`, `/api/telemetry`: deliberately closed with HTTP 410.

The product-event taxonomy is `src/research/product-events.ts`, version 1. Events are server-created, content-free and study-idempotent. Activation means baseline completion plus goal creation. Meaningful use requires activation and meaningful interactions on at least two distinct UTC dates. A session is a successful authenticated session; a page view is never engagement. Retention requires a meaningful interaction within a configured eligible period.

Audit events record actor (when available), study/participant scope, target, outcome, bounded metadata and a SHA-256 chain. `npm run audit:verify` recomputes canonical version-2 hashes and checks the persisted chain head.

AI responses contain reflection, one coaching question and one approved action code. The server adds claims/citations and boundary metadata. Provider failure, closed gate, absent consent/key, invalid output or exhausted budget returns the same structured actions with `kind: fallback`.
