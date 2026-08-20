# MPFT AI-assisted behaviour change platform

## Pilot-ready product and evaluation blueprint

**Prepared:** 20 August 2026

**Status:** Internal discovery and product-planning document. It is not approval for patient use, a clinical safety case, a regulatory decision, a research protocol or evidence of effectiveness.

**Recommended first live pathway:** Adult smoking cessation
**Second pathway:** Gambling-related harm, developed as a separate governed module and evaluated under a separate protocol

## 1. Executive decision

Build one governed platform with shared account, consent, evidence, analytics, safety and evaluation services, but keep smoking and gambling as separate interventions.

The first live feasibility pilot should be smoking cessation. The gambling module can be designed and tested with synthetic cases and lived-experience input in parallel, but it should not inherit the smoking pilot's eligibility, outcome measures, risk controls or approval.

The first pilot should answer a bounded question:

> Can an evidence-grounded digital companion, added to an existing stop-smoking pathway, be used safely and equitably, improve activation and continuity of support, and generate complete enough outcome data to justify a controlled effectiveness evaluation?

The pilot should not be described as proving that an LLM helps people quit. A later controlled study should test whether the generative conversational layer adds value beyond current care plus the best available non-generative digital support.

## 2. Why this is the recommended product position

The research pack supports five product decisions.

| Evidence finding | Product decision | Evaluation consequence |
|---|---|---|
| Structured and hybrid smoking conversational interventions show a promising but heterogeneous cessation signal, especially when combined with behavioural support, medication or service contact. Direct evidence for an autonomous generative coach is very limited. | Position the product as an adjunct to a named stop-smoking pathway, not a replacement service. | Measure treatment uptake, referral completion, staff workload and verified abstinence, not just chat use. |
| In the Dejal@bot trial, the chatbot was part of a primary-care pathway with 5A's and pharmacotherapy. QuitBot did not outperform an active digital comparator on its primary abstinence analysis. | Preserve a structured programme and human care. Treat the LLM as one replaceable interface component. | A later evaluation should use an active digital comparator rather than a no-support waitlist. |
| MI-style chatbot language did not show an incremental effect in the cited smoking experiment. | Use MI-consistent dialogue rules, but do not claim that a prompt delivers proven motivational interviewing. | Independently rate a sample for relational quality and fidelity while keeping behavioural outcomes primary. |
| Digital gambling interventions and two chatbot RCTs support feasibility, but between-group efficacy is uncertain and neither trial tested a free-form modern LLM. | Build gambling-specific structured content and just-in-time support, but do not launch a general gambling therapist. | Evaluate gambling behaviour, harm, help-seeking and safety separately from engagement. |
| Gambling-focused LLM evaluation found plausible responses alongside advice that could encourage continued gambling. NICE identifies a close relationship between gambling harms and suicide risk. | Gambling requires deterministic prohibitions, a named receiving service, direct crisis routes and a much higher release threshold. | Track risk-route sensitivity, missed escalation, completed hand-offs, financial-harm events and serious adverse events. |

## 3. Intended purpose and boundaries

### 3.1 Proposed intended purpose for discovery

An optional digital adjunct for eligible adults that:

- explains approved smoking-cessation or gambling-harm evidence in plain language;
- supports a structured, user-chosen behaviour-change plan;
- provides approved coping exercises and reflection between human contacts;
- records user-entered progress and presents it without judgement;
- routes people to named human services; and
- generates a versioned, consented dataset for an approved feasibility evaluation.

This wording is provisional. It must be reviewed by the accountable service, Clinical Safety Officer, information governance, research sponsor and regulatory lead. Claims about preventing, monitoring, treating or alleviating a disorder may affect medical-device status.

### 3.2 Functions allowed in the proposed pilot

