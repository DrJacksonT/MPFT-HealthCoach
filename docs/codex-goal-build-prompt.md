# Codex goal prompt: build the standalone pilot platform

Open a Codex task with `C:\Users\theos\Projects\MPFT AI Health Coach` as the workspace, then paste the entire prompt below. It is deliberately written as a durable build objective, not as a request for another proposal.

```text
/goal Complete the MPFT AI-assisted behaviour-change website as a secure, standalone, technically pilot-ready research platform. Build, migrate, test, visually verify and document the working product—not merely a plan, mock-up, schema, or list of recommendations. Continue autonomously through safe, in-scope implementation until every software completion criterion below is met or a genuinely external dependency is clearly isolated. Do not describe the platform as approved for real participant recruitment until the separate governance release gate has been satisfied by authorised humans.

# Mission and intended use

Turn the existing prototype into a full standalone web application that can support a properly governed feasibility pilot of AI-assisted smoking cessation coaching. Participants must be able to register, sign in, complete consent and study onboarding, record their smoking and progress over time, use evidence-grounded coaching, complete brief well-timed surveys, view their progress, obtain appropriate help, manage their account, and withdraw.

Researchers must be able to configure a study, oversee participant flow and follow-up status, review pseudonymised engagement/outcome/survey/safety data, monitor data quality and operating cost, and produce analysis-ready exports and a reproducible pilot report.

Also implement the gambling-harm module to synthetic-data/staff-simulation completeness behind a separate fail-closed feature and release gate. Smoking is the first live-study configuration. Never expose gambling coaching to live participants merely because its code exists.

The first pilot is intended to evaluate feasibility, acceptability, usability, safety, engagement, preliminary within-person outcome trends, equity and delivery cost. It is not capable of proving that the tool caused an outcome. Product wording, dashboards and generated reports must preserve that distinction.

# Start here: inspect before changing anything

Work in:

C:\Users\theos\Projects\MPFT AI Health Coach

Before implementation, inspect the current code, database layer, routes, tests, git status and existing UX. Read these files completely and treat them as the product evidence and measurement specification:

- README.md
- docs/pilot-ready-product-blueprint.md
- docs/pilot-minimum-dataset.md
- docs/evidence-source-manifest.md
- docs/nhs-governance-roadmap.md
- the relevant files under docs/reviews/
- all existing architecture, safety, evidence, testing and deployment documentation that affects this work

Read the following sibling folder as a read-only evidence source:

C:\Users\theos\Projects\AI Health Coach Research

Use the smoking-cessation and gambling-harm evidence in that folder to check intervention logic, measures, safety boundaries, escalation resources and outcome selection. Do not modify, rename or reorganise that research folder. Do not invent support from a paper, guideline or source that has not been verified.

Resolve requirements in this order:

1. This goal prompt.
2. The pilot-ready product blueprint.
3. The pilot minimum dataset.
4. The evidence source manifest.
5. Clinical-safety, information-governance and evidence-review documents.
6. Existing code and visual conventions.

If two sources conflict, choose the safer interpretation, document the conflict and decision in an architecture decision record, and continue with all unaffected work.

# Authority, limits and working method

You are authorised to make the local code, schema, migration, dependency, test, configuration, synthetic seed-data and documentation changes needed to complete this objective. You may make reasonable reversible implementation decisions without waiting for routine confirmation. Record material choices and their trade-offs.

You must:

- Preserve unrelated user changes. The existing blueprint, minimum-dataset and evidence-manifest files are intentional work, not disposable generated files.
- Inspect before rewriting and extend the current Next.js/React/TypeScript/Drizzle architecture unless a change is demonstrably necessary.
- Use migrations for persistent schema changes. Never destroy a real or unknown database to make development easier.
- Use only fictional/synthetic people and data in development, screenshots, tests, demonstrations and seeds.
- Keep secrets out of source control and keep `.env.example` non-secret.
- Run tests frequently and repair regressions as you go.
- Make every visible control functional, or omit it. Do not ship dead buttons, false status indicators or placeholder links.
- Maintain a concise implementation log/checklist so work survives context compaction.

You are not authorised to:

- Push or merge code, create a pull request, deploy externally, buy services, send real email/SMS, contact people or enrol participants without explicit user approval.
- Modify the research repository.
- Use real participant, patient or staff data.
- Claim MPFT, NHS, ethics, sponsor, clinical-safety, information-governance or regulatory approval.
- Claim that a clinician is monitoring participants unless a named, resourced operating model has actually been configured and approved.
- Make autonomous diagnosis, prescribe treatment, change medication, provide individual prognosis, or represent the coach as emergency/crisis care.

When credentials, external services or human governance decisions are unavailable, build and test a safe local/staging implementation or adapter, keep the live capability disabled by default, document the exact external dependency, and continue completing all unaffected software. An external approval blocker must not become an excuse to stop building the product.

# Definition of standalone

This is initially its own website and data service. It must not depend on ChatGPT accounts, an EHR, NHS login, clinical-record integration or another host product. It needs its own secure participant authentication, study database, staff portal and research exports.

Prefer the existing framework and a production-capable PostgreSQL data model. Provide a reproducible local environment—such as Docker Compose for PostgreSQL and any local-only mail catcher—with deterministic migrations and synthetic seeding. A simpler test database is acceptable only if production and test behaviour remain aligned.

Create provider interfaces for optional future services, but do not make current core workflows depend on them. Development email verification and password-reset messages may use a local mail catcher. Production email must remain configurable and disabled until a real provider, privacy review and domain configuration exist.

# Product principles that must be visible in the build

- Research tool, not routine clinical care.
- Evidence-grounded structured support with an optional AI layer, not an autonomous clinician.
- The structured non-chat route must support all essential actions when AI is unavailable or a participant declines it.
- Mobile-first, accessible, calm, plain-English and low burden.
- Never require repeated re-disclosure of distress to navigate to help.
- Missing data is unknown, not success or failure.
- A recorded event means only what its definition says. A page view is not engagement; engagement is not improvement; improvement is not causation.
- Use neutral, non-stigmatising wording. Lapse and relapse handling must be compassionate and recovery-oriented.
- Clearly distinguish urgent help, clinical support, technical support and research-team contact.
- Participant-facing pages must show the study/research status and the limits of monitoring in concise language.

# Required system architecture

## Identity, authentication and access

Implement secure standalone registration and authentication:

- Invitation-enabled participant registration, login, logout, session expiry and revocation.
- A study-configurable choice of email-based registration or a lower-PII participant alias/invitation route.
- Secure password hashing using a current password-hashing algorithm such as Argon2id.
- HttpOnly, Secure-in-production and appropriate SameSite session cookies.
- CSRF protection for state-changing requests, session rotation after authentication/privilege change, brute-force/rate-limit protection and safe generic authentication errors.
- Email verification and one-time password reset when email is enabled; local mail capture for development and tests.
- Recovery and staff-assisted account procedures that do not reveal health data.
- Server-enforced role-based access control for participant, researcher, safety reviewer, evidence/content reviewer and administrator roles.
- Stronger authentication for staff/admin accounts, using MFA or an explicitly documented fail-closed second-factor adapter before production staff access.
- Separate layouts and route boundaries for participant and staff experiences.
- Audit all successful and failed privileged access and all data exports.

Separate contact/authentication identity from pseudonymised research data. Use an internal participant UUID and study participant code; never put email, health information or raw database identifiers in URLs, analytics or AI prompts. Encrypt sensitive data at rest where the chosen platform permits, and document field-level protection for contact details and free text.

## Study and release configuration

Build explicit, versioned configuration for:

- study/protocol identifier and version;
- recruitment open/closed state;
- module enabled state;
- intervention condition and feature flags;
- assessment schedule and windows;
- consent, participant-information and privacy-notice versions;
- AI model/prompt/corpus/rules release;
- live-pilot authorisation state;
- emergency/support resources by geography;
- raw-text storage consent and retention settings;
- survey schedule and sampling rate;
- target enrolment and study dates;
- staff roles and monitoring model.

Real participant registration and live AI coaching must be fail-closed. Require both an environment-level live-pilot flag and a database release record containing named/dated authorised approvals before opening recruitment. Development and synthetic demonstration modes must be unmistakably labelled and must not weaken production checks.

Create a release manifest linking the deployed commit/build, database migration, protocol, consent wording, evidence corpus, prompt, model, deterministic safety rules, survey versions and study configuration.

# Required participant experience

Implement complete, responsive participant journeys with accessible validation, progress saving, resume-later behaviour and sensible back/edit paths:

1. Public landing and study-information pages.
2. Eligibility prescreen with neutral ineligible/not-yet-eligible outcomes and appropriate alternative-support signposting.
3. Registration, verification and login.
4. Versioned participant information and granular consent.
5. Baseline assessment and initial goal/route selection.
6. Participant dashboard showing the next best action, current goal, recent progress, due assessments and quick-help access.
7. Evidence library and evidence-detail pages with human-readable sources and review status.
8. Personal plan builder and editable goals.
9. Brief check-ins with a low-burden default and optional extra detail.
10. Progress views that show observed data, missing periods and trends honestly.
11. Structured coaching tools plus optional evidence-grounded AI conversation.
12. Immediate help and coping-plan routes that work without invoking AI.
13. Brief embedded feedback surveys and scheduled follow-up assessments.
14. Support/referral resources and recording of whether an offered referral was accepted or used.
15. Account settings, privacy/consent choices, accessible data copy/export request, withdrawal and deletion/request-to-restrict procedures.
16. Clear research-team, technical-support, urgent-help and complaints/contact routes.

Do not make chat the homepage or the only way to progress. Give participants a coherent product even if the AI provider is unavailable for the entire visit.

# Smoking-cessation module: first pilot

Implement the smoking module as the default technically complete pilot path, using the blueprint and minimum dataset as the authoritative measurement specification.

Baseline must support, with prefer-not-to-answer where appropriate:

- current smoking status;
- cigarettes per day and recent smoking days;
- time to first cigarette or other approved dependence measure fields;
- years smoked and previous quit attempts where approved;
- route choice: quit, reduce, or understand/preparation;
- target date and participant-defined goal;
- current cessation support, behavioural support and pharmacotherapy categories without giving medication advice;
- confidence, motivation and key contextual variables required by the dataset/protocol;
- consented demographic/equity fields using minimisation and explicit prefer-not-to-answer options.

The participant must be able to:

- set and revise a smoking goal;
- record a very brief daily check-in, including cigarettes smoked, smoking/abstinence state, urge/craving, confidence and support used where scheduled;
- record a participant-confirmed lapse, return to smoking or plan revision compassionately;
- see daily and weekly observed trends without interpolating missing days;
- receive structured evidence-grounded coping options;
- use a quick “I might smoke” or equivalent immediate-support flow;
- record referral/support uptake;
- complete protocol-defined 4-week, 12-week and other configured follow-ups.

Calculate and expose prespecified outcomes from immutable source data, including the protocol-approved primary smoking outcome, point-prevalence/continuous-abstinence fields where collected, cigarettes-per-day change, quit attempts, treatment/support uptake and biochemical-verification status where the operating model permits. Keep self-report and biochemical verification distinct. Never infer abstinence from silence, missing check-ins, app inactivity or chatbot text.

# Gambling-harm module: built but separately gated

Implement the gambling module to a complete synthetic/staff-simulation standard using its evidence sources, but set it disabled for live participant studies by default. It requires its own protocol, outcome-measure choice, corpus review, hazard review, emergency/financial-help content, operating model and release approval.

Support configurable, licensed/approved measure definitions rather than hard-coding unverified claims about scale validity. Keep screening/risk-characterisation measures separate from responsive short-interval outcome measures.

The module should be capable of collecting, where approved:

- gambling days and episodes;
- money staked, expenditure/loss fields with clear definitions and currency;
- urge intensity and chasing behaviour;
- participant-defined goals and protective actions;
- access to money/blocks and financial-protection steps;
- treatment/referral uptake;
- distress and other protocol-defined harm indicators;
- baseline and scheduled follow-up measures.

Provide a deterministic immediate “I am about to gamble” support route. The coach must never provide gambling strategies, odds optimisation, ways to bypass blocks, debt products or financial advice. Deterministic safety routing must handle acute distress, suicide/self-harm language, coercion/abuse, severe financial harm and other approved hazards before any generative output. Do not launch this module merely because automated tests pass.

# AI coaching implementation

Use the OpenAI Responses API through a server-only adapter if that matches the existing architecture. Keep the model name and service configuration in environment/study configuration, not hard-coded throughout the product.

The AI layer must:

- be optional and degradable to a complete structured experience;
- use only the verified active evidence corpus and approved intervention content;
- receive the minimum necessary pseudonymous context;
- have no live web browsing, general tool use, unrestricted database access or ability to take external actions;
- produce a strict structured response validated by Zod or an equivalent runtime schema;
- return approved evidence identifiers rather than inventing citations, with final titles/links/text rehydrated server-side;
- run deterministic safety/routing checks before the model and deterministic output checks after it;
- refuse unsupported clinical, medication, diagnostic, emergency, legal or financial requests and direct to the correct human/service route;
- use a reviewed static fallback when the provider times out, fails, returns invalid structure or crosses a safety boundary;
- apply input limits, timeouts, per-user and per-IP rate limits, cost limits and a study-wide spend circuit breaker;
- use `store: false` or the current provider equivalent where appropriate, while accurately documenting provider processing/retention rather than claiming “zero retention” without a valid agreement;
- record provider, model, prompt version, corpus version, rules version, latency, token usage, estimated cost, outcome category, evidence IDs, safety flags and fallback reason for every attempted interaction;
- never let participant text directly select privileged actions, database queries or arbitrary source retrieval.

Treat raw conversation content as a separate sensitive dataset. Make storage consent and retention explicit. If raw text collection is not approved, keep content-free interaction metadata and ensure the product remains useful in structured mode. Redact logs and error reporting. Never put raw health text into generic analytics.

The UI must clearly state that the coach is an automated research tool, can be wrong, is not a clinician, is not continuously monitored and is not for emergencies. Do not overrepeat warnings so heavily that the intervention becomes unusable; place concise persistent boundaries and contextual help appropriately.

# Embedded survey and participant-experience system

Build a versioned, reusable in-product survey engine rather than scattering one-off form fields across pages. It must support:

- survey definitions and immutable versions;
- question types including Likert/rating, single choice, multiple choice, yes/no, numeric and carefully controlled optional free text;
- deterministic scoring rules where a scale permits scoring;
- study/module/condition eligibility;
- event-triggered and calendar/window-based scheduling;
- configurable sampling so feedback is not requested after every message;
- display, start, answer, submit, skip, snooze and dismiss events;
- save-and-resume for longer scheduled assessments;
- prefer-not-to-answer where appropriate;
- screen-reader labels, keyboard operation, clear focus, touch-size targets and plain-language validation;
- an estimated completion time and burden tracking;
- version-aware exports and data dictionary entries.

Seed a concise pilot-specific feedback set whose wording can be edited in staff configuration. At selected meaningful moments—not after every chat—ask a maximum of a few items such as:

- How helpful was this just now? (1–5)
- How easy was it to use? (1–5)
- How relevant did it feel to what you needed? (1–5)
- How confident were you in the information? (1–5)
- Did anything feel unsafe, upsetting or misleading? (yes/no/prefer not to say)
- Would you have preferred support from a person at this point? (yes/no/not sure)
- Optional: What worked well, or what should we improve?

Also support:

- a very brief early-use pulse after the participant has had enough exposure to judge the product;
- configurable weekly acceptability/usability items at a deliberately low frequency;
- an end-of-study experience survey covering usefulness, ease, trust, burden, appropriateness, perceived support, technical problems, privacy concerns, harms/unintended effects, willingness to use again and recommendation/continuation intent;
- optional participant interview interest/contact permission kept separate from research responses;
- researcher-recorded cognitive-interview/usability-session metadata for a pre-pilot phase.

Mark custom pilot items as custom and not validated. Do not call them validated instruments or compute official scores. Add a measure registry so approved instruments such as usability, acceptability, appropriateness or feasibility measures can be configured only after the sponsor confirms wording, scoring, licensing and protocol use. Do not seed copyrighted/licensed questionnaire wording unless the local evidence pack confirms permission.

Surveys must never block access to coaching or urgent help. Allow skip/snooze, record survey non-response honestly, and measure survey burden. A response indicating that content felt unsafe must create a reviewable safety/quality record according to study configuration, but the interface must not imply real-time clinical monitoring. Immediately display the relevant human/urgent-help options when the participant indicates current danger or distress.

# Minimum data model and semantics

Implement the entities and semantics in docs/pilot-minimum-dataset.md. At minimum the production schema must cover:

- studies, study_versions and study_releases;
- auth identities, sessions, invitation records and staff roles;
- participants and separately protected contact identities;
- eligibility assessments and screen outcomes;
- participant-information, consent and withdrawal events with exact versions;
- baseline assessments;
- goals and goal versions;
- smoking check-ins and smoking follow-up outcomes;
- gambling check-ins and gambling follow-up outcomes;
- assessment schedules, windows, completions and overdue status;
- referrals/support offers, acceptance and participant-reported uptake;
- product events;
- coach interaction metadata and separately controlled raw content;
- deterministic safety events and human review records;
- evidence items, claims, source passages, review decisions and release membership;
- survey definitions, versions, questions, schedules, response instances and answers;
- system/prompt/model/corpus/rules releases;
- staff activity and access/export audit;
- cost ledger;
- data-quality issues and resolutions;
- analysis exports and derivation versions.

Use immutable UUIDs, created/occurred/received timestamps in UTC, participant timezone where needed, schema/form versions, clear enum dictionaries and idempotency keys for repeatable writes. Distinguish event time from server receipt time. Define deletion/withdrawal status without silently erasing the audit trail required by the approved retention model.

Do not overload one event or column with multiple meanings. Preserve source observations and derive outcomes reproducibly; do not overwrite raw measurements with calculated values. Every outcome needs a stated denominator, time window, missing-data rule and derivation version.

# Analytics event model

Create a content-free, versioned event taxonomy sufficient to derive participant flow and engagement. Include events such as:

- invitation opened;
- eligibility started/completed;
- information viewed;
- consented/declined/withdrawn;
- registration completed and authenticated session started;
- baseline started/completed;
- goal created/revised;
- check-in started/completed;
- structured tool started/completed;
- coach interaction requested/completed/refused/fallback;
- evidence item viewed;
- safety route shown;
- referral offered/accepted/declined/participant-reported used;
- survey displayed/started/submitted/skipped/snoozed/dismissed;
- follow-up due/completed/overdue;
- data copy requested/generated;
- account deletion or restriction requested/completed.

Define and document activation, meaningful-use, meaningful-interaction, session and retention rules. Do not use page views or message count alone as proof of engagement. Make event writes idempotent where retries could cause duplicates.

# Researcher, safety and administration portal

Build a protected staff portal with server-side RBAC and a separate navigation context. It must include:

- study setup/status and a prominent live-release gate;
- participant funnel from invitation through follow-up and withdrawal;
- de-identified participant list with due/overdue assessments and data-completeness status;
- engagement and retention summaries using prespecified definitions;
- smoking outcome trends with denominators, follow-up windows and missingness visible;
- gambling synthetic/staff-simulation results only while that module is gated;
- survey completion, item distributions, optional de-identified comments under stricter permission, and burden indicators;
- referral/support uptake;
- safety-event counts, status and authorised review workflow without implying a clinical command centre;
- equity/access summaries with small-number suppression and no unsafe cross-tabulation;
- AI reliability, refusal/fallback, latency, token and cost summaries;
- evidence review/release status and freshness;
- system release/configuration history;
- data-quality checks and exceptions;
- immutable export history and access audit.

Use synthetic data to make every dashboard state testable, including zero-state, small-number, missing-data, overdue and safety-review cases. Do not show personally identifying participant details to roles that do not need them. Suppress small cells according to configurable disclosure rules.

# Evidence administration and release governance

Retain and extend the current evidence-first model. Participant-facing claims may use only evidence that is:

- verified by an authorised reviewer;
- active and not superseded;
- within its review/freshness period;
- approved for the relevant module, audience and claim;
- linked to a source passage and review decision.

Create a staff evidence workflow that supports draft, in-review, verified, rejected, superseded and expired states; provenance; exact source locator; claim mapping; applicability; limitations; review history; and release membership. No developer, AI process or automated test may self-assign human verification. A release must fail closed if required evidence is expired, missing or unapproved.

Do not turn general associations from the literature into individual predictions. Explain uncertainty and evidence limitations in participant-friendly language.

# Safety and operating model

Implement deterministic safety routes for both participant input and model output. Use the existing reviewed safety material and module-specific hazards. Safety routing must operate even when the AI provider and database-derived personalisation are unavailable.

At minimum distinguish:

- emergency/immediate danger;
- suicide/self-harm or severe distress;
- concerning physical symptoms;
- medication/treatment questions requiring a clinician or pharmacist;
- safeguarding, abuse or coercion;
- gambling-specific acute financial harm;
- routine support/referral;
- technical/research contact;
- out-of-scope request.

Display locally configured services and make phone/link actions accessible. Do not claim the research team reviews messages in real time. If the approved study has no staffed safety-monitoring rota, the system must use immediate self-directed service signposting rather than silently queuing a record that suggests help is coming.

Provide an authorised human review workflow for safety/quality events if configured, with acknowledgement, outcome, timestamps and audit. Keep this distinct from emergency response. Document residual risks, known limitations and exactly what requires clinical-safety/governance sign-off.

# Privacy, security and reliability

Implement proportionate pilot-grade safeguards and document the threat model:

- least privilege and deny-by-default authorisation;
- validated server-side inputs and outputs;
- parametrised database access;
- XSS, CSRF, open-redirect, SSRF and injection protection appropriate to the architecture;
- CSP, HSTS in production, `nosniff`, appropriate Referrer-Policy and Permissions-Policy headers;
- no-store/private caching on sensitive routes;
- secure session and reset-token storage;
- encrypted transport and documented at-rest encryption expectations;
- secrets management and startup validation;
- rate limiting, abuse protection and account lockout safeguards that avoid denial-of-service traps;
- structured redacted logs and correlation IDs without raw health text;
- dependency/security scanning and an SBOM or equivalent inventory;
- backup/restore procedure and a tested local restore path;
- retention, withdrawal, deletion/restriction and consent-revocation jobs with auditable status;
- service health, provider failure and database failure handling;
- no participant data in client analytics, URLs, stack traces or third-party error tools;
- cost and usage circuit breakers;
- accessibility and browser support baseline.

Add an explicit data-protection design document describing controllers/processors as undecided where they have not been formally named, data flows, lawful-basis decisions still required, data minimisation, access matrix, retention categories, subject-rights handling and the external DPIA/IG decisions needed before live use. Do not fabricate completed DPIA, DCB0129, ethics or security assurance.

# Research exports and reproducible analysis

Build researcher-only CSV and JSON exports with stable schemas and a generated data dictionary. Each export must include or be linked to:

- export ID and creator;
- study, protocol and release versions;
- data cutoff and generation timestamp;
- included population/denominator rules;
- field and enum definitions;
- form/survey versions;
- outcome derivation version;
- missing-data rules;
- small-number/disclosure treatment where relevant;
- code/build identifier.

Never include contact identity in the default analysis export. Make raw text a separate high-permission export that is disabled unless explicitly approved and consented.

Create deterministic analysis code or report-generation code that can turn synthetic pilot data into a Markdown and/or HTML pilot report containing:

- participant flow and denominators;
- baseline description;
- activation, meaningful use, retention and feature use;
- survey response, acceptability/usability summaries and missingness;
- smoking outcomes over time with uncertainty and no causal language;
- gambling synthetic simulation section clearly labelled as non-live;
- safety and unintended effects;
- equity/access and digital exclusion indicators, subject to disclosure control;
- AI reliability/fallback/refusal;
- referral/support uptake;
- operating and AI cost;
- protocol, feature, evidence, prompt/model and release history;
- limitations, missing data and deviations.

For a single-arm feasibility pilot, use wording such as “observed change among participants with available follow-up” rather than “the tool caused a reduction.” Keep descriptive pilot findings separate from any later comparative-effectiveness design.

# Quality assurance and test requirements

Create or extend automated unit, integration and end-to-end tests. Test at least:

- registration, verification, login, logout, reset, session expiry and invitation controls;
- participant/staff RBAC and direct URL/API denial;
- versioned information and consent, decline, withdrawal and revoked consent;
- study/recruitment/live-release gates;
- smoking onboarding, goals, check-ins, progress and scheduled outcomes;
- honest rendering/derivation of missing smoking observations;
- gambling feature gating and deterministic safety scenarios;
- structured non-AI paths;
- AI schema validation, evidence-ID rehydration, timeout, refusal, unsafe output, cost limit and provider fallback;
- evidence eligibility, expiry, supersession and release failure;
- survey scheduling, sampling, skip/snooze, versioning, scoring and negative-feedback routing;
- referral events;
- event idempotency and analytics definitions;
- assessment windows and overdue status;
- data-quality rules;
- export permissions, stable schema and raw-text separation;
- withdrawal/deletion/retention jobs;
- staff audit and small-number suppression;
- synthetic report generation;
- mobile and desktop critical journeys;
- keyboard-only operation and automated accessibility checks on critical pages;
- secure response headers and common input attacks.

Use synthetic fixtures only. Add Playwright or the existing end-to-end framework for browser flows, and an automated accessibility checker such as axe where suitable. Avoid brittle tests that merely assert implementation details.

Run and pass the repository’s existing gates, including the relevant lint, unit, integration, evidence-freshness and production-build commands. Add a documented end-to-end command. If the environment itself prevents a gate, capture the exact failure, prove whether it is environmental, and run the closest valid check; do not simply declare it passed.

Perform visual QA in an actual browser at representative mobile and desktop sizes. Inspect landing, onboarding, dashboard, check-in, coach, survey, progress, quick-help and staff-dashboard states. Fix clipping, overflow, inaccessible focus, confusing navigation, unreadable charts and broken empty/error states. Store only useful synthetic screenshots or a concise QA record.

# Required developer and operational deliverables

Leave the repository with:

- a current README with exact install, configure, migrate, seed, run, test and report commands;
- `.env.example` containing every required non-secret setting and safe defaults;
- reproducible local services/configuration;
- forward migrations and deterministic synthetic seeds;
- an architecture/data-flow document;
- database/data dictionary documentation;
- API/event-contract documentation;
- survey catalogue and scheduling/scoring documentation;
- study-configuration and release-gate documentation;
- evidence-release instructions;
- AI prompt/model/corpus/rules versioning documentation;
- security/privacy threat model and pre-live checklist;
- safety/operating-model limitations and escalation map;
- backup/restore and incident runbooks;
- deployment guide that does not perform a deployment;
- pilot analysis plan mapping questions to fields/derivations;
- synthetic export and generated pilot-report examples;
- an architecture decision log for material choices;
- a concise list of external approvals/services still needed before live use.

# Technical software completion criteria

Do not mark this goal complete until all of the following are true:

1. A fresh developer can follow the documented commands to start the local database/services, install dependencies, run migrations, seed fictional data and launch the app.
2. A fictional participant can register, sign in, complete eligibility/information/consent/baseline, choose a smoking goal, use structured and AI-assisted coaching, record check-ins, see honest progress, complete due surveys/outcomes, access help, manage consent and withdraw.
3. The product remains functional when the AI adapter is disabled or forced to fail.
4. A properly authorised fictional researcher can view de-identified participant flow, engagement, surveys, outcomes, missingness, referrals, costs, data quality and release status.
5. Analysis-ready CSV/JSON exports, a data dictionary and a synthetic reproducible pilot report can be generated from the application data.
6. Gambling journeys, data capture, safety paths, staff simulation and tests work with synthetic data, while live participant access remains fail-closed.
7. Authentication, RBAC, consent/release gating, evidence gating, survey versioning, safety routing, audit and cost controls are enforced server-side.
8. The critical participant and staff flows pass unit/integration/end-to-end, production-build, accessibility and visual checks.
9. Required pages contain no TODO copy, placeholder data presented as real, dead controls or deceptive monitoring/approval claims.
10. Documentation states what is technically complete, what is intentionally gated and what named external decisions are required before a real pilot.

Planning, generating database types, creating a dashboard shell, or passing unit tests alone is not completion. Exercise the assembled application end to end.

# Governance boundary for the word “pilot-ready”

Use two explicit statuses:

- “Technically pilot-ready”: the software completion criteria above have been demonstrated using synthetic/staff test data.
- “Authorised for live pilot”: recruitment may open only after the sponsor/organisation records all applicable ethics/research governance, information governance/DPIA, clinical-safety, protocol, evidence-content, accessibility, security, data-controller/processor, service-operating-model and deployment approvals in the release gate.

You may reach the first status through this goal. You must never infer or fabricate the second.

# Execution sequence

1. Inventory the current implementation and map existing capabilities/gaps to this objective.
2. Write a phased implementation checklist organised as vertical slices, then begin building immediately.
3. Establish the production data model, migrations, study/release configuration, identity separation, auth and RBAC.
4. Complete the smoking participant journey, structured tools and progress/outcome capture.
5. Add the versioned survey system and participant-experience measures.
6. Harden and complete the AI/evidence/safety pipeline with a non-AI fallback.
7. Complete the staff/research portal, exports, derivations and synthetic report generator.
8. Build and gate the gambling module to staff-simulation completeness.
9. Complete privacy/security/reliability controls and operational documents.
10. Run automated tests, fresh-install verification and browser-based mobile/desktop/accessibility QA; fix defects found.
11. Reconcile every completion criterion and finish all software work that does not require external authority.

Do not stop after presenting the plan. Keep the checklist current and proceed through implementation. If the task is compacted or resumed, read the checklist, git diff and test results and continue rather than starting over.

# Final handoff

When—and only when—the technical completion criteria have been met, report:

- the working outcome and main participant/researcher capabilities;
- the architecture and important security/privacy choices;
- migrations and local start commands;
- exact test/build/e2e/accessibility/report commands run and their results;
- where synthetic exports and reports are generated;
- any known limitations or residual risks;
- the precise external approvals, credentials and services still blocking a live pilot;
- confirmation that no deployment, real-data use or governance approval was claimed.

Lead with the completed product, not a diary of activity. Include clickable paths to the most important files. Do not mark the durable goal complete if required software work remains merely because context, time or token budget is running low.
```
