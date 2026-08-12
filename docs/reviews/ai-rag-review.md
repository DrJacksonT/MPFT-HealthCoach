# Independent AI and RAG Engineering Review

**Review date:** 12 August 2026
**Scope:** Implemented AI request path, deterministic evidence repository, API routes, provider configuration, telemetry, privacy controls, prompt injection defenses, cost accounting, and tests.
**Disposition:** Do not enable the generative coach for public, participant, or patient use. The implemented path is suitable only for a controlled synthetic demonstration with the API key absent.

This is an implementation review, not a clinical safety case, penetration test, data protection approval, model evaluation, or evidence verification.

## Executive decision

The application does not implement a defensible grounded generation system. It implements client-selected evidence injection followed by structured generation. The server confirms that returned claim IDs belong to an eligible set, but it does not confirm that the claim is supported by the cited record. It also does not apply citation checks to most generated fields.

The most serious defect is false grounding. A response can pass every implemented check while putting an unsupported health statement in `summary`, `why_relevant`, `limitations`, or `coaching_question`. Even text inside `claims` can cite a real eligible ID while contradicting or overstating its source. This is citation validity, not claim validity.

The second major defect is an inadequately protected paid endpoint. Anyone who can reach `/api/coach` can supply any eligible evidence IDs and spend the configured OpenAI account. A recent in-memory IP counter and `Content-Length` check reduce simple local abuse, but there is no authentication, durable edge limit, request budget, concurrency limit, short timeout, or circuit breaker.

## Implemented flow inspected

1. The browser computes six profile-ranked evidence records in [`src/ui/CoachApp.tsx`](../../src/ui/CoachApp.tsx), then submits their IDs, free text, intention, importance, and confidence.
2. [`app/api/coach/route.ts`](../../app/api/coach/route.ts) parses the request, applies an English keyword classifier, and rehydrates eligible records through `findEvidence`.
3. [`src/ai/coach.ts`](../../src/ai/coach.ts) places the message, context, and evidence excerpts into one user message and calls `responses.parse` with a Zod output format.
4. Application code verifies only that every item in `claims` has at least one ID and that each ID is in the request-specific allowed set.
5. The route returns every rehydrated record as a citation, whether or not the model cited it.
6. [`src/telemetry/store.ts`](../../src/telemetry/store.ts) stores content-free token, latency, model, estimated cost, and success fields in process memory.
7. If no API key exists, `generateCoachReply` silently uses a deterministic template.

This is not query retrieval in the usual RAG sense. The question is not used to retrieve evidence. The browser sends records ranked from selected profile tags, and the caller can replace those IDs directly.

## Findings summary

| ID | Severity | Finding | Consequence |
|---|---|---|---|
| AI-01 | Critical | Evidence ID membership is mistaken for semantic grounding | Unsupported or contradictory health claims can appear valid |
| AI-02 | Critical | Four generated fields bypass evidence validation | Factual claims and advice can be uncited |
| AI-03 | High | Retrieval is client-controlled and not question-aware | Irrelevant evidence can be presented as relevant |
| AI-04 | High | The schema constrains shape, not safe meaning | Empty, misleading, directive, or overconfident output is valid |
| AI-05 | High | Claim certainty is generated rather than derived | Displayed certainty can conflict with source metadata |
| AI-06 | High | The route returns all supplied citations | Citation presence can falsely imply support |
| AI-07 | High | The no-key fallback claims relevance it does not calculate | Deterministic output can still mislead |
| AI-08 | Critical | Keyword routing is treated as a safety and injection boundary | Common variants, other languages, and mixed-intent messages reach the model |
| AI-09 | Critical | Real health or identifying text can be sent to OpenAI | Warning text is not data minimisation or access control |
| AI-10 | Critical | The paid coach route has only process-local abuse controls | Cost exhaustion and service degradation remain straightforward |
| AI-11 | High | Model behavior and resource use are underconfigured | Silent behavior drift, long waits, retries, and cost variance |
| AI-12 | High | Failure categories collapse into HTTP 422 | Operations cannot distinguish bad input, refusal, timeout, provider failure, or grounding rejection |
| AI-13 | High | Cost telemetry is materially incomplete | Cached input, cache writes, failed billed calls, and unknown models are miscosted |
| AI-14 | High | Telemetry access is environment-gated but unauthenticated and process-local | It is neither a safe admin surface nor reliable monitoring |
| AI-15 | Critical | There is no model or grounding evaluation suite | No evidence supports safety, faithfulness, or subgroup performance claims |
| AI-16 | High | Prompt, model, evidence, and schema versions are not bound to output | A result cannot be reproduced or tied to an approved release |
| AI-17 | Medium | Request size and ID canonicalisation are incomplete | Oversized IDs, duplicates, and wasteful payloads are accepted |

