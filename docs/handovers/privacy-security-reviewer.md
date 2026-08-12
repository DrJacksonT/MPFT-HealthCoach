# Privacy and Security Reviewer handover

## Integration update on 12 August 2026

The primary implementer completed strict browser state validation, 30 day expiry, deletion without empty state rewriting, API request limits, no store responses, production administration gating and response security headers. Rendered output tests assert anti-framing and content security policy headers. The production dependency audit reports zero vulnerabilities after a safe `ws` override.

Residual issues remain. The content security policy permits inline scripts for the current framework. Request limits are process local. The administration feature flag is not authentication. Browser storage is still unsuitable for real health data. Provider calls remain out of scope for public, patient or participant use.

**Handover date:** 12 August 2026
**Status:** Code-informed threat model complete. The current build is not approved for uncontrolled users or real participant data.

## Work completed

- Threat-modelled the actual browser, API, model, telemetry, admin, hosting, dependency and future-persistence implementation.
- Inspected local storage and deletion semantics, coach request and output paths, schemas, deterministic safety checks, OpenAI payload, application logs, admin exposure, auth helpers, database bindings, research repository stub and D1 example.
- Mapped assets, threat actors, trust boundaries, privacy flows, retention and deletion reality.
- Produced a 20-row attack and misuse table with current controls, likelihood, impact, risk and treatment.
- Defined P0, P1 and P2 changes plus 13 concrete security acceptance tests.
- Checked current OpenAI, OWASP, Cloudflare and ICO guidance.

## Artefacts

- Primary review: [privacy-threat-model.md](../reviews/privacy-threat-model.md)
- Related architecture: [product-architecture.md](../reviews/product-architecture.md)
- Related clinical safety review: [clinical-safety-review.md](../reviews/clinical-safety-review.md)
- Related accessibility review: [accessibility-review.md](../reviews/accessibility-review.md)

## Decisions that should remain stable

1. Do not expose the current build to uncontrolled users or invite real participant data.
2. The entire prototype should use a controlled hosting access policy until public abuse, privacy and clinical risks have been resolved.
3. `/admin/evidence` and `/api/telemetry` must be absent from public builds or protected by both upstream access control and explicit server-side role authorization.
4. The coach route needs byte, content-type, schema, rate, concurrency, timeout, output-token, spend and cross-site request controls. Origin checks are defense in depth, not authentication.
5. Browser storage is not confidential storage. Treat every stored envelope as hostile input, minimize it, expire it and prefer memory or session storage unless cross-session persistence is explicitly chosen.
6. The delete action must say that it deletes data from this browser. It cannot claim to delete OpenAI abuse-monitoring records, platform logs or device backups.
7. User-entered data must never inherit `synthetic: true` merely because the product is a prototype.
8. Prompt injection is assumed possible. The key safety control is low model agency plus deterministic semantic and claim-entailment validation, not a regex or system prompt alone.
9. `store: false` is useful but does not prove zero retention, NHS approval, data residency or deletion.
10. Keep future participant persistence as an interface plus always-throwing implementation only. Do not add a dormant real adapter behind one feature flag.
11. Production logging, headers, dependency state and provider settings must be explicit, tested controls rather than hosting assumptions.

## Validation and review evidence

- Local requests to `/`, `/admin/evidence` and `/api/telemetry` returned HTTP 200. The admin and telemetry routes required no authentication.
- Those local responses had no observed CSP, frame protection, `nosniff`, referrer policy or explicit cache-control headers.
- Code inspection confirmed a server-only OpenAI key, no coach tools, web or database access, minimized structured context, schema parsing, eligible evidence-ID validation, React text rendering and no application prompt logging.
- Code inspection confirmed that local storage is accepted after only a version check and written on every state change without expiry.
- Deletion removes the health-bearing key and state, but the persistence effect writes an empty envelope back. The button cannot affect supplier or platform retention.
- Application telemetry contains no prompt, profile, IP, session or local identifier, but exact recent events are public.
- The participant repository is genuinely fail-closed: no real adapter, empty schema, false compile-time constant, `d1: null` and `r2: null`.
- `npm audit --json` on 12 August 2026 reported 20 advisories: 13 high, 6 moderate and 1 low. `npm audit --omit=dev --json` still reported one high transitive `ws` advisory.
- The two untracked `.devserver` logs were inspected. One was empty and the other contained only a local server and PID conflict, but neither pattern is ignored by the repository.
- Production Cloudflare controls and OpenAI account settings were not available, so no deployment-level assurance was made.

