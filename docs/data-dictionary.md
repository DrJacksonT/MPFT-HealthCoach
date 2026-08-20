# Database and data dictionary

The executable dictionary is `db/schema.ts`; forward SQL is in `migrations/`. `docs/pilot-minimum-dataset.md` remains the semantic specification. Generated analysis fields and enums are also emitted by `src/research/export.ts`.

| Area | Principal records | Semantics |
|---|---|---|
| Study/config | `studies`, `study_versions`, `content_versions`, `releases`, `support_resources` | Immutable versions and fail-closed release evidence |
| Identity | `users`, `contact_identities`, `invitations`, `invitation_uses`, `user_roles`, `sessions`, `one_time_tokens`, `mfa_credentials` | Contact/auth separated from research; token hashes only |
| Participant | `participants`, `eligibility_assessments`, `consents`, `baselines`, `plans`, `plan_versions` | UUID plus participant code; consent and plan history retained |
| Observations | `check_ins`, `progress_statuses`, `outcome_assessments`, `referrals` | Event time/source preserved; missing is explicit; self-report is separate from verification |
| Surveys | definitions, versions, questions, schedules, instances, answers, events, `measure_registry` | Immutable instrument versions, windows, burden and licence/approval state |
| Safety | `safety.flags`, `safety.reviews` | Deterministic route/quality record, distinct from emergency response |
| Evidence/AI | evidence releases, claims, sources, passages, mappings, decisions, interactions, optional messages | Human verification cannot be self-assigned by code; raw text separately controlled |
| Operations | product events, rate limits, budget counters/reservations, cost ledger, audit events/head, exports, retention jobs, data-quality issues/resolutions | Content-free engagement, atomic spend reservation and auditable operations |

All primary business records use UUIDs. Timestamps are UTC with timezone. `occurred_at` is the event time; `received_at` is server receipt. Repeatable product events use a study-scoped idempotency key. Analysis outcomes are derived from immutable observations and carry cutoff, population, missing rule and derivation version.

Contact identity, raw coach text and default research export are three separate access scopes. Field-level encryption is required before raw coach text can be enabled; the current release keeps it disabled. Platform/disk/database encryption at rest remains a hosting responsibility.
