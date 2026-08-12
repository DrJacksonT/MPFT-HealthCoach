# Project handover

Last updated: 12 August 2026

## Current position

The repository contains a working local research prototype for adult cigarette smoking. The main flow covers a structured review, ranked evidence cards, a chosen goal, check-ins, progress estimates, a scoped coach, safety responses, synthetic personas, local data deletion, an evidence dashboard and development telemetry.

This is suitable only for controlled synthetic demonstrations. It is not ready for patients, public access, real participant data or clinical use.

## Run and verify

```powershell
npm install
npm run dev
npm run lint
npm test
npx tsc --noEmit
npm audit --omit=dev
```

The local preview normally runs at `http://localhost:3000`.

## Decisions that must be preserved

1. The main experience is guided. Chat is optional.
2. Evidence relevance is not an individual risk prediction.
3. The evidence page works without a language model.
4. Patient-facing evidence must be verified, active, current and not superseded.
5. Numbers and citations are rendered from application data rather than invented by a model.
6. The patient-facing coach has no web search or arbitrary tools.
7. Demo progress stays in browser storage. Remote participant storage remains disabled.
8. Safety responses never imply monitoring or clinician contact.
9. No MPFT or NHS endorsement is claimed.
10. User-facing writing uses plain English. Em dashes and en dashes are not allowed.
11. The supplied MPFT logo is stored at `public/mpft-logo.png`. The interface uses a white and NHS blue clinical palette with burgundy reserved for urgent help. The prototype warning must remain next to this branding so it cannot be mistaken for a live MPFT service.

## Latest completed checks

- `npm test` passed 27 unit, API and interface tests, the production build and 2 rendered page tests.
- `npx tsc --noEmit` passed.
- Lint passed with 2 warnings for the two deliberate Trust logo image elements.
- The evidence freshness check passed for all 12 verified runtime records.
- The production dependency audit passed with zero vulnerabilities after the safe `ws` override.
- Browser checks confirmed the Trust branding at desktop and phone widths, with no horizontal overflow at 390 pixels.
- Mobile navigation and delete controls are at least 44 by 44 pixels.
- The urgent chest pain path returned the deterministic safety response and did not claim monitoring.
- Browser console checks found no errors or warnings after the development server was restarted.
- The complete repository scan, excluding generated dependencies and output, found no em dash or en dash characters.

## Work completed after independent review

The privacy hardening now includes strict browser state validation, 30 day expiry, correct deletion behaviour, request limits, no store API headers, production administration route gating and worker response security headers.

The Trust visual style is applied and checked at desktop and phone widths. The supplied logo, white and NHS blue palette, burgundy urgent treatment and non-service warning must be preserved together.

## Priority next actions

1. Keep the provider backed coach disabled for public, patient and participant use until grounding, privacy, abuse control and model evaluation gaps are closed.
2. Complete keyboard, screen reader, zoom and physical device checks before making an accessibility claim.
3. Replace process local request limiting with an edge service if external access is ever proposed.
4. Improve the content security policy so it does not need inline script allowances when the framework supports this.
5. Obtain formal permission before displaying the Trust logo beyond a controlled internal demonstration.
6. Repeat the full test suite and update every affected role handover after future changes.

## Main artefacts

- `README.md`
- `docs/demo-script.md`
- `docs/research-concept.md`
- `docs/project-one-pager.md`
- `docs/landscape-review.md`
- `docs/nhs-governance-roadmap.md`
- `docs/reviews/`
- `docs/handovers/`

## Specialist status

### Product architecture

Complete. See `docs/reviews/product-architecture.md` and `docs/handovers/product-architect.md`.

### Clinical evidence

Discovery catalogue complete. Independent verification complete for the runtime subset. See `docs/reviews/clinical-evidence-review.md`, `docs/reviews/evidence-methodology-review.md` and the related handovers.

### Behaviour change, accessibility and privacy

Reviews complete. Role handovers are maintained in `docs/handovers/`.

- Behaviour change: preserve MI-consistent wording, deterministic branch ownership, one grounded reflection and one open question per ordinary turn, structured lapse or relapse clarification, honest reduction framing and visible professional support. Next, convert the P0 policy and 15 acceptance tests into route, output and transcript tests. See `docs/reviews/behaviour-change-review.md` and `docs/handovers/behaviour-change-lead.md`.
- UX and accessibility: architecture criteria are complete, but no WCAG conformance claim is supported yet. Next, turn sections A through G into release tickets and retain automated, keyboard, NVDA, VoiceOver, TalkBack, 320 pixel, 400 percent zoom, physical-device and moderated-user evidence. See `docs/reviews/accessibility-review.md` and `docs/handovers/ux-accessibility-lead.md`.
- Privacy and security: the current build remains limited to controlled synthetic demonstrations. Local state hardening, production administration gating, request limits, security headers, the persistence guard test and the production dependency finding are complete. Next, add real edge controls and authentication, verify platform logs, strengthen the content security policy and complete a DPIA before any real data use. See `docs/reviews/privacy-threat-model.md` and `docs/handovers/privacy-security-reviewer.md`.

### Clinical safety and NHS governance

Review and staged roadmap complete. No compliance claim is made. See `docs/reviews/clinical-safety-review.md`, `docs/nhs-governance-roadmap.md` and `docs/handovers/clinical-safety-reviewer.md`.

### AI retrieval and adversarial testing

The independent AI and RAG implementation review is complete. It found that evidence ID validation does not establish semantic grounding, most generated fields bypass citation checks, evidence selection is client-controlled, the paid route has only process-local abuse controls, and no model evaluation suite exists. Keep the provider-backed coach disabled for public, patient, and participant use. See `docs/reviews/ai-rag-review.md` and `docs/handovers/ai-rag-engineer.md`. Adversarial testing status must be tracked separately and must not be inferred from the AI review.

### Red-team status

Adversarial testing is complete for local production HTTP, domain logic, API input validation, local storage interaction and server-rendered output. Confirmed defects in evidence promotion, duplicate and oversized citation IDs, safety synonyms, JSON content type, deletion persistence, non-finite calculations, pre-hydration disclosure, skip-link visibility, developer-link gating and freshness checking were fixed. `npm test` passes with 27 Vitest tests, a production build and 2 rendered HTML tests. TypeScript and evidence freshness pass. Lint has 0 errors and 2 image optimisation warnings.

The remaining release blockers are semantic claim entailment, server-owned retrieval, edge abuse controls, real admin authentication, live model contract tests, a stronger content security policy and human accessibility plus physical mobile verification. Security headers were added after the red team run and are asserted in rendered output tests. Keep the provider-backed coach disabled and keep `ENABLE_DEV_ADMIN=false` on public deployments. See `docs/reviews/red-team-report.md` and `docs/handovers/adversarial-tester.md`.

## Handover maintenance rule

Every specialist must update their role file before stopping. The primary agent must update this file after code, evidence status, test results, deployment assumptions or governance decisions change. Never delete unresolved risks from a handover. Mark them resolved with the evidence that closed them.