- Structured eligibility and baseline assessment.
- Evidence explanation from an approved, versioned corpus.
- User-selected goals and if-then plans.
- Daily or weekly self-monitoring using pathway-specific fields.
- Pre-approved coping and lapse-recovery support.
- A scoped free-text coach only if it is necessary to the research question and passes the release gates.
- Deterministic scoring of validated measures and calculators.
- Human referral or signposting with confirmation of whether the route was used.
- Scheduled follow-up measures and participant feedback.
- Participant data access, correction, withdrawal and deletion workflows that match the approved protocol and legal basis.

### 3.3 Functions prohibited from autonomous operation

- Diagnosis, prognosis or individual disease-risk prediction.
- Personal medication selection, contraindication assessment, dose advice or treatment change.
- Symptom assessment or reassurance that symptoms are benign.
- Crisis, suicide, safeguarding or acute-care decisions made only by an LLM.
- Gambling tips, strategies for recouping losses, bookmaker or casino recommendations, or instructions to bypass blocks or self-exclusion.
- Claims that a referral occurred when the receiving service did not confirm it.
- Claims that a clinician is monitoring the tool unless a real, staffed and time-bounded monitoring service exists.
- Open-web retrieval for patient-facing clinical answers in the first pilot.
- Secondary use of conversations for model training.

## 4. Platform strategy

### 4.1 One core platform, separate pathway modules

Shared core services should include:

- identity and pseudonymous study account management;
- consent and participant-information versioning;
- role-based staff access;
- evidence and intervention version control;
- event analytics;
- scheduled outcome collection;
- referral and hand-off tracking;
- safety-event and incident management;
- notifications and follow-up;
- audit logs;
- research export and data-quality reporting; and
- release, model, prompt, corpus and rule manifests.

Each pathway module should own:

- eligibility and exclusions;
- baseline assessment;
- goals and behaviour-change content;
- check-in fields and schedule;
- validated outcome measures;
- safety rules and receiving services;
- evidence corpus;
- participant copy; and
- pathway-specific analysis.

Smoking and gambling results must not be pooled into a single intervention effect.

### 4.2 Recommended sequencing

1. Freeze the current prototype as a synthetic demonstration baseline.
2. Complete discovery, intended-purpose and research-classification work.
3. Build the governed core and smoking pilot module.
4. Run offline, staff and lived-experience testing.
5. Conduct a narrow supervised smoking feasibility pilot if all approvals are in place.
6. Use the same core to build a gambling module, but require a separate hazard analysis, service owner, protocol and release decision.
7. Move to a controlled comparison only after feasibility, safety and data completeness are demonstrated.

## 5. Pilot-ready user experience

### 5.1 Participant journey

1. **Invitation and scope**
   - Show the pathway, pilot status, who operates it, who does and does not monitor it, urgent help and the non-digital alternative.
   - Record invitation and recruitment source without exposing health information in a URL.

2. **Eligibility**
   - Ask the minimum questions needed to determine eligibility.
   - Give every excluded person an appropriate human route rather than a dead end.

3. **Participant information and consent**
   - Separate consent to participate, necessary service data, optional reminders, optional conversation research and optional future contact.
   - Record the exact versions shown and accepted.

4. **Baseline**
   - Collect the pathway-specific baseline and the minimum prespecified equity variables.
   - Explain why each sensitive question is asked and allow `prefer not to say` where methodologically acceptable.

5. **Personal evidence review**
   - Match only approved evidence to declared characteristics.
   - Show source, review date, applicability and uncertainty.
   - Keep deterministic calculations outside the LLM.

6. **Plan**
   - Let the participant choose one primary goal and at most one supporting action.
   - Store both their wording and the structured goal.
   - Offer a real human support route.

7. **Between-contact support**
   - Provide short check-ins, quick coping actions, reminders and optional coach access.
   - Make `I need help now` more prominent than the general chat box.

8. **Progress**
   - Show observed data, missingness and estimates separately.
   - Never count a missing day as smoking, abstinence, gambling or non-gambling.
   - Preserve learning after a lapse or relapse.