## Detailed findings

### AI-01: Eligible evidence IDs do not establish entailment

[`src/ai/coach.ts:29`](../../src/ai/coach.ts) parses output and lines 30 to 31 check only that each claim has an allowed ID. There is no comparison between claim text and the cited `patientFriendlySummary`, `mainFinding`, population, comparator, outcome, timeframe, or limitations.

Examples that would pass the current check include:

- A claim that reverses the direction of effect while citing the real record.
- A population claim rewritten as an individual prediction.
- A relative effect presented as an absolute probability.
- A general option statement rewritten as a personal treatment choice.
- A conclusion that omits a source limitation and materially changes meaning.

**Required change:** generated health claims must not be patient-facing in the first governed version. Render approved claim text directly from the evidence repository and let the model generate only bounded reflective coaching language. If generated paraphrases are retained later, require a claim-by-claim entailment gate against immutable source excerpts, a prespecified suppression threshold, adversarial evaluation, and human approval of the evaluated release.

### AI-02: Most output fields bypass citation validation

The schema has five top-level content areas: `summary`, `why_relevant`, `claims`, `limitations`, and `coaching_question`. Only `claims[*].evidence_ids` is checked. A model can therefore put factual health content or treatment direction into any of the other four fields and return `claims: []`.

**Required change:** redesign the contract so every generated unit has an explicit type and policy. A safer initial contract is:

- `response_mode`: `coaching`, `insufficient_evidence`, or `boundary`.
- `reflective_summary`: no new factual content, checked for prohibited advice.
- `approved_claim_ids`: identifiers for immutable application-rendered claims, not model-written claims.
- `limitations_ids`: application-owned limitations.
- `coaching_question_id` plus bounded slots, or a generated question evaluated under a separate non-factual policy.

Do not rely on field names to constrain semantics.

### AI-03: The server does not retrieve evidence for the question

The browser ranks records from profile tags at [`src/ui/CoachApp.tsx:33`](../../src/ui/CoachApp.tsx). It then submits those IDs at line 65. The server accepts any six eligible IDs. The message is not used for selection, and the server does not recompute profile relevance.

An external caller can ask about cravings while supplying only medicine records, or ask an unrelated question while supplying records that make a desired answer easier to induce. Eligibility limits the corpus, but it does not establish relevance.

There are also two ranking implementations: `rankEvidence` in [`src/data/evidence.ts`](../../src/data/evidence.ts) and duplicate browser logic in `CoachApp.tsx`. Only the browser copy drives the coach, so these can drift.

**Required change:** make the server authoritative. Accept a bounded intent code rather than arbitrary evidence IDs for the first version. Select evidence server-side from a versioned policy. If free text remains, classify it into a reviewed intent taxonomy and return `insufficient_evidence` when the approved claim set does not cover that intent. Log only non-content policy outcomes.

### AI-04: Structured output is not semantic safety

[`src/ai/schemas.ts`](../../src/ai/schemas.ts) applies maximum lengths and enum shapes. It does not require non-empty summary text, a limitation, a coaching question, or any claim. It does not prohibit diagnosis, personal recommendations, numbers, URLs, medication selection, urgency claims, or fabricated organisations inside strings.

