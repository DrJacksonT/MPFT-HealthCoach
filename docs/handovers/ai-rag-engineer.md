# AI and RAG Engineer Handover

**Date:** 12 August 2026
**Status:** Independent implementation review complete. No application code changed.

## Work completed

- Inspected `src/ai`, the runtime evidence repository, coach and telemetry API routes, browser request construction, provider configuration, telemetry storage, installed OpenAI SDK behavior, and tests.
- Verified current official OpenAI structured output, model, pricing, and data-control documentation.
- Produced `docs/reviews/ai-rag-review.md` with 17 concrete findings, required P0 to P2 changes, a minimum test matrix, assumptions, risks, disagreements, confidence, and likely errors in the review.
- Updated the AI and RAG section of `docs/HANDOVER.md`.

## Files changed

- Added `docs/reviews/ai-rag-review.md`.
- Added `docs/handovers/ai-rag-engineer.md`.
- Updated only the AI and RAG specialist section in `docs/HANDOVER.md`.

## Decisions

1. Do not enable the provider-backed coach for public, patient, or participant use.
2. Evidence ID membership is not semantic grounding.
3. Generated factual health claims should be removed from the first governed version.
4. Retrieval must be server-authoritative. The client must not select arbitrary evidence IDs.
5. Open free text should remain disabled until a versioned evaluation and operational safety boundary exist.
6. Structured output is a decoding control, not a factual or clinical safety control.
7. Provider calls, admin pages, and telemetry require explicit access control and abuse protection.
8. Model, prompt, schema, evidence, and policy versions must be bound in a release manifest.

## Validation run

- `npm run test:unit`: passed, 16 tests.
- `npm run lint`: exited successfully with two `no-img-element` warnings in `src/ui/CoachApp.tsx`.
- `npx tsc --noEmit`: failed at `db/index.ts:6` and `db/index.ts:12` because `Env.DB` is absent, and at `src/data/evidence.ts:41` and `src/data/evidence.ts:44` because object properties are declared twice.
- OpenAI SDK inspection: confirmed cache detail in `ResponseUsage`, plus a default 10 minute timeout and two retries.
- Live provider call: not run.

## Unresolved risks

- A real eligible ID can be attached to an unsupported or contradictory generated claim.
- Factual and directive text outside `claims` bypasses citation validation.
- The caller controls the evidence set and can choose irrelevant eligible records.
- The paid route has only a process-local IP counter and declared-length check. It still has no authentication, durable edge limit, quota, short deadline, or circuit breaker.
- Real health or identifying free text can reach OpenAI.
- Keyword scope routing misses paraphrases, Unicode variants, mixed intent, and other languages.
- Cost telemetry ignores cached input, cache writes, billed rejected output, retries, and unknown model pricing.
- Telemetry is hidden by default in production but becomes unauthenticated when enabled, remains open in development, and is not dependable across edge isolates.
- No model, grounding, failure-mode, or adversarial evaluation suite exists.
- Prompt, model, evidence, and policy changes are not reproducibly versioned.

## Exact next actions

1. Add a server-side `ENABLE_AI_COACH` kill switch that defaults to false and fail closed when absent.
2. Remove provider-backed free text from public builds and protect coach, telemetry, and admin routes for controlled staff demonstrations.
3. Replace model-written factual claims with immutable approved claim IDs and application-rendered text.
4. Replace caller-supplied evidence IDs with server-side intent selection from a versioned policy.
5. Add request body and ID limits, authentication, edge rate limiting, per-session quota, global budget control, concurrency control, a short timeout, and bounded retries.
6. Introduce typed internal failure outcomes and correct HTTP handling for validation, boundary, no evidence, provider, refusal, incomplete, parsing, grounding, and internal failures.
7. Add unit and route tests for schemas, fallback, selection, citation filtering, certainty derivation, provider failures, and cost accounting.
8. Build the offline adversarial evaluation matrix in `docs/reviews/ai-rag-review.md` and set pass thresholds before any model configuration is approved.
9. Add cache-aware and failure-aware cost calculation, then reconcile samples against provider billing.
10. Add a release manifest covering provider, model, reasoning, prompt, schema, evidence set, policy, timeout, retries, and environment.
11. Resolve the `Env.DB` TypeScript failure and the duplicate evidence object properties, then rerun `npm test`, lint, and `npx tsc --noEmit`.
12. Recheck official model pricing and data-control documentation at release time.