9. **Human hand-off**
   - Record `offered`, `accepted`, `sent`, `received` and `completed` as separate events.
   - Do not call a link click a completed referral.

10. **Follow-up and close**
    - Collect scheduled outcomes even if the participant stopped using the intervention, where consent and protocol allow.
    - Offer a debrief, data summary, withdrawal route and non-digital continuing support.

### 5.2 Smoking module

The smoking module should include:

- baseline cigarettes per day, years smoked, time to first cigarette, previous attempts, longest quit, current support and quit/reduction intention;
- user-chosen quit, cut-down or understand-options route;
- treatment-support contact and referral status without giving personal medicine advice;
- daily check-in for cigarettes, goal attempt and strongest craving;
- confidence at baseline, weekly, after a lapse/relapse or on request rather than necessarily every day;
- user-confirmed distinction between an isolated lapse and return to regular smoking;
- smoke-free days, cigarettes recorded over time, quit attempts, treatment uptake and optional biochemical verification; and
- follow-up outcomes collected even from participants who do not keep checking in.

The current prototype's estimate of cigarettes avoided and money not spent may remain as motivational feedback, but it must be labelled as an estimate and must not be used as a primary outcome.

### 5.3 Gambling module

The gambling module should include:

- a validated baseline identification or severity measure selected by the clinical/research team;
- a separate short-interval outcome measure suitable for repeated follow-up, with wording and licensing checked;
- gambling days or episodes, expenditure or net loss in an approved format, urge intensity, chasing, and harms;
- activation and sustained use of protective measures such as self-exclusion or banking blocks;
- treatment entry, retention and support between appointments;
- a prominent just-in-time `I am about to gamble` route that uses an approved immediate plan;
- a compassionate post-gambling route focused on safety, recovery and re-engagement; and
- deterministic handling of suicidal language, acute financial crisis, safeguarding and attempts to obtain gambling advice.

Do not use the PGSI as a casual daily tracker. Its intended recall period and suitability for repeated short-interval measurement must be respected. The protocol should select a responsive repeated measure, such as a validated short-interval symptom scale, and confirm permissions before implementation.

## 6. What the website must measure

The platform must distinguish five kinds of measurement.

### 6.1 Reach and participant flow

- potentially eligible people;
- invited;
- opened invitation;
- screened;
- eligible and ineligible with reason;
- consented;
- completed baseline;
- activated the intervention;
- reached a meaningful intervention milestone;
- completed each follow-up;
- withdrew; and
- lost to follow-up.

These denominators are needed to describe selection bias and produce a participant-flow diagram.

### 6.2 Engagement and interaction

- sessions and active days;
- time to first meaningful action;
- assessment, evidence, plan and check-in completion;
- goals created, revised, paused and attempted;
- chatbot opened, questions submitted, replies delivered and technical failures;
- response latency and token/cost use;
- conversation depth using message counts, not raw content in the general analytics stream;
- evidence cards viewed and source links opened;
- reminders sent and acted on;
- coping tools selected and completed;
- service routes offered, accepted and completed; and
- abandonment point and reason where volunteered.

Engagement is an implementation or mechanism measure. It is not proof of clinical benefit.

### 6.3 Behavioural and clinical outcomes

Smoking outcomes should include:

- cigarettes per day over time;
- quit attempts;
- self-reported point-prevalence and continuous/prolonged abstinence using prespecified definitions;
- biochemical verification where feasible;
- lapse and return to regular smoking, confirmed by the participant;
- behavioural and pharmacological support uptake;
- referral completion; and
- quality of life or patient-reported benefit selected in the protocol.

Gambling outcomes should include:

- gambling frequency and expenditure or loss using a prespecified definition;
- a validated gambling symptom or harm score at defined timepoints;
- relapse or high-risk episodes using an agreed definition;
- treatment entry and retention;
- protective measures activated and maintained;
- gambling-related harms and quality of life; and
- clinically significant deterioration.

