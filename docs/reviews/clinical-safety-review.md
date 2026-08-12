# Clinical Safety and NHS Governance Review

**Product:** MPFT Evidence Coach: Smoking Prototype
**Reviewer role:** Independent Clinical Safety / NHS Governance Reviewer
**Review date:** 12 August 2026
**Reviewed artefact:** `docs/reviews/product-architecture.md`
**Decision:** **Not safe or governable for patient/public use in its present architectural state. Conditionally tolerable only as an access-controlled, synthetic-data development demonstration with the free-text AI coach disabled.**

This is a critical design review, not a DCB0129 Clinical Safety Case Report (CSCR), not a hazard log approved by a Clinical Safety Officer (CSO), not a DTAC assessment, not regulatory advice and not approval by MPFT.

## Current regulatory snapshot

- DCB0129 and DCB0160 remain mandatory information standards in England. DCB0129 applies to manufacturers/developers of health IT; DCB0160 applies to health organisations deploying and using it. NHS England is consulting on revisions from 29 June to 11 September 2026, so the 2018 releases remain the operative published standards at this review date and must be rechecked later. Sources: [clinical risk management standards](https://digital.nhs.uk/services/clinical-safety/clinical-risk-management-standards), [DCB0129](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems/), [DCB0160](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems), and [2026 standards review](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/review-of-digital-clinical-safety-standards-dcb0129-and-dcb0160).
- NHS England refreshed DTAC in February 2026 and retired the previous form from 6 April 2026. DTAC remains an assessment framework across clinical safety, data protection, technical security, interoperability, and usability/accessibility; it does not replace medical-device certification, ICO obligations or local assurance. Source: [current DTAC guidance](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac).
- All data-protection provisions of the Data (Use and Access) Act 2025 were in force by 19 June 2026. It amends rather than replaces UK GDPR, the Data Protection Act 2018 and PECR. Source: [ICO DUAA summary](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-duaa-summary-of-the-changes/).
- The UK medical-device regime is changing, but the current Great Britain framework remains the UK Medical Devices Regulations 2002 as amended. Medical-device status turns primarily on intended purpose and actual claims/function, not the label “prototype”. Sources: [regulating medical devices in the UK](https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk), [software applications guidance](https://www.gov.uk/government/publications/medical-devices-software-applications-apps), and [SaMD intended-purpose guidance](https://www.gov.uk/government/publications/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd).

## Safety boundary under review

The relevant clinical system is wider than the code repository. It includes:

- claims made on landing, evidence, goals, progress, medicine and coach screens;
- user inputs, structured and free text;
- browser storage and shared-device behaviour;
- deterministic calculations and evidence-ranking rules;
- the evidence database, curator decisions and freshness process;
- the LLM provider, model version, prompts, moderation/classification, outages and policy changes;
- Cloudflare hosting, server logs, analytics, sub-processors and administrator access;
- links and hand-offs to NHS 111, 999, stop-smoking, pharmacy, GP and pregnancy services;
- synthetic persona demonstrations and any audience that may mistake them for clinical operation;
- the future study protocol, participant information, recruitment and support arrangements.

The architecture treats several of these as peripheral. DCB risk management cannot.

## Findings: unsafe or under-specified boundaries

### 1. No accountable manufacturer, deploying organisation or CSO is identified: critical

The architecture names components but not the legal/accountable organisation manufacturing the health IT, the person acting as CSO, the intended deploying organisation, or the owner accepting each residual clinical risk. “Developed by an FY2 doctor in a placement” is not a governance structure.

DCB0129 uses “manufacturer” broadly enough to cover developer, supplier, integrator and vendor. It requires an organisational clinical-risk-management system and competent personnel, not a late document exercise. A future MPFT deployment would separately engage DCB0160; MPFT cannot inherit or outsource the manufacturer’s risk acceptance. NHS England explicitly distinguishes supplier DCB0129 responsibility from provider DCB0160 responsibility and says risk transfer does not transfer accountability: [NHS clinical safety example](https://digital.nhs.uk/services/booking-and-referral-standard/clinical-safety).

**Required:** before any non-developer sees an interactive prototype, record manufacturer identity, executive safety accountability, CSO appointment/competence, system intended use, system boundary, clinical risk management plan, hazard log and release criteria. Before an NHS pilot, MPFT must own DCB0160 deployment work and receive the manufacturer CSCR/hazard log.

### 2. The architecture wrongly treats disclaimers and “synthetic mode” as primary controls: critical

Users can ignore a warning and type real smoking, condition, pregnancy, mental-health or medicine information. A polished MPFT-named web tool is likely to be treated as real regardless of “prototype” copy. Restricting requested identifiers does not make the remaining profile non-personal or non-health data. Smoking status, COPD, depression/anxiety, daily cigarettes and coaching history are health-related special-category data when linked or linkable to a person.

A warning does not remove a duty to design safely. “Nobody monitors this” may reduce one misunderstanding but creates another: the service solicits safety-sensitive free text while declaring that nobody will respond.

**Required:** keep the demonstration access-controlled; prevent indexing; show only synthetic persona selection; remove manual health-profile entry from the uncontrolled demo; disable server-side AI. If real or self-entered profiles are later permitted, complete DPIA, intended-purpose/regulatory assessment, lawful-basis and confidentiality analysis, participant/user information and incident arrangements first.

### 3. The free-text coach is an unbounded clinical intake channel disguised as a bounded feature: critical

The architecture relies on classifying text as supported, urgent, clinical, medication, crisis or injection content. This is triage-like routing even if it is called “scope detection”. False negatives allow harmful advice; false positives can alarm or abandon users. The architecture provides no clinically validated classifier, sensitivity target, test population, escalation owner, supported language set, timeout behaviour or evidence that a model update will not alter routing.

Post-generation schema checks do not establish that an answer is clinically safe or supported. A model can cite a valid record while changing its meaning, omit a critical limitation, mirror suicidal language poorly, or give implicit medicine selection without using prohibited words.

**Required:** disable open free text for the initial prototype. Replace it with reviewed, selectable coaching intents and templated responses. Reintroduce free text only after a CSO-approved hazard analysis, locked model/prompt versions, clinically specified evaluation thresholds, regression corpus, fail-closed outage behaviour, monitoring, incident response, rollback/kill switch and a named content owner. Do not describe any classifier as clinical triage.

### 4. Emergency and mental-health handling is incomplete: critical

The proposed generic 999/111 fallback lacks a complete, approved set of routes for immediate physical danger, urgent physical symptoms, poisoning/overdose, self-harm/suicide, safeguarding disclosure, domestic abuse, and non-urgent distress. It also does not address inability to call, hearing access, location outside England, or the possibility that the user is asking about someone else.

Current NHS public guidance says 999/A&E for immediate danger and NHS 111 with the mental-health option for urgent mental-health help; NHS 111 also provides text-relay, BSL and interpreter routes. Source: [NHS urgent mental-health support](https://www.nhs.uk/every-mind-matters/urgent-support/) and [when to use NHS 111](https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/).

**Required:** have MPFT clinical safety/safeguarding leads approve a scenario matrix and exact content; make the emergency-help control persistent and operable without AI; state the geographic applicability; test links/phone text; record content owner and review date; do not collect the disclosure after routing; do not claim detection completeness or escalation.

### 5. Excluding pregnancy and under-18s without a safe hand-off can cause abandonment: high

Pregnancy is not merely a reason to refuse. It is a high-benefit setting with specialist smoking support. A hard exit can increase harm if it leaves a motivated pregnant user without a direct route. Current NHS material describes pregnancy-specific stop-smoking advice and specialist services: [NHS stop smoking in pregnancy](https://www.nhs.uk/pregnancy/keeping-well/stop-smoking/).

**Required:** an excluded user receives a reviewed, direct, non-AI page with current NHS pregnancy/young-person routes, not a generic refusal. No medicine details should be personalised. Route ownership and freshness must be included in the safety case.

### 6. The evidence status model is not a clinical content governance system: critical

`VERIFIED` is a database enum, not an assurance argument. The architecture does not require two-person review, define reviewer competence, distinguish source-level from finding-level verification, specify how derived plain-English text is approved, or prevent a VERIFIED source from being attached to a different unsupported claim. “Human approval” is not enough without named roles, traceability and release authority.

The most likely catastrophic failure remains citation laundering: a true paper plus a false, over-personalised inference. Numeric field rendering does not address selection bias, inapplicable populations, surrogate outcomes, competing guidance, confidence, or outdated patient-facing language.

**Required:** store source → finding → effect estimate → approved patient claim → applicability/limitations as separate linked objects; require independent extraction and clinical/methodological approval; version every patient claim; sign releases; automatically suppress expired/stale items; define recall/withdrawal; maintain a content hazard log. “VERIFIED” must identify who verified what, against which source location and when.

### 7. Evidence relevance ranking can itself make a medical recommendation: high

Ranking evidence by comorbidity and motivation is an intervention, not neutral retrieval. Leading with a cardiovascular or COPD card may imply a personal prognosis. Ranking cessation options after reading depression/anxiety or pregnancy planning can indirectly influence treatment choice even if the sentence “you should take X” is banned.

**Required:** document ranking intended purpose and rules; prohibit medication ranking by personal medical fields; show why each card was selected and allow users to view unranked general evidence; validate ranking for systematic omission/bias; include it in DCB/MHRA assessment and research protocol.

### 8. Medicine boundaries are semantic, not enforceable: critical

“General education” can become a personal recommendation through context. For example, displaying one medicine after a user selects depression is functionally different from a general list. The current architecture has no disallowed inference specification, no medicine-content governance, and no test standard for implicit recommendations.

**Required:** medicine content must be static, separately clinically approved, and displayed without comorbidity-based ranking. Questions about suitability, interactions, contraindications, dose, switching, side effects or what to choose route to a pharmacist, stop-smoking adviser or clinician. Reassess medical-device status if the product is intended to influence treatment choice.

### 9. Pack-years and progress estimates are likely to be over-interpreted: high

Pack-years have a clinical association with disease assessment. Showing the number beside personalised evidence can look like risk stratification even when no risk model is used. “Cigarettes avoided” and “money not spent” depend on a defensible baseline and missing-data policy; they can misrepresent progress. The architecture has not specified bounds, units, rounding, corrections, or how vaping/variable consumption affects estimates.

**Required:** omit pack-years from the patient interface unless user research demonstrates benefit and CSO review accepts the framing. Keep it out of evidence ranking. Define and test all formulas, assumptions, impossible-value handling, missing days, timezone/day boundaries, edit history and explanatory labels.

### 10. Lapse language is considered, but relapse and deterioration risk are not: high

Preserving progress is reasonable but insufficient. The tool lacks controls for repeated relapse, worsening distress, increased smoking, dual use, adverse effects attributed to cessation aids, or disengagement after setting a quit date. Because the tool is unmonitored, it must not create an expectation of proactive support.

**Required:** define non-monitoring-safe next-step templates, direct access to human support, and thresholds that change displayed options without claiming clinical assessment. Do not generate emotionally sensitive lapse reflections from unrestricted text in V1.

### 11. Model and supplier changes are absent from clinical change control: critical

Using configurable model aliases is unsafe if an alias can silently point to a materially different model. Provider-side updates, moderation, latency, refusal behaviour, service location and retention terms may change. `store: false` is not a clinical control or a zero-retention guarantee.

**Required:** pin an evaluated model snapshot where available; inventory provider/sub-processors and data locations; create a safety-impacting-change taxonomy; rerun clinical regression tests for model, prompt, retrieval, evidence, SDK, hosting and policy changes; require CSO release approval; implement kill switch and deterministic fallback. The NHS AI IG guidance requires DPIA before implementation, defined purposes, controller/processor analysis, testing, transparency, minimisation and security: [NHS England AI guidance for IG professionals](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence/guidance-for-ig-professionals).

### 12. Local browser storage is both a confidentiality and PECR risk: high

Browser storage can be read by another user of a shared device, exposed by cross-site scripting, included in device backups or persist after the person believes they left the tool. “Delete my demo data” does not delete server logs, CDN/edge logs, model-provider records or browser backups. A versioned envelope is a software technique, not confidentiality assurance.

Local storage is a “storage and access technology” under PECR. The current April 2026 ICO guidance says users must be told about such technologies and prior consent is needed unless an exception applies; web storage is explicitly in scope. A strictly necessary exemption must be assessed from the user-requested service perspective, not assumed. Sources: [ICO storage/access rules](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-pecr-rules/) and [technologies including web storage](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/).

**Required:** complete the PECR assessment; give a truthful storage inventory and device-sharing warning before persistence; use short retention; provide export/delete verification; protect against XSS with strict CSP and dependency controls; distinguish browser deletion from server/provider retention; do not store free text by default.

### 13. No operational clinical safety management is designed: critical

The architecture mentions tests and freshness but not a safety incident pathway, complaint route, safety monitoring metrics, adverse-event handling, field safety corrective action, release rollback, downtime plan, owner rota, decommissioning or communication to deploying organisations.

**Required:** define incident intake and severity, Duty of Candour/safeguarding escalation assessment as locally applicable, evidence correction/recall, regulator reporting assessment, audit preservation, user notification, availability fallback, rollback and decommissioning. A prototype cannot be made public and then treated as unoperated software.

### 14. The administrator boundary is unsafe even if called “development-only”: high

Build-time flags and hidden routes are not authorisation. Evidence status mutation, prompt/config changes, telemetry and source ingestion are safety-critical functions. An exposed admin endpoint could publish misinformation or leak sensitive operational records.

**Required:** exclude admin mutation code from public builds until authenticated role-based access, MFA, least privilege, immutable audit, two-person publication approval and environment separation exist. Treat evidence publication as a controlled clinical release.

### 15. Accessibility and health literacy failures are clinical hazards: high

The architecture describes accessibility as acceptance criteria but gives no alternative for charts, cognitive load, panic/crisis navigation, low literacy, translation, motor impairment or screen-reader announcement of streamed AI. An inaccessible refusal or ambiguous risk graphic can directly cause harm. NHS/public-sector services are expected to meet WCAG 2.2 AA and publish an accessibility statement: [GOV.UK accessibility requirements](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps) and [NHS WCAG 2.2 guidance](https://service-manual.nhs.uk/accessibility/new-criteria-in-wcag-2-2).

**Required:** put accessibility failures in the hazard log; test critical flows manually with disabled users and assistive technology; provide non-chart equivalents and Easy Read/alternative formats; never auto-translate clinical/safety content without human validation.

### 16. Research intent and product intent are not separated: critical

The proposed future question compares standard information, personalised evidence and AI coaching to produce generalisable knowledge. That is strong evidence of research intent, potentially interventional research, not merely service evaluation. Calling an early pilot “service evaluation” would be unsafe governance if a new intervention is allocated or compared to support a generalisable claim.

The HRA definition distinguishes research intended to generate generalisable/transferable knowledge from service evaluation of a current service and audit against a standard: [HRA decision tool](https://www.hra-decisiontools.org.uk/research/about.html) and [Defining Research table](https://www.hra-decisiontools.org.uk/research/docs/DefiningResearchTable_Oct2022.pdf). Project-based NHS research in England requires the appropriate sponsorship and HRA/HCRW route; HRA Approval combines governance/legal assessment with REC opinion where required: [HRA Approval](https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/).

**Required:** classify each phase with MPFT R&D before recruitment; use the HRA tools and retain the output; appoint a sponsor; obtain the required HRA/REC/local capacity and capability approvals. If the software is a medical device used in a clinical investigation, separate MHRA notification and flagged REC review may apply.

### 17. The name creates a foreseeable endorsement hazard: high

“MPFT Evidence Coach” can reasonably be read as an MPFT clinical product even beside a disclaimer. It may expose the Trust to reputational and duty-of-care expectations and make users more likely to trust outputs.

**Required:** use a neutral project name in external demonstrations until MPFT communications, legal, brand and governance owners give written approval. Never copy NHS identity elements without permission.

## Provisional hazard analysis

This is a reviewer’s starter set, not the DCB hazard log. Severity/likelihood/scoring and residual-risk acceptance must be defined and approved through the appointed CSO’s method.

| ID | Hazardous condition | Example causes | Foreseeable harm | Minimum control before exposure |
|---|---|---|---|---|
| H01 | Unsupported personalised claim presented as evidence | Valid citation but unsupported inference; model paraphrase drift; ranking bias | Delayed care, false reassurance, anxiety or harmful cessation decision | Template-first claims; finding-level traceability; independent clinical/method review; suppress on doubt |
| H02 | Urgent content receives coaching or silence | Classifier miss, typo, unsupported language, timeout | Delay in emergency/urgent help | No free text in initial release; persistent help; reviewed deterministic routes; fail closed |
| H03 | Medicine education becomes selection advice | Contextual ranking, implicit comparison, model completion | Inappropriate medicine use or failure to obtain professional advice | Static unranked education; suitability questions refused and signposted; medicine regression corpus |
| H04 | User assumes monitoring/MPFT care | Product name, polished UI, data collection, ambiguous copy | Reliance on nonexistent clinician response | Neutral name; repeated unmonitored statement; no messaging metaphor suggesting inbox/escalation |
| H05 | Pregnant/under-18 user is abandoned | Hard exclusion without tailored hand-off | Continued smoking or unsafe self-management | Immediate reviewed specialist/NHS route; no data capture beyond routing need |
| H06 | Stale guidance remains visible | Link still resolves but content changed; overdue review; admin bypass | Outdated treatment or safety information | Content owner/review date; semantic re-review; automatic suppression; recall process |
| H07 | Browser-stored health profile disclosed | Shared device, XSS, backup, incomplete deletion | Stigma, distress, confidentiality breach | Access control for demo; no real input; CSP; short retention; accurate deletion/storage notice |
| H08 | LLM/provider change alters safety behaviour | Alias update, prompt/SDK/model policy change | New unsafe advice/refusal pattern | Version pinning; safety-impact assessment; regression; CSO release approval; rollback |
| H09 | Inaccessible critical action | Focus trap, low contrast, chart-only content, streamed text not announced | User cannot seek help, understand uncertainty or delete data | WCAG/manual assistive-tech testing; accessible alternatives; hazard ownership |
| H10 | False progress estimate influences behaviour | Wrong baseline, missing days treated as zero, timezone bug | Demotivation, false reassurance or distorted study endpoint | Defined formulas; edit/missing-data policy; unit tests; estimate labels |
| H11 | Research participant is exposed before approvals | “Prototype test” treated as informal demonstration | Unconsented intervention, unmanaged adverse event, invalid research | R&D classification, sponsor, approvals, protocol, participant support and indemnity before recruitment |
| H12 | Evidence/admin compromise publishes unsafe content | Unauthenticated route, privilege error, compromised account | Population-scale misinformation | No admin in public build; MFA/RBAC; two-person release; immutable audit |
| H13 | Data sent to unapproved sub-processor/location | Default logs, analytics, model API, provider changes | Confidentiality breach, unlawful transfer | DPIA/data-flow verification; contracts; transfer assessment; allowlist; request/log tests |
| H14 | Unsupported language is treated as understood | User writes non-English or ambiguous slang | Incorrect safety routing/coaching | Declare supported language; detect/route conservatively; human-validated translations only |
| H15 | Service failure removes safety information | Network/provider outage, link rot, Cloudflare incident | User cannot access urgent/signpost content | Critical safety page bundled locally/server-rendered; status/fallback; tested downtime route |

## Disagreements with the product architecture

1. **Free text should not be in V1.** The architecture retains it after layered controls. That is not justified by the prototype’s research question and multiplies clinical, privacy and regulatory risk.
2. **“Core works without AI” is not enough.** Any enabled AI route becomes part of the clinical system and release evidence. It cannot be treated as an optional accessory.
3. **A developer dashboard is not safe evidence governance.** Publication requires roles, segregation of duties, audit and recall, not merely visibility.
4. **A `VERIFIED` predicate is not grounding assurance.** Entailment, applicability and omission remain uncontrolled.
5. **Local storage is not a privacy solution by itself.** It introduces shared-device, XSS and PECR obligations and does not describe server/provider copies.
6. **A fail-closed remote repository is irrelevant to current risk.** The immediate risk is real health content entering logs and the model API, not future participant tables.
7. **The proposed age/pregnancy gate is too abrupt.** Safety means a governed hand-off, not only exclusion.
8. **The architecture postpones governance that shapes intended purpose.** MHRA, R&D and DCB classification must constrain claims and functionality before implementation, not before “pilot discussion”.
9. **“No personal risk prediction” does not prevent medical-device qualification.** Software intended for prevention, treatment or alleviation of disease, or to influence treatment, may still qualify; wording and functionality need an explicit MHRA assessment.
10. **No-human-monitoring and conversational crisis detection are incompatible design directions.** Either remove the open channel or create a governed monitored service; a disclaimer is not a third option.

## Required changes

### P0: before any external or patient-like demonstration

1. Rename externally to a neutral, non-endorsed working title unless MPFT approves the name.
2. Limit access to the development team and approved reviewers; synthetic persona selection only.
3. Disable free-text AI, manual health profiles and all server transmission of profile/coaching data.
4. Appoint the accountable manufacturer, executive risk owner and competent CSO; open the DCB0129 clinical-risk-management plan and hazard log.
5. Write and approve the intended-purpose statement, claims register, exclusions, foreseeable misuse and system boundary.
6. Create a clinical-content governance SOP with reviewer qualifications, dual review, versioned claim traceability, publication authority, expiry, incident and recall.
7. Approve emergency, mental-health, safeguarding, pregnancy and under-18 hand-offs; verify geographic scope and accessibility.
8. Remove admin capabilities from externally reachable builds.
9. Complete preliminary DPIA/PECR/data-flow work even for a restricted demo; prove logs and analytics contain no profile content.
10. Add a safety kill switch, release manifest and rollback plan.

### P1: before staff/PPI usability with any self-entered information

1. Obtain written MPFT IG/DPO, Caldicott/SIRO as applicable, CSO, cyber and R&D classification decisions.
2. Define controller/processor roles, Article 6 basis, Article 9 condition, common-law confidentiality route, retention, rights and privacy information.
3. Complete DPIA, data processing/sub-processor agreements and international-transfer assessment.
4. Run DCB0129 hazard workshops including users, clinical evidence, behaviour change, safety, IG, accessibility and engineering.
5. Produce an approved CSCR/hazard log for the tested version and record residual-risk acceptance.
6. Complete threat model, dependency/SBOM management, penetration testing plan, CSP and secure logging verification.
7. Conduct manual WCAG 2.2 AA and critical-flow testing with relevant disabled users.
8. If AI remains proposed, evaluate a locked model with a prespecified clinical test plan and independent review before enabling it.

### P2: before real NHS participants or pilot deployment

1. Use HRA tools and MPFT R&D to classify the work; if research, appoint sponsor/CI and obtain all HRA/REC/local approvals before recruitment.
2. Obtain documented MHRA qualification/classification advice. If a device, complete the applicable conformity, registration, clinical evidence, quality and post-market requirements; if an investigational device, follow MHRA/REC requirements.
3. Complete current DTAC using the form downloaded at assessment time; do not self-market as “DTAC approved”.
4. MPFT must complete DCB0160 for its local workflow and accept/mitigate transferred hazards.
5. Complete applicable DSPT/CAF-aligned assurance, Cyber Essentials/penetration testing and incident exercises.
6. Establish monitored operational ownership, service levels, complaints, safeguarding, clinical incident and evidence recall routes.
7. Complete equality impact, digital inclusion, accessibility statement, human factors/usability and health-inequality evaluation.
8. Complete procurement/legal route, supplier due diligence, AI/provider contract, indemnity and exit/data-return plan.

## Assumptions

1. The repository is not yet an MPFT-authorised service and has no appointed CSO, DPO-approved DPIA, study sponsor or MHRA decision.
2. The active application may not yet implement all components described by the architecture; this review addresses the proposed system and foreseeable implementation.
3. V1 is intended for England/Great Britain. Scotland, Wales and Northern Ireland require jurisdiction-specific reassessment.
4. Users can reach any public URL and can enter real information despite warnings.
5. OpenAI and Cloudflare would be external suppliers/sub-processors unless contracts establish otherwise.
6. No clinician monitors interactions and no emergency integration exists.
7. “VERIFIED” evidence has not yet undergone a formally defined two-person clinical/methodological approval process.
8. MPFT internal policies and named governance routes not available publicly must be obtained directly; the Trust’s public privacy notice identifies its Caldicott Guardian, SIRO and DPO contact but does not approve this project: [MPFT privacy notice](https://www.mpft.nhs.uk/about-us/privacy-notice).

## Major risks

- **Critical:** a generated, scientifically styled but unsupported personal claim changes health behaviour.
- **Critical:** urgent or suicidal content is not recognised and the conversational interface delays human help.
- **Critical:** medicine information becomes implicit personal treatment selection.
- **Critical:** the tool is piloted as “service evaluation” without correct research/device approvals.
- **High:** real health information is processed by logs, hosting or AI suppliers without a lawful, transparent and contractually controlled route.
- **High:** MPFT endorsement or monitoring is inferred from the product name and context.
- **High:** stale content or a silent model update changes safety behaviour after release.
- **High:** inaccessible safety, uncertainty or deletion content disadvantages users already at higher risk of digital exclusion.

## Confidence

**Overall: high (0.88) that the proposed architecture is not ready for patient/public exposure; moderate (0.72) on the exact future regulatory route.**

- High confidence on the need for DCB0129/0160 role separation, CSO-led lifecycle artefacts, current DTAC, DPIA, controller/processor analysis, research classification, accessibility and procurement work.
- Moderate confidence on whether the final intended product qualifies as SaMD. Current features could be kept on the lifestyle/information side, but personalised smoking-cessation coaching and treatment influence create a real borderline. Only a precise intended-purpose dossier and competent MHRA/regulatory assessment can settle it.
- Low confidence on the safety of any free-text LLM coach without product-specific evaluation data, target performance, human factors testing and an operational safety system.

## What is most likely wrong in this review?

1. DCB applicability may be narrower for a developer-only, access-controlled synthetic demonstration than this review assumes. I nevertheless apply DCB principles early because the declared end-use is NHS health coaching and design choices now create later hazards.
2. The eventual intended-purpose statement might keep the product outside medical-device scope by limiting it to general information and user-authored lifestyle planning. Conversely, the actual UI and evaluation claims may bring it into scope despite careful wording.
3. MPFT may already have internal innovation, clinical-safety, IG, research and procurement pathways not visible publicly; the roadmap may duplicate or misname local gates.
4. A highly constrained, independently validated free-text system could eventually be safer than a menu-only coach for some users, but no evidence supplied here justifies that trade-off.
5. Local web storage may qualify for a PECR exception when it is strictly necessary for a user-requested progress service. That must be documented purpose by purpose; it is not automatic.
6. Exact emergency wording and routes may change. They require local clinical approval and scheduled currency checks rather than copying this review.

## Source register

Primary/current sources used in addition to those linked above:

- [DCB0129 implementation guidance](https://digital.nhs.uk/binaries/content/assets/website-assets/data-and-information/information-standards/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems/0129242018impguid.pdf)
- [DCB0160 implementation guidance](https://digital.nhs.uk/binaries/content/assets/website-assets/data-and-information/information-standards/standards-and-collections/dcb0160/0160252018impguid.pdf)
- [NHS England AI information-governance hub](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence)
- [ICO lawful-basis guidance updated for DUAA](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/)
- [ICO special-category-data rules](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/)
- [ICO DPIA criteria](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/)
- [National Data Guardian Caldicott Principles](https://www.gov.uk/government/publications/the-caldicott-principles)
- [HRA UK Policy Framework version 3.4](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/uk-policy-framework-health-social-care-research/uk-policy-framework-health-and-social-care-research/)
- [HRA medical devices and software applications](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/medical-devices-and-software-applications/)
- [MHRA medical-device clinical-investigation guidance](https://www.gov.uk/government/publications/medical-devices-that-need-a-clinical-investigation)