## Unresolved risks

- Anonymous callers can abuse `/api/coach` for model spend or availability.
- A shared-device user or same-origin script can read or poison health-related local state.
- Free text can contain identifiable health information despite the warning.
- A model can attach a valid evidence ID to a claim that the record does not support.
- Obfuscated, multilingual or split prompt injection can bypass the keyword classifier.
- Public admin notes and recent telemetry disclose internal or operational information.
- Production Workers logging, access policy, WAF, rate limits and response headers remain unknown.
- OpenAI ZDR, MAM, region, contracts and project controls remain unknown.
- Known dependency advisories and beta framework posture remain untriaged for reachability.
- A future analytics or persistence change can silently turn the local demo into a centrally processing health application.

## Exact next actions for a future session

1. Verify the live hosting access policy and direct-origin behavior. Record whether anonymous access is possible and whether injected identity headers can be spoofed at the origin.
2. Remove admin and telemetry routes from public builds. If an internal deployment is required, add server-side role authorization and test unauthorized, wrong-role and direct-origin requests.
3. Harden `/api/coach` with a raw-byte limit before JSON parse, required JSON content type, strict schema, per-field limits, edge and application rate limits, concurrency cap, abort timeout, output-token cap, retry budget and spend circuit breaker.
4. Add Fetch Metadata and allowed-Origin checks to stop browser drive-by requests, while retaining authentication and rate limiting for non-browser clients.
5. Add deterministic post-generation checks for diagnosis, triage, personal medicine choice, emergency reassurance, exact personal prediction, hidden-prompt disclosure, ungrounded numbers and unsupported claim-to-evidence relationships.
6. Replace the compile-time local-state cast with a strict runtime schema, maximum serialized size, bounded arrays and values, expiry, migration and invalid-state recovery.
7. Decide whether persistence is necessary. Prefer memory or session storage for controlled demos. If local persistence remains, require an explicit choice and shared-device warning.
8. Rename and rebuild deletion as local-browser deletion with confirmation, enumerated stores, conversation clearing, no key recreation and an accurate completion receipt.
9. Remove false synthetic provenance from user-entered state and keep synthetic status only for immutable demo persona origin.
10. Replace broad landing privacy copy with an exact field-level statement before coach use. Name OpenAI processing and explain what the local button cannot erase.
11. Add production CSP, frame protection, `nosniff`, referrer and permissions policies, HSTS at the edge, and `no-store` for coach, telemetry and admin responses. Retest deployed headers.
12. Define Workers logging, sampling, retention, exports and access. Test success, validation error, timeout and exception paths for prompt, response, assessment, identifier, header, key and raw-body leakage.
13. Upgrade or formally disposition every high dependency advisory through a controlled branch. Rebuild, retest, inspect reachability and add audit, SBOM and advisory monitoring to CI.
14. Ignore `.devserver*.log`, retain `.wrangler` exclusion and add repository and build-artifact secret scanning.
15. Add a persistence architecture test that fails if a participant table, D1 or R2 binding, save route, enabled adapter or runtime enable flag appears without a separately governed release marker.
16. Before any real participant pilot, complete DPIA, supplier assurance, controller and processor analysis, lawful basis and Article 9 condition, retention, rights, incident and research governance work.

## Confidence and restart point

Confidence is high in the repository and local HTTP findings, high in the anonymous coach abuse finding, and moderate in platform logging, production headers and dependency reachability. A future session should start with the P0 list and security acceptance criteria in the primary review. First verify live edge controls, because they may reduce likelihood but do not remove the need for application-level tests.