### 6.4 Safety and integrity

- mandatory safety triggers and how they were detected;
- correct and missed escalation;
- false reassurance;
- unsafe medication or gambling advice;
- unsupported clinical claims and citation mismatch;
- prompt injection or policy-bypass attempts;
- incidents, near misses, complaints, safeguarding events and serious adverse events;
- hand-off response and completion time;
- performance by subgroup;
- model, prompt, evidence, rule and application version for each material interaction; and
- performance before and after every material release.

### 6.5 Implementation, equity and economics

- reach, activation, retention, outcomes and harm by prespecified equity groups;
- accessibility barriers, device/browser, language, digital access and assisted-use needs;
- staff training, review volume, hand-off workload and response time;
- support contacts and downtime;
- participant trust, comprehension, burden, privacy concerns and preference for a human;
- development, licence, model, hosting, assurance, clinical review and incident-management cost;
- staff time displaced or saved; and
- cost per activated participant, completed pathway and additional verified quitter in a later comparative evaluation.

The exact field definitions and event taxonomy are in [pilot-minimum-dataset.md](pilot-minimum-dataset.md).

## 7. Outcome schedule

The final schedule belongs in the approved protocol. The following is a design starting point.

| Timepoint | Core | Smoking | Gambling |
|---|---|---|---|
| Screening | Eligibility, referral source | Adult current smoker and pathway-specific exclusions | Intended gambling cohort and pathway-specific risk/exclusions |
| Baseline | Consent, demographics/equity, digital access, quality of life, service use | Smoking history, cigarettes/day, dependence indicators, previous attempts, support/treatment status | Validated baseline measure, gambling frequency/expenditure, recent harm, care and protective measures |
| Daily/when used | Events, coping use, coach interaction, safety routes | Cigarettes, goal attempt, craving; trigger only when relevant | Gambling episode or no-gambling day where required, urge, trigger, protective action, acute harm route |
| Weekly | Burden, confidence, adverse events, service contact | Cigarettes/day summary, abstinence status, goal and support uptake | Gambling days/episodes, expenditure/loss, short-interval symptom/harm measure, protective measures |
| 4 weeks | Follow-up completion, acceptability, safety | Prespecified abstinence outcome and biochemical verification where feasible | Interim behavioural/harm outcomes if clinically appropriate |
| 6 weeks | Implementation and participant experience | Behaviour, support and retention | Matches the duration of a pivotal self-guided gambling study and may be a useful early outcome point |
| 12 weeks | Main feasibility follow-up, quality of life, service use, harms | Abstinence, cigarettes/day, quit attempts, treatment uptake | Validated outcome, frequency/expenditure, help-seeking, protective measures and harm |
| Longer follow-up if funded | Durability, late harms, health-service use | Sustained abstinence | Sustained change, relapse prevention and treatment retention |

Follow-up collection must not depend on continued chatbot use. Missing observations must remain missing and be reported by arm and pathway.

## 8. Evaluation design

### 8.1 Stage A: discovery and co-design

- Name the Public Health sponsor, service owner, Clinical Safety Officer, research/R&D contact, information-governance lead, technical owner and statistician.
- Define one first population, one service problem, the human hand-off and the active comparator.
- Complete lived-experience and practitioner co-design, including underserved and disabled users.
- Approve the minimum dataset, data flows, retention, safety monitoring and qualitative work.
- Decide whether a free-text LLM is necessary. A structured non-generative baseline is required even if it is.

### 8.2 Stage B: locked offline evaluation

- Freeze the application, model, prompt, evidence corpus, rule set and output schema.
- Test routine, edge and adversarial multi-turn scenarios.
- Independently rate factuality, source entailment, action safety, scope adherence and relational quality.
- Test numerical calculations, accessibility, security, deletion and audit retrieval.
- Set release thresholds before the final test set is run.

