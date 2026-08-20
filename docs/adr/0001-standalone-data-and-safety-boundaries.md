# ADR 0001: standalone data architecture and safety boundaries

Date: 20 August 2026
Status: accepted for local implementation; live use remains gated

## Context

The 12 August prototype reviews deliberately prohibited a real participant database and recommended selectable coaching intents instead of open free text. That was the safer decision for the then-current, publicly reachable synthetic demonstration.

The 20 August goal has higher precedence and explicitly requires a standalone research platform with its own authentication, PostgreSQL study database, participant/staff workflows and an optional AI-assisted coach. It also requires live recruitment, live AI and the gambling module to fail closed until separate human approvals exist.

## Decision

1. Keep the modular monolith and Next.js/React/TypeScript/Drizzle direction.
2. Replace the D1/SQLite prototype data model with a production-capable PostgreSQL schema. Use PostgreSQL-compatible embedded execution for local automated verification when Docker is unavailable, while providing Docker Compose for ordinary local services.
3. Separate contact/authentication identity, participant research records, raw conversation content, safety records and general product events by schema, access policy and export path.
4. Implement open participant text only as an optional, authenticated, consent/configuration-gated route. Deterministic safety classification runs before the provider and output policy runs after it. The model has no web, database, arbitrary tools or external actions.
5. Generated text may reflect and ask bounded coaching questions, but patient-facing factual claims, evidence wording, citations, certainty and numbers are application-owned and rehydrated from an approved evidence release.
6. Keep a complete structured route for every essential participant action. Provider failure, refusal, invalid structure, budget exhaustion or disabled AI must return a reviewed structured fallback.
7. Require both an environment-level live-pilot flag and an authorised, named and dated database release record before real recruitment or live AI. Synthetic mode does not bypass role, consent, audit or data-integrity checks.
8. Require a separate gambling release with protocol, measure, evidence, hazard, support-resource and operating-model approvals. Code or passing tests alone cannot enable live participant access.
9. Staff second factor is an adapter boundary. Development may use an explicitly labelled fictional/test adapter; production staff access fails closed unless a non-development provider is configured and approved.

## Consequences

- The new platform can meet the standalone technical criteria while preserving the older reviews' central safety controls.
- The database contains special-category research data even when pseudonymised; local technical completion does not settle controller, lawful-basis, DPIA, confidentiality, retention or hosting decisions.
- A generated response can still be wrong. Keeping clinical facts application-owned reduces citation laundering but does not remove the need for release-specific evaluation and human governance.
- PostgreSQL-compatible local execution provides testability in this workspace, but the Docker/PostgreSQL path must also be exercised in an environment where Docker is available before any deployment decision.