Official OpenAI documentation confirms that `responses.parse` with `zodTextFormat` returns parsed data in `output_parsed`. That feature enforces the requested structure. It does not verify clinical accuracy or evidence entailment: [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

**Required change:** treat schema validation as decoding only. Add deterministic post-generation policies, typed response modes, prohibited-content tests, and application-owned claims. Handle refusal and incomplete output explicitly before accepting a result.

### AI-05: Certainty is not bound to evidence metadata

The model generates `certainty` as `high`, `moderate`, or `limited`. The code verifies neither equality with the cited records nor a conservative aggregation rule when multiple records are cited. A claim citing a moderate record can be labelled high. A multi-source claim can select any certainty without explanation.

**Required change:** remove certainty generation. Derive it in application code from the exact approved claim record. If multiple sources support one approved claim, use a documented synthesis rule owned by the evidence team.

### AI-06: Citation rehydration overstates support

[`app/api/coach/route.ts:17`](../../app/api/coach/route.ts) returns citation metadata for every rehydrated evidence record, not only IDs actually used in accepted claims. The UI prints raw IDs beside claims and then shows all citation links as a separate list.

This creates a citation halo. A user can see several reputable sources even when the response contains no claim or cites only one.

**Required change:** return only citations referenced by accepted, application-owned claim IDs. Preserve a direct per-claim link. Reject duplicate IDs, preserve a deterministic order, and never use a source list as a substitute for claim-level support.

### AI-07: The fallback is not relevance-grounded

When the API key is absent, [`src/ai/coach.ts:6`](../../src/ai/coach.ts) maps the first two supplied records to claims and says that reviewed evidence relates to the question. Those records were ranked for the profile, not the question. The only question interpretation is a regular expression for `crav` or `trigger`.

The route records this as a successful request with model `approved-template`, but the user-facing response does not expose which mode was used. No test covers the fallback.

**Required change:** use intent-specific reviewed templates and approved claim IDs. If no intent matches, say that the prototype does not have a suitable answer. Expose `response_mode` and `generator_version` to the UI and telemetry. Never claim relevance unless the selection policy computed it.

### AI-08: Safety and injection routing is a brittle keyword filter

[`src/domain/safety.ts`](../../src/domain/safety.ts) uses seven English regular expressions. Tests cover 75 simple prefixed phrases, but the classifier is not evaluated against paraphrase, spelling variation, Unicode punctuation, negation, euphemism, other languages, mixed intent, quoted text, or multi-turn context.

Prompt injection handling is especially weak. Only a few phrases are blocked. Variants such as requests to disclose rules, translate hidden text, follow text in evidence, simulate another role, or encode the prompt can pass. The system instruction says message and evidence are untrusted, which is useful context but not an enforcement boundary.

There are no model tools, web access, database writes, or conversation history, so direct exfiltration scope is limited. The remaining risk is still material: injection can alter generated health language, suppress caveats, or produce an apparently grounded recommendation.

**Required change:** disable open free text for the governed first version. If retained in a synthetic experiment, use a reviewed intent allowlist, input canonicalisation, output safety policy, multilingual test corpus, model red-team suite, rate limiting, and fail-closed handling. The classifier must be described as scope routing, never triage.

### AI-09: Privacy control is warning-based

The UI asks users not to enter names, contact details, or real clinical history, but the endpoint accepts them. The full message is sent to OpenAI with small structured context. There is no authentication, consent state, DLP/redaction, deployment allowlist, logging verification, or environment kill switch beyond absence of an API key. `Cache-Control: no-store` on the HTTP response prevents response caching in compliant intermediaries, but it does not govern provider retention or upstream request logging.

`store: false` is correctly set, but it is not a zero-retention guarantee. Current OpenAI documentation states that `/v1/responses` is not used for training, has abuse-monitoring retention by default, is eligible for Zero Data Retention subject to limitations, and has no application-state retention when `store: false` outside documented exceptions. Contract, organisation, project, region, and endpoint settings still need verification: [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

**Required change:** keep provider calls disabled outside an approved environment. Before any real input, complete the DPIA and supplier controls, verify project-level retention and regional processing, prohibit provider training and secondary use contractually, inspect platform logs, and implement minimisation. Do not present a text warning as prevention.

### AI-10: The paid route is open to cost abuse

`/api/coach` has no session requirement, origin policy, bot defense, per-user quota, global spend ceiling, concurrency cap, or circuit breaker. It now has a 20 request per 10 minute IP counter stored in a module-level `Map` and a 12,000 byte check based on the caller's `Content-Length` header. These are not dependable edge controls. Each isolate has separate counters, restarts erase state, proxy trust is not documented, attacker-supplied or rotating addresses can evade the limit, expired keys are not swept, and a missing or chunked `Content-Length` bypasses the body check. Each of six evidence ID strings is also unbounded.

**Required change:** for a controlled demo, require authenticated staff access and an environment-level allowlist. Add edge rate limits, a small body limit, ID length and format validation, per-session and global quotas, concurrency control, request deadlines, and a provider spend alert. Keep a hard AI kill switch independent from the provider key.

### AI-11: Model configuration is not release-grade

The model is any string from `OPENAI_COACH_MODEL`, with `gpt-5.6-luna` as the default. There is no allowlist, capability check, release manifest, explicit reasoning effort, output token ceiling, short timeout, or retry policy.

The installed OpenAI SDK defaults to a 10 minute timeout and two retries. That is inappropriate for an interactive edge route and can multiply latency and spend during provider problems. GPT-5.6 Luna defaults to medium reasoning when effort is omitted. Current official documentation lists structured output support and current prices of USD 0.20 per million input tokens and USD 1.20 per million output tokens: [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna). Terra is currently USD 2.00 and USD 12.00: [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra).

**Required change:** allow only evaluated model configurations. Record provider, exact model identifier available to the account, reasoning effort, prompt version, schema version, timeout, retries, output ceiling, evidence version, and deployment region in a release manifest. Use a short deadline and at most one carefully justified retry. A model change must fail deployment until the evaluation suite passes.

### AI-12: Failure handling hides the cause

The route catches JSON errors, schema errors, provider authentication failures, rate limits, timeouts, refusals, incomplete output, parse failures, evidence ID failures, and internal defects in one block. Every case returns HTTP 422 with the same user text.

This is not operationally actionable. HTTP 422 suggests a semantically invalid client request even when the provider is unavailable. Usage is recorded as zero for every failure, although a provider response rejected locally may still incur cost.

**Required change:** define internal failure codes such as `invalid_request`, `boundary`, `no_evidence`, `provider_timeout`, `provider_rate_limit`, `provider_refusal`, `incomplete_output`, `schema_failure`, `grounding_failure`, and `internal_failure`. Return safe user messages, correct status classes, `Retry-After` where appropriate, and content-free diagnostic telemetry. Never automatically retry semantic, refusal, or grounding failures.

### AI-13: Cost estimates ignore current billing detail

The hard-coded headline prices match the current official Luna and Terra pages on the review date. The calculation still treats every input token as uncached input and ignores `input_tokens_details.cached_tokens` and `cache_write_tokens`, despite those fields being present in the installed SDK. It records no reasoning-token detail, billed failed attempts, retry count, or provider request ID. Unknown models are priced at zero, which reports a false zero rather than an unknown cost.

OpenAI's current GPT-5.6 guidance says cache writes and cached input have distinct prices and recommends tracking cache detail: [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model).

**Required change:** store effective-dated price components and calculate uncached input, cached input, cache writes, and output separately. Mark unknown cost as `null` with an alert. Track attempts and local rejection after provider billing. Reconcile sampled application totals against provider billing exports before using cost figures in a business case.

### AI-14: Telemetry is neither protected nor reliable

`/api/telemetry` and the admin layout return 404 in production unless `ENABLE_DEV_ADMIN=true`. This is safer than unconditional publication, but it is not authentication. The routes are open in development and become open in production when the flag is enabled. The API returns the last 20 timestamps, model identifiers, token counts, latency, success state, and costs. This is content-free, but it still exposes operational activity.

The store is an in-memory array limited to 500 events. In an edge deployment, each isolate can have different state and can reset at any time. A page render and an API call can observe different processes. Averages omit safety-boundary requests, show fallback latency as zero, and contain no percentiles or outcome categories.

**Required change:** remove telemetry and admin routes from public builds. For controlled development, authenticate them. Later use an approved content-free metrics sink with environment, route, response mode, prompt/model/evidence versions, outcome code, token detail, latency histogram, and cost confidence. Do not add prompt, profile, claim text, or evidence excerpts.

### AI-15: No evaluation supports the AI path

The unit suite never calls or mocks `generateCoachReply`, never tests `coachOutputSchema`, and never invokes the API route. There are no tests for hallucinated valid IDs, contradictory paraphrases, factual text outside `claims`, certainty mismatch, irrelevant retrieval, provider refusal, incomplete responses, retries, timeouts, body size, duplicate IDs, public abuse, cost arithmetic, or telemetry isolation.

The 75 phrase safety corpus checks direct regular expression matches. It is not an AI safety or clinical grounding evaluation.

**Required change:** create a versioned offline evaluation set before enabling provider calls. It must include supported, insufficient-evidence, out-of-scope, emergency, self-harm, symptoms, pregnancy, medicines, personal-data, prompt-injection, Unicode, multilingual, adversarial citation, and model-failure cases. Predefine pass thresholds, require zero critical recommendation or emergency-routing failures, review failures manually, and rerun on every model, prompt, schema, evidence, SDK, or safety-policy change.

### AI-16: Outputs have no reproducible release identity

The result returns model and usage internally, but the API response omits model, prompt version, schema version, evidence revision, and generator version. Evidence records can change under a stable ID. Prompt text is an unversioned string in source. Telemetry does not bind those versions together.

**Required change:** maintain immutable content revisions and a release manifest. Every response should be traceable internally to environment, application release, provider, model configuration, prompt version, schema version, evidence set hash, selected claim IDs, policy version, and outcome code. Do not expose sensitive internals to the user.

### AI-17: Request canonicalisation is incomplete

`evidenceIds` allows six strings but has no per-ID maximum, pattern, uniqueness rule, or non-empty rule. Duplicate eligible IDs create repeated evidence prompt content and duplicate citations. There is no explicit content-type check. The route checks declared `Content-Length`, but it does not enforce the number of bytes actually read when that header is absent or inaccurate.

**Required change:** use a strict evidence ID pattern, a small maximum length, deduplication, and an explicit body-size limit. Reject unknown fields if the contract is intended to be closed. Prefer not accepting evidence IDs from the client at all.

## Required change sequence

### P0: before any externally reachable demonstration

1. Disable the provider-backed free-text coach by default and require an explicit server-side demo enable flag.
2. Protect `/api/coach`, `/api/telemetry`, and admin pages with staff-only access or omit them from the build.
3. Add edge rate limits, body limits, quotas, a short timeout, bounded retries, and an AI kill switch.
4. Stop generating factual health claims. Return application-owned approved claim IDs and render approved text server-side.
5. Make retrieval server-authoritative and intent-based. Do not accept arbitrary evidence IDs from the caller.
6. Separate invalid input, boundary, provider, refusal, incomplete, parsing, and grounding outcomes.
7. Add tests for the no-key template, schema, route, evidence selection, output policy, and cost calculation.

### P1: before any study involving self-entered data

1. Complete the privacy, contractual, regional-processing, retention, and logging controls for the provider project.
2. Build the versioned evaluation corpus and prespecified acceptance thresholds.
3. Add a release manifest for model, reasoning, prompt, schema, evidence, and policy versions.
4. Implement content-free durable telemetry with cache-aware cost accounting and billing reconciliation.
5. Run multidisciplinary review of every failure class and fallback path.
6. Demonstrate that prompt and profile content do not appear in application, platform, CDN, or observability logs.

### P2: before considering generated factual claims

1. Define the exact patient benefit that requires generation rather than approved text.
2. Build claim-level entailment and contradiction evaluation against immutable excerpts.
3. Validate population, comparator, outcome, timeframe, effect type, and limitation preservation.
4. Test subgroup and language performance, adversarial inputs, refusal behavior, and provider changes.
5. Obtain evidence-owner and Clinical Safety Officer approval of thresholds and residual risk.
6. Keep a deterministic suppression path for every low-confidence or unsupported result.

## Minimum test matrix

| Layer | Required cases |
|---|---|
| Request schema | Empty and oversized message, oversized ID, duplicate ID, unknown field, invalid JSON, wrong content type, excessive body |
| Retrieval | Unknown, stale, superseded, changed, duplicate, irrelevant, empty, clock boundary, server recomputation |
| Output schema | Empty strings, no claims, too many claims, no limitations, invalid certainty, refusal, incomplete output |
| Grounding | Correct entailment, contradiction, overgeneralisation, individual prediction, number conversion, omitted limitation, multi-source claim |
| Safety | Paraphrase, Unicode punctuation, misspelling, euphemism, negation, mixed intent, quoted crisis text, multiple languages |
| Injection | Rule disclosure variants, encoded instructions, role simulation, evidence-data injection, caveat suppression, citation laundering |
| Provider | Authentication, rate limit, timeout, retry, connection reset, refusal, malformed response, model unavailable |
| Privacy | Identifier input, clinical history, log inspection, trace/header handling, retention configuration, deletion claims |
| Cost | Uncached input, cache hit, cache write, output/reasoning tokens, retry, rejected billed output, unknown model |
| Operations | Kill switch, budget limit, concurrent load, telemetry isolation, rollback, model and prompt version change |

## Disagreements with existing architecture and documentation

1. The label `grounded_coach_response` is not justified. The code validates identifiers, not grounding.
2. The documented request path says it retrieves evidence. In practice, the browser selects evidence and the server filters eligibility.
3. The statement that every factual claim must cite evidence is only a prompt instruction. Four generated fields have no citation structure.
4. The phrase `approved-template` overstates the fallback. No approval artefact or template test exists.
5. The claim that telemetry provides cost metrics is too broad. It is a volatile per-process estimate that ignores cache billing and some failed cost.
6. A lower-cost model is not an acceptable default merely because the task is short. Model selection must follow measured grounding and safety performance.
7. Structured output should not be described as a safety control beyond syntax and enum conformance.
8. No-vector-store is a reasonable corpus-size choice, but it does not solve relevance, entailment, versioning, or publication governance.

## Assumptions

1. The code inspected on 12 August 2026 is the deployed candidate. No separate gateway controls were visible. The route's in-memory rate counter and declared-length check are the only observed local resource controls.
2. The OpenAI organisation has standard retention unless project evidence proves Zero Data Retention or Modified Abuse Monitoring.
3. `OPENAI_COACH_MODEL` can be changed by deployment configuration without a code review.
4. No hidden evaluation set, provider mock suite, prompt registry, or release manifest exists outside the repository.
5. The public UI and API may be reachable independently, so browser constraints do not protect the server.
6. Evidence records are trusted application data today, but future administration or import could make evidence text an injection surface.
7. The app is intended for England and English language use, but public users could submit other languages.
8. Other agents may be changing privacy or infrastructure code concurrently. This review reports the implementation observed at the review time.

## Major risks

- **Critical:** a false health statement cites a genuine source and is accepted as grounded.
- **Critical:** crisis, symptom, pregnancy, or medicine content bypasses keyword routing and receives conversational coaching.
- **Critical:** real health and identifying data reaches a supplier without approved governance and verified retention controls.
- **Critical:** an unauthenticated caller exhausts the API budget or degrades the service.
- **High:** a model, prompt, or evidence change silently invalidates prior evaluation.
- **High:** telemetry reports false cost confidence and hides provider failures or billed rejected outputs.
- **High:** reputable but irrelevant citations create unwarranted user trust.
- **High:** process-local monitoring masks errors across an edge deployment.

## Validation performed

- `npm run test:unit`: passed, 1 file and 16 tests after the concurrent privacy hardening patch.
- `npm run lint`: exited successfully with two `no-img-element` warnings in `src/ui/CoachApp.tsx`.
- `npx tsc --noEmit`: failed. `db/index.ts` uses a generated `Env` type with no `DB` property. `src/data/evidence.ts` also declares `lastVerifiedDate` and `superseded` twice in the same object literal at lines 41 and 44. The latter is in the reviewed evidence boundary and means the current repository does not type-check.
- Installed OpenAI SDK types were inspected. `ResponseUsage` includes cache write, cached input, and reasoning token detail that the current telemetry drops.
- Installed OpenAI SDK defaults were inspected. The client default is a 10 minute timeout with two retries.
- No live model call was made. There is no safe basis to spend the configured account or submit repository prompts to the provider as part of this review.

## Confidence

**Overall confidence: high, 0.93, that the current implementation is not safe or adequately evaluated for public or participant use.**

- High confidence in the identifier-versus-entailment gap, uncited-field gap, client-controlled selection, inadequate abuse controls, failure collapsing, telemetry limitations, and test gaps. These are direct code observations.
- Moderate confidence in exact runtime timeout and retry effects on Cloudflare because platform cancellation may impose a shorter external limit.
- Moderate confidence in the project-specific OpenAI retention position because organisation and project controls were not available.
- Low confidence in any claim about the model's actual grounding performance because no representative evaluation results exist.

## What is most likely wrong in this review?

1. A deployment gateway may already enforce authentication, rate limits, request size, and route exclusion outside the repository. If so, those controls must be linked and tested rather than assumed.
2. The OpenAI project may have approved Zero Data Retention and regional processing. `store: false` alone does not prove that position.
3. Cloudflare may terminate requests well before the SDK's 10 minute timeout, reducing wait time but replacing it with an uncontrolled platform failure.
4. GPT-5.6 Luna may perform well on this small corpus in practice. That would reduce observed error frequency, not close the missing semantic enforcement or evaluation evidence.
5. An unpublished human review may have approved the fallback text. The repository contains no versioned approval or regression evidence.
6. The eventual product may remove generated factual claims, which would materially reduce several findings. The current implementation still generates them.
7. Current model prices and data controls can change. They must be rechecked at release and must not remain hard-coded without an effective-date process.

## Authoritative external sources

- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)
- [OpenAI GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI GPT-5.6 Luna model and pricing](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [OpenAI GPT-5.6 Terra model and pricing](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