### 8.3 Stage C: staff and lived-experience simulation

- Simulate consent, withdrawal, reminders, hand-off, downtime, complaints, incidents and follow-up.
- Measure workload and prove that the receiving service can act within the agreed hours and response time.
- Revise the intervention and repeat regression testing.

### 8.4 Stage D: supervised feasibility pilot

The feasibility pilot should focus on:

- recruitment and reach;
- activation and meaningful completion;
- follow-up and data completeness;
- safety and unexpected harm;
- technical reliability;
- usability, comprehension and burden;
- referral completion;
- staff workload;
- equity; and
- preliminary outcome signals with uncertainty.

It should not be powered or presented as proof of effectiveness unless a statistician has designed it for that purpose.

### 8.5 Stage E: controlled comparative evaluation

Compare:

- current care plus the locked companion; with
- current care plus the best available non-generative digital support.

Analyse on an intention-to-treat basis, retain intervention and release versions, pre-register the protocol and analysis, and report safety, negative findings and missing data. Smoking and gambling require separate studies or separately powered and prespecified pathway strata.

## 9. Success framework

The sponsor and statistician must set numeric progression thresholds before recruitment, informed by current pathway data and co-design. The decision should cover:

| Domain | Example decision question |
|---|---|
| Feasibility | Can the service recruit the intended population and collect the primary follow-up without unacceptable burden? |
| Use | Do participants complete a meaningful intervention action, not merely open the site? |
| Safety | Are all high-severity release cases handled correctly, and does the live pilot show no unresolved serious product-related hazard? |
| Human pathway | Can referrals and escalations be received, acted on and closed within the defined operating model? |
| Data quality | Are intervention versions, denominators, outcomes and missingness complete enough for valid analysis? |
| Equity | Is there evidence of materially poorer reach, completion, safety or outcome in a prespecified group? |
| Value | Is there enough outcome and workload signal to justify a controlled comparison? |

Do not set success after looking at the results. Do not call high satisfaction, high message count or falling cigarettes among completers proof that the product caused improvement.

## 10. Immediate pause and no-go rules

Pause participant-facing use pending investigation for:

- a privacy or security breach;
- a missed high-severity escalation or clinically significant false reassurance;
- unsafe medicine, gambling, withdrawal, crisis or safeguarding advice;
- a fabricated local service or repeated unsupported clinical claim;
- a serious adverse event plausibly related to the service;
- failure of the staffed hand-off route or agreed response time;
- a material safety disparity between groups;
- an unassessed change to model, prompt, evidence, rules, integration, host or supplier;
- inability to retrieve the approved interaction and version record needed for investigation; or
- loss of the named accountable service, sponsor or safety function.

No-go conditions before real participants include absent sponsor or service owner, unresolved research or device classification, no approved DPIA/data flow, no CSO-approved safety work, no receiving service, no tested withdrawal/deletion process, or no independent release test.

## 11. Pilot product architecture

### 11.1 Participant application

- Mobile-first responsive web app.
- Accessible structured journey with optional chat.
- Strong session security and no health data in URLs.
- Explicit save, correction, download, withdrawal and deletion states.
- Visible operating hours and urgent help on every relevant screen.

### 11.2 Intervention service

- Deterministic eligibility, validated measure scoring, calculations and high-risk routing.
- Versioned content and evidence retrieval.
- Structured response schema and evidence-ID validation.
- LLM used for language and reflection only within an approved policy.
- Approved non-generative fallback for outages, refusals and uncertain evidence.

### 11.3 Research and operational data service

- Relational, versioned schema with immutable event IDs.
- Separation of participant identity/contact data from research data.
- Separate restricted stores for raw conversation, safety incidents and general analytics.
- Data validation at write time and reproducible export snapshots.
- Audit logs for staff access and changes.

### 11.4 Staff portal

Use a separate protected staff surface for:

