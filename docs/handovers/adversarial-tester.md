# Adversarial Tester handover

Last updated: 12 August 2026

## Work completed

- Tested evidence eligibility, citation IDs, numerical helpers, safety routing, instruction attacks, local deletion, developer routes, API errors, rendered HTML and accessibility source patterns.
- Ran the built application through a local production server with developer routes both disabled and explicitly enabled.
- Added regression tests for domain logic, API trust boundaries and the local storage lifecycle.
- Produced `docs/reviews/red-team-report.md` with reproductions, severity, fixes, residual risks and confidence.

## Files changed

- `src/data/evidence.ts`
- `src/domain/safety.ts`
- `src/ai/schemas.ts`
- `src/modules/smoking.ts`
- `src/ui/CoachApp.tsx`
- `app/api/coach/route.ts`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/admin/evidence/page.tsx`
- `app/admin/telemetry/page.tsx`
- `scripts/check-evidence-freshness.mjs`
- `tests/domain.test.ts`
- `tests/coach-api.test.ts`
- `tests/ui-storage.test.tsx`
- `tests/rendered-html.test.mjs`
- `vitest.config.ts`
- `docs/reviews/red-team-report.md`
- `docs/handovers/adversarial-tester.md`
- `docs/HANDOVER.md`

## Confirmed defects and fixes

1. Evidence governance fields were overrideable. Safe fields now win, records are frozen and date validity is tested.
2. Duplicate IDs produced duplicate claims and citations. Both schema and lookup now deduplicate.
3. IDs had no item bound. IDs now have length and character constraints.
4. Common self-harm, symptom, medicine and instruction-attack phrases bypassed safety. The corpus and patterns were expanded.
5. The API accepted `text/plain`. It now requires JSON and distinguishes 400, 415 and 503 paths.
6. Local deletion could recreate data or disable later persistence. Empty state now removes storage and later non-empty state persists.
7. Calculation helpers could propagate non-finite values. They now reject or ignore invalid values.
8. Server-rendered home exposed only a loading shell. It now renders the landing disclosure and start action before hydration.
9. The skip link was invisible on focus. It now moves into view.
10. Hidden production developer routes still had visible links. Links now follow the server-side feature policy.
11. Freshness checking counted suppressed stale records and missed default due dates. It now checks all 12 verified records only.

## Tests and results

- `npm test`: passed, 27 Vitest tests, production build and 2 rendered HTML tests.
- `npx tsc --noEmit --pretty false`: passed.
- `npm run lint`: 0 errors, 2 image optimisation warnings.
- `npm run evidence:freshness`: passed, 12 verified, 0 overdue, 0 invalid.
- Production route tests passed for default-hidden admin, explicitly enabled admin, API status codes, no-store responses and boundary routing.
- No em dash or en dash found in files edited by this pass.

## Residual risks

- Allowed citation IDs do not prove claim entailment.
- Evidence selection remains client-controlled.
- Safety regexes are incomplete by design.
- Rate limits are process-local and not identity-backed.
- The admin feature flag is not authentication.
- No live provider, browser, screen-reader or physical mobile test was available.
- Local production responses lacked CSP and anti-framing headers during the red team run. The primary implementer added both afterwards at the framework and worker boundaries. Rendered output tests now assert these headers. The policy still needs inline script allowances for the current framework.
- The TypeScript freshness parser remains regex-based.

## Exact next actions

1. Read `docs/reviews/red-team-report.md` and turn its required changes into release-blocking tickets.
2. Keep `OPENAI_API_KEY` unset for any public, patient or participant environment.
3. Replace client-selected evidence IDs with server-owned retrieval and add claim entailment enforcement.
4. Add edge origin checks, rate limits, authenticated sessions and tested security headers.
5. Keep `ENABLE_DEV_ADMIN=false` publicly. Add real access control before enabling it anywhere shared.
6. Run keyboard, NVDA, VoiceOver, TalkBack, 320 pixel, 400 percent zoom and physical-device tests.
7. Add live model contract tests for timeouts, malformed structured output and unsupported citations.
8. Replace the freshness regex with validation against one structured evidence catalogue.

## Confidence

High for tested code and local production HTTP behaviour. Moderate for the expanded deterministic safety corpus. Limited for live model, real deployment, accessibility and physical mobile behaviour.