- recruitment and follow-up status;
- data-quality and missingness reports;
- referral and hand-off status;
- safety review and incidents;
- evidence, model and release manifests;
- aggregate engagement, outcome, equity and cost dashboards; and
- approved pseudonymised export.

A dashboard does not create a monitored service. If the product displays or queues urgent items, a real team, rota, response time, downtime route and escalation procedure must exist.

### 11.5 Hosting and suppliers

Do not assume the current Vercel/Cloudflare development arrangement is the pilot architecture. Select hosting and suppliers after the data-flow, controller/processor roles, NHS assurance, security, retention, support, exit and cost requirements are agreed. Complete the current DTAC for the exact released version and the required local DCB0160 work before NHS deployment.

## 12. Current prototype gap assessment

| Area | Present in the repository | Required for a pilot |
|---|---|---|
| Smoking journey | Structured review, evidence, goal, check-in, progress and optional coach | Approved eligibility, follow-up schedule, service integration and governed participant copy |
| Smoking data | Cigarettes, craving, confidence, goal attempt, trigger and check-in date | Outcome definitions, quit date, abstinence, treatment uptake, verification, missingness and scheduled assessments |
| Accounts | Browser state and a pseudonymous account path with consent version | Approved identity model, consent history, research ID, withdrawal, retention, access control and subject-rights process |
| Evidence | Verified-only runtime eligibility and evidence metadata | Owned QMS, source passages, release manifest, approvals, recall and per-interaction evidence version |
| AI | Structured output, server-side calls, citations and local fallback | Locked intervention, independent validation, semantic safety, monitoring, incident retrieval and update control |
| Telemetry | Process-local tokens, cost, latency and error status; account-level API usage | Stable event store, participant flow, feature events, safety/referral events, outcomes, version fields and data-quality dashboard |
| Research persistence | Explicitly disabled research export interface | A separately approved research data service and export, not an environment-flag switch |
| Gambling | Research only | Complete module, evidence corpus, specialist service, validated outcomes and gambling-specific safety case |
| Governance | Detailed roadmap and reviews | Named accountable roles, decisions, approvals, clinical safety case, DPIA, DTAC, research protocol and operational SOPs |

The existing `api_usage` and development telemetry tables are useful for cost and reliability. They are not a participant outcomes system. The existing pseudonymous profile store must not be reused as a research database without a separately governed design.

## 13. Delivery backlog by gate

### Gate 0: decide and own

- Intended purpose, claims register and exclusions.
- Accountable manufacturer/developer and deploying organisation.
- Service owner, sponsor, CSO, IG/DPO, SIRO/Caldicott route, research lead and statistician.
- Research/service-evaluation and medical-device decisions.
- Current pathway map, comparator and local baseline data.
- Data flow and minimum dataset approval.

### Gate 1: governed core

- Authentication, role-based authorisation and staff audit.
- Versioned consent and participant information.
- Participant/research identifier separation.
- Event, outcome, safety, referral and release schemas.
- Retention, deletion, export and backup-deletion design.
- Protected admin and research portal.

### Gate 2: smoking intervention

- Protocol-aligned baseline and follow-up measures.
- Revised check-in policy and lapse/relapse branch.
- Service referral and completion tracking.
- Evidence source-passage audit and version manifest.
- Structured/non-generative comparator mode.
- Participant-friendly progress and data-quality prompts.

### Gate 3: safety and quality

- DCB0129 clinical risk plan, hazard log and clinical safety case work.
- DPIA, threat model, penetration testing, SBOM and incident response.
- Model/prompt/corpus regression harness and independent clinical ratings.
- Accessibility and equality testing.
- Staff simulation, training, downtime and rollback.

### Gate 4: feasibility study

- Approved protocol and analysis plan.
- Sponsor, HRA/REC/MHRA and local decisions as applicable.
- Recruitment, consent, monitoring and adverse-event processes.
- Locked release and study registration.
- Data-quality, safety and operational dashboards.
- Final report and go/no-go review.

### Gate 5: gambling module

- Specialist gambling service owner and lived-experience group.
- Separate intended purpose, eligibility, outcomes and comparator.
- Suicide, self-harm, financial crisis and gambling-advice hazard set.
- Protective-measure and help-seeking integrations.
- Synthetic, staff and lived-experience testing before any recruitment decision.

## 14. Outputs needed to write the pilot report

The data and versioning plan should make the following report tables reproducible without manual reconstruction:

1. Participant flow from invitation to follow-up.
2. Eligibility and reasons for exclusion.
3. Baseline characteristics and equity variables by arm/pathway.
4. Intervention exposure and meaningful engagement.
5. Primary and secondary outcomes with denominators and missingness.
6. Service uptake and completed referrals.
7. Safety events, incidents, missed escalation and complaints.
8. Technical performance and downtime.
9. Outcomes and harms by prespecified equity groups.
10. Staff workload and whole-life cost.
11. Participant experience and qualitative themes.
12. Intervention manifest, changes, deviations and protocol amendments.

The report should distinguish feasibility, association and causal inference. A one-arm pilot may describe change and feasibility, but it cannot establish that the platform caused the change.

## 15. Decisions for the MPFT discovery team

1. Confirm smoking as the first live pathway or document why another pathway is prioritised.
2. Define the exact participant population and receiving stop-smoking service.
3. Decide whether the first feasibility study needs free-text generative chat or whether structured support is the safer first intervention.
4. Choose the active digital comparator for the later controlled evaluation.
5. Agree outcome timepoints and biochemical verification arrangements.
6. Select validated gambling measures and verify recall periods and licences before implementation.
7. Agree which conversations, if any, must be retained for safety research, for how long and who can access them.
8. Decide the operating hours, monitoring responsibilities and response times for human hand-off.
9. Set prespecified progression thresholds using local pathway data and statistical input.
10. Decide whether the current codebase will be hardened into the pilot or used only as a specification/prototype for a governed build.

## 16. Evidence basis

This blueprint is grounded in the research baseline recorded in [evidence-source-manifest.md](evidence-source-manifest.md), including the MPFT AI health-coaching evidence report, the smoking-cessation concept brief, the working review protocol and the revised gambling literature review.

Key external sources include:

- [NICE NG209: tobacco dependence](https://www.nice.org.uk/guidance/ng209)
- [NICE NG248: gambling-related harms](https://www.nice.org.uk/guidance/ng248)
- [Bendotti et al. smoking conversational interventions review](https://doi.org/10.1177/20552076231211634)
- [He et al. smoking conversational agents review](https://doi.org/10.1093/ntr/ntac281)
- [Dejal@bot randomised trial](https://doi.org/10.2196/34273)
- [QuitBot development and randomised trial](https://doi.org/10.2196/57318)
- [Gambling chatbot systematic review](https://doi.org/10.1007/s41347-025-00562-7)
- [GAMBOT randomised trial](https://pubmed.ncbi.nlm.nih.gov/32162075/)
- [GAMBOT2 trial](https://doi.org/10.1016/j.addbeh.2023.107889)
- [Expert evaluation of LLM responses to problem gambling](https://doi.org/10.1007/s10899-025-10430-x)
- [Self-guided gambling intervention trial](https://doi.org/10.1001/jamanetworkopen.2024.17282)
- [NHS DTAC](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac)
- [NHS digital clinical safety assurance](https://www.england.nhs.uk/long-read/digital-clinical-safety-assurance/)
- [HRA UK Policy Framework for Health and Social Care Research](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/uk-policy-framework-health-social-care-research/uk-policy-framework-health-and-social-care-research/)
- [MHRA software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device)

The internal reviews are decision-support material, not a substitute for verifying pivotal studies, completing the literature review, obtaining local clinical review or using the current official guidance at the point of approval.
