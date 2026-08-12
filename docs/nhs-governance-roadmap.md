# NHS Governance Roadmap: MPFT Evidence Coach Smoking Prototype

**Prepared:** 12 August 2026
**Jurisdiction:** England / Great Britain unless stated otherwise
**Status:** Governance plan only. It is not evidence of compliance, approval, research sponsorship, MHRA classification, DTAC completion or clinical-safety sign-off.

## Executive position

There is no safe shortcut from a synthetic demonstration to an NHS pilot. The project currently lacks the accountable roles, intended-purpose decision, clinical safety case, data-protection route, research classification, regulatory decision, accessibility evidence, cyber assurance, operational ownership and procurement approval needed for real users.

The only defensible near-term release is an access-controlled synthetic demonstration. It must not accept real health profiles, expose a free-text coach, claim MPFT/NHS endorsement, or be described as “compliant”. Governance work must begin before functionality becomes harder to constrain.

The route to an NHS pilot has five gates:

```mermaid
flowchart LR
  G0["G0: ownership and intended purpose"] --> G1["G1: controlled synthetic demonstration"]
  G1 --> G2["G2: staff/PPI formative testing"]
  G2 --> G3["G3: approved real-participant study"]
  G3 --> G4["G4: MPFT/NHS pilot deployment"]
  G4 --> G5["G5: operated service and surveillance"]
```

Passing one gate does not imply permission for the next. If the intended purpose, AI behaviour, evidence claims, user group, data flow, model, host or study design changes, re-assessment is required.

## Current position as of 12 August 2026

### DCB0129 and DCB0160

DCB0129 and DCB0160 remain mandatory information standards under section 250 arrangements for health IT in England. The operative public releases are the 2018 updates. NHS England opened a consultation on revisions on 29 June 2026, closing 11 September 2026. The project must use current published requirements now and monitor the review; “under review” does not suspend the standards. Sources: [NHS clinical risk management standards](https://digital.nhs.uk/services/clinical-safety/clinical-risk-management-standards), [DCB0129 current page](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems/), [DCB0160 current page](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems), and [2026 review/consultation](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/review-of-digital-clinical-safety-standards-dcb0129-and-dcb0160).

- **DCB0129:** the organisation acting as manufacturer/developer must run clinical risk management across design, build, release, maintenance and decommissioning. “Manufacturer” includes developer/supplier/integrator, including an NHS organisation building in house.
- **DCB0160:** each deploying health organisation must assess the product in its local workflow, receive and manage transferred hazards, put local controls/training/contingencies in place and accept residual risk. A supplier’s DCB0129 artefacts do not discharge MPFT’s DCB0160 duty.
- Neither standard replaces medical-device regulation. Source: [NHS England applicability recommendation](https://digital.nhs.uk/services/clinical-safety/applicability-of-dcb-0129-and-dcb-0160/nhs-digital-recommendation).

### DTAC

NHS England issued a refreshed DTAC form in February 2026; the previous form must not be used from 6 April 2026. DTAC covers clinical safety, data protection, technical security, interoperability, and usability/accessibility. It applies to software-based DHTs including health-management apps and should still be conducted for trial use outside normal procurement. Manufacturers maintain the form and evidence by product version; the buyer/provider conducts due diligence and retains local responsibility. NHS England currently endorses no third-party DTAC certification scheme. Sources: [DTAC overview/form](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac), [how DTAC works](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac/how-dtac-works), [conducting an assessment](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac/conduct-a-dtac-assessment), and [relationship to other assurance](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac/other-regulatory-and-assurance-processes).

DTAC is a baseline assessment, not an “NHS approved” badge, central licence or substitute for DCB, DSPT, UK GDPR, MHRA, evidence of effectiveness, local workflow assurance or procurement.

### Data protection changes

All data-protection provisions of the Data (Use and Access) Act 2025 were in force by 19 June 2026. The Act amends rather than replaces UK GDPR, the Data Protection Act 2018 and PECR. Current project work must use updated ICO guidance and not a pre-DUAA checklist. Sources: [ICO DUAA organisational guidance](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations/) and [DUAA change summary](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-duaa-summary-of-the-changes/).

### Medical-device/AI regulation

The MHRA regulates medical devices in the UK. Great Britain currently uses the UK MDR 2002 as amended, with transition arrangements for recognised CE-marked devices. MHRA’s National Commission into the Regulation of AI in Healthcare published its call-for-evidence findings in June 2026, but this does not remove current obligations. Sources: [regulating medical devices in the UK](https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk), [software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device), and [2026 AI regulation work](https://www.gov.uk/government/calls-for-evidence/regulation-of-ai-in-healthcare).

## Gate 0: ownership, claims and classification

**Objective:** determine what is being built, by whom, for whom and for what purpose before wider exposure.

### Required decisions

1. **Accountable manufacturer:** MPFT, an individual/company, university, partnership or another legal entity must explicitly accept manufacturer responsibilities. Development location or employment does not decide this automatically.
2. **Deploying organisation:** identify whether MPFT is only a host for development, a future research site, or the deploying care organisation. These roles have different liabilities.
3. **Named owners:** executive sponsor/risk owner, CSO, DPO/IG lead, SIRO, Caldicott Guardian route, cyber owner, product owner, clinical evidence owner, research sponsor/R&D contact, medical-device lead, accessibility owner, procurement/legal lead and communications/brand owner.
4. **Intended-purpose dossier:** versioned description of users, setting, inputs, outputs, claims, actions expected after outputs, exclusions, contraindicated uses, operating assumptions and foreseeable misuse.
5. **Claims register:** every claim in UI, documentation, demo pitch, research protocol and publication mapped to evidence and regulatory/safety impact.
6. **System boundary/data-flow diagrams:** browser, hosting, evidence database, API, model provider, logs, analytics, administrators, source links and research systems.
7. **Project classification:** developer demonstration, PPI/formative evaluation, service evaluation/QI, research, medical-device clinical investigation, or combinations split into defined phases.

### Medical-device decision

Do not infer “not a device” from disclaimers, lack of diagnosis or the word “coach”. Under UK MDR, software may be a device when intended for diagnosis, prevention, monitoring, treatment or alleviation of disease. MHRA guidance indicates that pure general wellbeing/lifestyle choices or referral information may be outside scope, while software that influences actual treatment or predicts disease risk is likely in scope. Sources: [MHRA software-app guidance](https://www.gov.uk/government/publications/medical-devices-software-applications-apps), [medical-purpose examples](https://www.gov.uk/government/publications/medical-devices-that-need-a-clinical-investigation/determining-if-a-clinical-investigations-is-required), and [crafting an intended purpose](https://www.gov.uk/government/publications/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd).

For this product, the borderline is real:

- general verified smoking information and self-authored lifestyle goals may remain outside SaMD;
- personalised ranking by comorbidity, advice intended to cause smoking cessation, medicine comparisons, risk-relevant pack-years and generated coaching may be interpreted as prevention/treatment/alleviation or treatment influence;
- research claims about changing smoking behaviour reinforce a therapeutic/preventive intended purpose;
- the actual functionality, presentation, instructions and promotional claims matter, not only a narrow internal statement.

**Action:** produce a documented qualification/classification assessment with competent regulatory advice. Ask MHRA for advice if uncertainty remains; do not allow implementation or research copy to outrun that decision. If a device:

- define legal manufacturer and classification;
- establish the applicable quality/risk/software lifecycle, usability, clinical evaluation and technical documentation;
- complete the conformity route and MHRA registration required before placing it on the GB market;
- establish post-market surveillance/vigilance and change control. New GB post-market-surveillance requirements are part of the current regime: [MHRA PMS scope](https://www.gov.uk/government/publications/medical-devices-post-market-surveillance-requirements/introduction-and-scope).

If the study is a clinical investigation of a non-marked device, or a marked device modified/used for a new purpose, determine whether MHRA notification and flagged REC review are required. MHRA guidance states 60 days’ prior notice for applicable GB device investigations: [clinical investigations in Great Britain](https://www.gov.uk/guidance/clinical-investigations-in-great-britain) and [HRA devices/software guidance](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/medical-devices-and-software-applications/).

### Gate 0 evidence

- Signed role/accountability record.
- Intended purpose and claims register v1.
- System context and data-flow diagrams.
- Written DCB applicability decision by/with CSO.
- Written MHRA qualification/classification rationale and advice record.
- Written R&D project-classification record.
- External project-name/brand decision.

**No-go:** no accountable manufacturer/CSO, ambiguous therapeutic claims, or disagreement about research/device status.

## Gate 1: controlled synthetic demonstration

**Objective:** permit controlled design review without pretending this is a clinical or research deployment.

### Permitted

- Access-controlled environment.
- Fixed, clearly synthetic personas.
- Static reviewed evidence cards and deterministic example calculations.
- Usability review by named staff acting as reviewers, not patients.
- No collection of reviewer health information.

### Prohibited

- Public URL or search indexing.
- Manual real profile entry.
- Free-text health coaching or model transmission.
- MPFT/NHS endorsement claims.
- “Clinically safe”, “DTAC approved”, “GDPR compliant”, “evidence verified” or effectiveness claims without the relevant artefacts.
- Recruitment, outcome measurement or behaviour-change instructions presented as care.

### Clinical safety work: DCB0129 starts here

The manufacturer and CSO should create:

1. Clinical Risk Management System and policy proportionate to the organisation.
2. Clinical Risk Management Plan for the defined product/version.
3. System definition and intended-use boundary.
4. Hazard workshops and living hazard log covering evidence, AI, user interface, data, external links, availability, misuse, accessibility and deployment.
5. Safety requirements linked to tests and release evidence.
6. Clinical incident/issue process, change control and decommissioning assumptions.
7. Initial CSCR stating what is and is not assured.

The CSO must meet the current standard’s professional-registration and risk-management competence requirements; assigned personnel need recorded competence. Source: [DCB0160 specification, which sets CSO competence requirements used across clinical safety work](https://digital.nhs.uk/binaries/content/assets/website-assets/data-and-information/information-standards/standards-and-collections/dcb0160/0160252018spec.pdf). Use the relevant DCB0129 specification/implementation guidance for manufacturer artefacts: [DCB0129 implementation guidance](https://digital.nhs.uk/binaries/content/assets/website-assets/data-and-information/information-standards/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems/0129242018impguid.pdf).

### Preliminary privacy/cyber work

Even a synthetic demonstration needs verified logging, analytics and storage behaviour. Create a data inventory, PECR assessment, threat model, secrets plan, SBOM/dependency policy, backup/deletion map and incident contacts. Confirm by test that no profile/prompt data reaches server/platform logs.

Browser local storage is covered by PECR’s storage/access rules. Tell users what is stored and why, and document whether each purpose is exempt or needs consent. Sources: [ICO web-storage scope](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/) and [ICO PECR rules](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-pecr-rules/).

### Gate 1 evidence

- CSO-approved risk plan/hazard log for demo boundary.
- Synthetic-data and access-control test evidence.
- No-AI/no-real-input configuration evidence.
- Preliminary DPIA/PECR screen and data map.
- Security threat model and critical vulnerability closure.
- Accessibility smoke test and prototype disclaimer review.

**No-go:** public exposure, writable admin in public build, profile/prompt logging, or open free text.

## Gate 2: staff and PPI formative testing

**Objective:** learn about comprehension, usability, safety language and acceptability without yet evaluating efficacy.

PPI is not automatically research, and PPI contributors are not automatically study participants. But collecting their health data, asking them to change smoking, comparing intervention arms or producing generalisable findings may make the activity research. Define reviewer tasks and data collection precisely with MPFT R&D before inviting anyone.

### Data protection, confidentiality and Caldicott

1. **Identify controllers/processors/joint controllers for every purpose.** MPFT should determine the purpose where acting as health/care controller; contracts must prevent suppliers using data for their own training or secondary purposes. NHS England’s current AI IG guidance requires explicit role analysis and data-processing agreements: [AI guidance for IG professionals](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence/guidance-for-ig-professionals).
2. **Select and document an Article 6 lawful basis and a separate Article 9 special-category condition before processing.** Do not use prototype acknowledgement as consent or assume public task/health-care/research conditions. The controller and purpose decide. Sources: [ICO lawful-basis guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/) and [special-category rules](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/).
3. **Complete a DPIA before AI implementation.** AI plus health data, novel processing and vulnerable contexts is high-risk. NHS England says a DPIA must be completed prior to implementing AI in health/care; ICO criteria include innovative AI and high-risk processing. Sources: [NHS AI DPIA guidance](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence/guidance-for-ig-professionals) and [ICO DPIA criteria](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/).
4. **Address common-law confidentiality separately.** A UK GDPR basis does not itself permit disclosure of confidential patient information. Use anonymous data where possible; otherwise obtain a valid confidentiality route. If research cannot practicably obtain consent, Section 251/CAG may be relevant, but it is not an automatic exemption. Source: [HRA Confidentiality Advisory Group](https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/).
5. **Apply all eight Caldicott Principles, including no-surprises transparency.** Do not reduce Caldicott to “minimum necessary”; justify purpose, necessity, access, awareness, duty to share where relevant and clear user information. Source: [National Data Guardian Caldicott Principles](https://www.gov.uk/government/publications/the-caldicott-principles).
6. **Data-flow and contracts:** list fields, purposes, retention, deletion, backups, logs, support access, sub-processors, training prohibition, audit rights, security, breach notification and exit. Use Article 28 terms and NHS templates where appropriate: [ICO processor-contract requirements](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/what-needs-to-be-included-in-the-contract/) and [NHS Data Sharing and Processing Agreement template](https://digital.nhs.uk/data-and-information/information-governance/templates/universal-ig-templates/data-sharing-and-processing-agreement-dspa).
7. **International transfers:** determine actual data access/storage locations, not only hosting region. Apply the ICO three-step test; if a restricted transfer needs safeguards, complete the current data-protection test/transfer risk assessment and IDTA/Addendum route as applicable. Sources: [ICO international-transfers guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/) and [transfer safeguards](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/how-do-we-comply-with-the-transfer-rules-if-were-initiating-the-restricted-transfer/).
8. **Rights/transparency:** issue layered privacy information naming AI and recipients, logic/limitations, purpose, retention, rights, complaint route and changes. Provide access, rectification, restriction/objection and deletion handling appropriate to the lawful basis; distinguish local deletion from copies elsewhere.
9. **Caldicott/DPO/SIRO route:** engage MPFT’s current role-holders through its IG process. MPFT’s public privacy notice identifies the Trust as controller and publishes its DPO contact; it does not cover this project automatically: [MPFT privacy notice](https://www.mpft.nhs.uk/about-us/privacy-notice).

### AI-specific assurance

- Pin evaluated model and prompt/retrieval versions; forbid silent alias changes.
- Define clinical safety/performance metrics, test sets, subgroup/language coverage and unacceptable failure thresholds.
- Keep exact claims/numbers/citations deterministic; test semantic entailment, not ID presence only.
- Document data sources, supplier terms, moderation, retention, human review, outages and known limitations.
- Add a user feedback/complaint route, safety kill switch, rollback and model-change approval.
- Prepare an Algorithmic Transparency Recording Standard record as good practice. ATRS is mandatory for government departments and certain arm’s-length bodies and recommended more broadly; confirm MPFT applicability rather than assume it: [ATRS hub](https://www.gov.uk/government/collections/algorithmic-transparency-recording-standard-hub).

### Accessibility, equality and inclusion

- Target and evidence WCAG 2.2 AA for the complete service, including safety pages, errors, streamed content, charts, admin and downloadable material.
- Publish an accessibility statement for an MPFT/public-sector deployment and maintain it.
- Complete an Equality Impact Assessment and digital-inclusion assessment; evaluate literacy, disability, language, poverty, shared devices and assisted-digital alternatives.
- Test with keyboard, magnification/reflow, VoiceOver/NVDA/JAWS as applicable, speech input, reduced motion, high contrast and cognitive-access needs; automated checks are insufficient.
- The Public Sector Bodies Accessibility Regulations and Equality Act reasonable-adjustment duties are separate from DTAC. Sources: [GOV.UK public-sector accessibility guidance](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps), [NHS WCAG 2.2](https://service-manual.nhs.uk/accessibility/new-criteria-in-wcag-2-2), and [Equality Act reasonable adjustments](https://www.gov.uk/government/publications/reasonable-adjustments-a-legal-duty).

### Gate 2 evidence

- Approved formative-testing/PPI plan and R&D classification.
- DPIA, data-flow map, privacy/PECR assessment, contracts and transfer decision.
- Updated CSCR/hazard log and tested safety content.
- AI evaluation report if AI is enabled; otherwise evidence that it remains disabled.
- Accessibility audit, statement draft, equality/digital-inclusion assessment.
- Cyber test report and incident exercise.

**No-go:** unresolved high DPIA risk, no lawful/confidentiality route, inaccessible critical flows, AI failure above threshold, or activity drifting into research without approvals.

## Gate 3: approved real-participant study

**Objective:** conduct a governed study capable of supporting the proposed generalisable research question.

### Research versus service evaluation/QI/audit

Classify the exact activity, not the wider programme label:

| Type | Defining intent | Likely fit here |
|---|---|---|
| Research | Generate generalisable/transferable new knowledge; may compare or randomise interventions | The proposed standard information vs personalised evidence vs AI coaching comparison is likely research |
| Service evaluation | Judge what standard an existing/current service achieves | Weak fit because this is not currently an MPFT clinical service |
| Service improvement/development | Improve a service in its local context | May fit tightly bounded internal workflow work, but not a generalisable efficacy study |
| Clinical audit | Test current care against a predefined recognised standard | Does not fit the proposed effectiveness question |

Use and retain the HRA tool result, but obtain MPFT R&D confirmation because design and intention can change. Sources: [HRA Is my study research?](https://www.hra-decisiontools.org.uk/research/about.html), [Defining Research table](https://www.hra-decisiontools.org.uk/research/docs/DefiningResearchTable_Oct2022.pdf), and [HRA explanation](https://www.hra.nhs.uk/about-us/news-updates/my-project-research-how-determine-which-projects-require-review-research-ethics-committee/).

### If research

1. Appoint a sponsor that explicitly accepts responsibility; the FY2 cannot self-declare organisational sponsorship. All health/social-care research should have a sponsor. Source: [HRA roles and responsibilities](https://www.hra.nhs.uk/planning-and-improving-research/research-planning/roles-and-responsibilities/).
2. Name Chief Investigator, statistician/methodologist, data controller, sites and delegated responsibilities.
3. Write protocol, statistical analysis plan, participant information/consent, recruitment, withdrawal, adverse-event/safety reporting, data management, monitoring, insurance/indemnity and dissemination plan.
4. Apply through IRAS for HRA/HCRW Approval and NHS REC opinion where required. Project-based NHS research in England/Wales falls within HRA/HCRW Approval; a REC opinion is one component where applicable. Source: [HRA Approval](https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/) and [applying to a REC](https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/research-ethics-committee-review/applying-research-ethics-committee/).
5. Obtain MPFT capacity and capability/local confirmation before opening the site.
6. Follow the current UK Policy Framework v3.4 (28 April 2026), including sponsor oversight, scientific quality, participant interests, PPI and transparency: [UK Policy Framework](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/uk-policy-framework-health-social-care-research/uk-policy-framework-health-and-social-care-research/).
7. If a medical-device clinical investigation, obtain MHRA notice of no objection where required and use an appropriate flagged REC; do not begin during the notification/approval period.
8. Pre-register the study/protocol where applicable, control versions/models as interventions, and publish results including harms and negative findings.

### Study-specific safety requirements

- The protocol must state who monitors study safety and what it can/cannot monitor; the product must not imply clinical monitoring if none exists.
- Define participant support for urgent symptoms, self-harm, safeguarding, pregnancy, medicine questions and data incidents.
- Treat model, prompt, evidence library and ranking rule as controlled intervention components. A change may require a formal research modification and new DCB/MHRA review. HRA terminology/process changed in 2026; use current IRAS modification guidance: [making changes to research](https://www.hra.nhs.uk/approvals-amendments/amending-approval/).
- Define harm endpoints, unsupported-query/refusal failure, uncited claims, false precision, treatment influence and inequitable failure as safety outcomes.
- Ensure exclusion criteria do not create an unethical dead end; provide current human/specialist routes.

### Gate 3 evidence

- Sponsor acceptance and role delegation.
- HRA/REC/MHRA decisions as applicable and MPFT site confirmation.
- Final protocol, participant materials, DPIA/data management/analysis plans.
- Released intervention manifest and CSO-approved CSCR/hazard log.
- Independent testing and monitoring/incident plan.
- Trial/study registration and insurance/indemnity evidence.

**No-go:** informal recruitment, absent sponsor, retrospective ethics, unapproved device investigation, uncontrolled model changes or no participant safety pathway.

## Gate 4: MPFT/NHS pilot deployment

**Objective:** deploy a versioned, assured product into a defined local service workflow.

### DCB0160 local deployment

MPFT as deploying organisation must:

- appoint its DCB0160 CSO and competent team;
- define local use, users, exclusions, training, support, workflow and interfaces;
- review the manufacturer’s current DCB0129 CSCR/hazard log and import/mitigate transferred hazards;
- identify new local hazards, including workload, false monitoring expectations, referral capacity, downtime and workarounds;
- validate configuration, hosting, links, content, accessibility, device/browser support and data flows;
- create its local hazard log and DCB0160 CSCR, with CSO approval and executive residual-risk acceptance;
- train users/support teams, exercise downtime/incident/rollback, and plan decommissioning.

The DCB0160 guidance describes a living hazard log accompanying each CSCR and CSO approval: [DCB0160 implementation guidance](https://digital.nhs.uk/binaries/content/assets/website-assets/data-and-information/information-standards/standards-and-collections/dcb0160/0160252018impguid.pdf).

### DTAC and evidence of value

- Download and complete the current DTAC form at assessment time for the exact product version.
- Manufacturer supplies complete evidence; MPFT SMEs independently assess it across all five domains.
- Record product/version/result and reassess expiring or changed elements. Trial status does not remove DTAC expectation.
- Do not rely on a third-party “DTAC certificate”; NHS England currently endorses none.
- Use NICE’s Evidence Standards Framework to plan the level of effectiveness and economic evidence expected for commissioning; this is distinct from regulatory/DTAC safety: [NICE ESF](https://www.nice.org.uk/what-nice-does/digital-health/evidence-standards-framework-esf-for-digital-health-technologies).

### Cyber and information assurance

1. Determine which organisation completes which DSPT scope. Products accessing NHS systems/patient data require supplier/provider DSPT consideration; DTAC does not duplicate it. Source: [DSPT](https://www.dsptoolkit.nhs.uk/) and [DTAC/DSPT relationship](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac/other-regulatory-and-assurance-processes).
2. Note the current transition: NHS England is moving organisations progressively to a CAF-aligned DSPT with a health/care overlay; organisations not yet migrated continue against the existing NDG-standard basis. Source: [CAF-aligned DSPT evolution, May 2026](https://digital.nhs.uk/data-and-information/information-governance/evolution-of-our-assurance-model).
3. Obtain Cyber Essentials/Plus level required by MPFT/procurement, independent penetration testing, vulnerability management, secure SDLC, dependency/SBOM, secrets rotation, MFA/RBAC, immutable admin audit, encryption, backups/restore, logging/redaction, rate limiting, abuse protection, supplier assurance and incident response.
4. Assess Cloudflare/OpenAI and every sub-processor against NCSC cloud principles, data location, support access, resilience, exit and supply-chain risks. Sources: [NCSC cloud security principles](https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles) and [secure development](https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles/principle-7-secure-development).
5. Complete disaster recovery and business continuity. Critical signposting must not depend on the model provider.

### Procurement and contracting

- The Procurement Act 2023 has applied to public procurement commenced from 24 February 2025; current Cabinet Office guidance covers planning, tendering, award, transparency and contract management: [Procurement Act guidance collection](https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents).
- NHS Provider Selection Regime (PSR) applies to procurement of healthcare services by relevant authorities, not goods or non-healthcare services unless part of a qualifying mixed procurement. Software/SaaS alone will usually use the Procurement Act/local standing financial instructions; a contracted smoking-cessation service including the tool may require PSR/mixed-procurement analysis. Sources: [NHS PSR overview](https://www.england.nhs.uk/commissioning/how-commissioning-is-changing/nhs-provider-selection-regime/) and [PSR FAQ on Procurement Act interaction](https://www.england.nhs.uk/commissioning/how-commissioning-is-changing/nhs-provider-selection-regime/provider-selection-regime-frequently-asked-questions/).
- MPFT procurement/legal must decide the route; the developer must not treat a pilot, grant or zero-price product as exempt from due diligence.
- Contract schedules must cover clinical safety responsibilities/hazard transfer, data protection, sub-processors/transfers, information security, service levels, audit, accessibility, AI/model/evidence changes, performance claims, indemnity/insurance, IP/source licensing, incident/regulator cooperation, business continuity, termination, data return/deletion and transition/escrow as appropriate.
- Include current NHS modern-slavery/supply-chain and net-zero requirements where applicable; software procurement is still subject to local/national commercial policy. Source: [NHS modern slavery procurement guidance](https://www.england.nhs.uk/long-read/tackling-modern-slavery-in-nhs-procurement/).

### Gate 4 evidence

- MPFT DCB0160 CSCR/hazard log and deployment approval.
- Current DTAC form and MPFT assessment record.
- DSPT/CAF-aligned evidence and cyber closure report.
- MHRA status/conformity evidence as applicable.
- DPIA, contracts, privacy/PECR, transfer and retention records.
- Accessibility statement/audit and equality/digital inclusion plan.
- Procurement award/contract and operational readiness record.
- Final go-live checklist, training, incident/downtime/rollback exercise.

**No-go:** unresolved catastrophic/high clinical hazard, outdated DTAC, missing DCB0160 acceptance, unsupported medical-device claim, missing data contract, failed penetration/accessibility test or no operational owner.

## Gate 5: live operation, surveillance and decommissioning

**Objective:** maintain safety and compliance after go-live rather than treating approval as a one-time event.

### Operating controls

- Named 24/7 or defined-hours operational ownership consistent with what users are told.
- Clinical incident, safeguarding, privacy/security incident, complaint and model/evidence-quality routes with severity and response targets.
- Safety telemetry that excludes unnecessary health text but can detect unsupported claims, refusal failures, outages, stale evidence and subgroup disparities.
- Periodic evidence/content review and immediate withdrawal/recall mechanism.
- Reassessment triggers for model, prompt, evidence, ranking, user population, new module, hosting, sub-processor, data, regulation and UI/safety copy changes.
- CSO review and new CSCR/hazard-log baseline for safety-significant releases; MPFT DCB0160 review for local changes.
- DPIA/privacy/contract/transfer/DTAC/DSPT/accessibility updates where affected.
- Medical-device PMS/vigilance and regulator reporting where applicable.
- Study modifications through current HRA/MHRA routes when research is ongoing.
- Annual/accessibility review and real-user inclusion monitoring.
- Tested decommissioning: communication, data export/deletion, records retention, evidence/citation archive, contract exit, URL closure and safe user redirection.

### Release and change categories

| Change | Minimum review |
|---|---|
| Typo with no clinical meaning | Documented content review and regression |
| Patient-facing clinical/evidence wording | Clinical content approval, traceability, hazard assessment |
| New/changed evidence or ranking | Methodological + clinical review, retrieval/safety regression, CSO impact decision |
| Model/prompt/moderation/SDK change | Full AI clinical regression, DPIA/supplier review, CSO release decision |
| New population, pregnancy/under-18 pathway or medicine personalisation | New intended-purpose/MHRA, DCB, equality, evidence and research assessment |
| New data field, analytics, processor or location | DPIA/PECR, contract, transfer, security and transparency update before processing |
| New health module | New module-specific hazards/evidence/intended purpose; architecture contract alone is insufficient |

## Governance workstreams and accountable outputs

| Workstream | Accountable role (to confirm locally) | Required outputs |
|---|---|---|
| Product/manufacturer | Executive sponsor/product owner | Intended purpose, claims register, legal manufacturer, roadmap, benefits/risks |
| Clinical safety manufacture | Manufacturer CSO | DCB0129 risk plan, hazard log, safety requirements, CSCR, release/change/incident records |
| Clinical safety deployment | MPFT CSO/executive clinical risk owner | DCB0160 plan, local hazard log/CSCR, training, contingency, residual-risk acceptance |
| Clinical evidence/content | Clinical evidence owner + methodologist | Source/finding/claim traceability, dual review, expiry, publication/recall SOP |
| Medical-device regulation | Manufacturer regulatory lead | Qualification/classification, MHRA advice, QMS/technical/clinical/PMS artefacts if device |
| Research | Sponsor/CI/MPFT R&D | Classification, protocol, IRAS/HRA/REC/MHRA/site approvals, monitoring, registration/results |
| Privacy/confidentiality | Controller, DPO/IG, Caldicott route | DPIA, Article 6/9, CLDC route, PECR, privacy, rights, retention, DSPA, transfers |
| Information security | SIRO/CISO/cyber lead | DSPT/CAF, threat model, pen test, SBOM, incident/BCP/DR, supplier/cloud assurance |
| AI assurance | Product/clinical/IG/technical owners jointly | Model card, evaluation, version manifest, change thresholds, ATRS decision, rollback |
| Accessibility/equality | Service owner/accessibility/equality leads | WCAG 2.2 audit, statement, EIA, inclusive research, assisted route |
| Commercial/legal | MPFT procurement/legal | Route (Procurement Act/PSR), due diligence, contract, indemnity/IP/exit |
| Communications/brand | MPFT communications/legal | Name, disclaimer, public claims, publication/demo approval |

Named local roles must be verified immediately before use; public web pages are not a delegation of responsibility. MPFT’s public privacy notice currently identifies its Trust-level DPO contact, Caldicott Guardian and SIRO: [MPFT privacy notice](https://www.mpft.nhs.uk/about-us/privacy-notice).

## Required artefact index

No artefact below should be generated merely to satisfy a checklist; it must reflect the released version and be approved by the correct owner.

### Clinical/product

- Intended-purpose statement and claims register.
- System definition and clinical risk management plan.
- Hazard log, safety requirements traceability and CSCR for DCB0129.
- Deployment hazard log/CSCR for DCB0160.
- Clinical content/evidence governance SOP and review records.
- Safety scenario matrix, clinical test report, incident/recall/rollback/decommissioning plans.
- Benefits realisation and human-factors/usability evidence.

### Regulatory/research

- Medical-device qualification/classification memo and MHRA correspondence.
- QMS/technical documentation/conformity/registration/PMS as applicable.
- HRA decision outputs, sponsor acceptance, IRAS/HRA/REC/MHRA/site approvals.
- Protocol, participant information/consent, SAP, monitoring, indemnity and transparency records.

### Information governance/cyber

- Record of processing, controller/processor matrix and end-to-end data flow.
- DPIA, lawful basis/Article 9 and common-law confidentiality assessment.
- PECR storage/access inventory and consent/exception rationale.
- Privacy notices, retention/deletion schedule, rights procedure, data-breach plan.
- Article 28/DSPA, sub-processor list and international-transfer assessment.
- DSPT/CAF evidence, DTAC C2/C3 evidence, threat model, pen test, SBOM, BCP/DR.

### Accessibility/commercial/operations

- WCAG 2.2 AA audit and public accessibility statement.
- Equality/health inequalities/digital inclusion impact assessments.
- Current DTAC form and local assessment record.
- Procurement/legal decision and executed contract schedules.
- Training, support, complaint, safeguarding, incident and change-control procedures.
- Versioned go-live and periodic re-assurance records.

## Immediate 30/60/90-day action plan

### Days 0 to 30

1. Restrict the application to synthetic internal demonstrations and disable free text/server AI.
2. Obtain written project sponsorship from the responsible MPFT directorate or remove MPFT naming.
3. Convene MPFT CSO/clinical safety, IG/DPO, SIRO/Caldicott route, cyber, R&D, regulatory, accessibility and procurement contacts.
4. Draft intended purpose, claims register, system/data-flow diagrams and project-phase definitions.
5. Open DCB0129 clinical risk plan/hazard log and preliminary DPIA/PECR/threat model.
6. Run HRA research classification against the actual proposed study and request MPFT R&D confirmation.
7. Commission written medical-device qualification/classification advice.

### Days 31 to 60

1. Establish evidence/content dual-review and recall process.
2. Complete initial safety hazard workshop and map controls to tests.
3. Complete supplier/sub-processor, transfer and contract gap analysis.
4. Run accessibility/equality/digital-inclusion formative review.
5. Define AI evaluation protocol, but do not enable AI until it passes and governance accepts it.
6. Draft current DTAC evidence pack against the post-April-2026 form.
7. Decide study sponsor, protocol route, indemnity and approvals if research proceeds.

### Days 61 to 90

1. Baseline the CSO-approved demo CSCR/hazard log.
2. Close critical security/accessibility/data-flow defects and exercise incident/rollback.
3. Submit regulatory/research applications only after the product and study are stable enough to describe accurately.
4. Obtain independent evidence-methodology and clinical-safety challenge of the released content.
5. Decide whether the value of free-text AI justifies its residual risk; the default remains no.
6. Produce a gate decision record: remain synthetic, proceed to governed formative testing, or stop/redesign.

## Assumptions

1. V1 would be used in England and hosted for Great Britain; cross-border use is not approved.
2. No real-patient/participant data is currently authorised and no study sponsor or approvals exist.
3. MPFT is not yet confirmed as legal manufacturer, controller for the proposed AI processing, research sponsor or deploying organisation.
4. OpenAI, Cloudflare and any analytics/logging vendors may process data and must be assessed from actual contracts/configuration.
5. No existing DTAC, DCB0129/0160, DPIA, DSPT project scope, MHRA decision or pen test has been evidenced to this reviewer.
6. The proposed comparative/factorial question aims at generalisable knowledge and is likely research.
7. The exact intended purpose can still be narrowed; medical-device status is therefore unresolved rather than declared.
8. MPFT internal policies, committees and standing financial instructions may impose additional or differently named gates.

## Major risks

| Risk | Consequence | Governance response |
|---|---|---|
| Informal “prototype” becomes de facto public service | Unassured harm, data processing and institutional liability | Access control and explicit gate authority; no public URL before Gate 4 |
| Manufacturer/deployer/controller roles remain ambiguous | Duties fall between MPFT, developer and suppliers | Signed role matrix and contracts at Gate 0 |
| Product is a medical device but treated as wellbeing software | Unlawful placing/investigation and insufficient evidence/PMS | Intended-purpose dossier and competent MHRA decision before study |
| Research is labelled service evaluation | No sponsor/ethics/governance; invalid findings | HRA tool + MPFT R&D classification per phase |
| DTAC is treated as a certificate | Local hazards, value and regulatory gaps ignored | Current form plus SME/local due diligence and DCB0160 |
| Health text leaks into model/platform logs | Confidentiality/data-protection breach | Verified data flow, contracts, logging tests, minimisation and DPIA |
| Model/evidence changes after assurance | Safety case no longer matches product | Version manifest, change triggers, regression, CSO release and rollback |
| Accessibility/digital exclusion distorts benefit | Inequitable uptake/harm and legal non-compliance | WCAG, EIA, assisted routes and subgroup evaluation |
| Procurement/exit ignored during pilot | Lock-in, uncontrolled sub-processors and unsafe decommissioning | Procurement/legal route and contract schedules before deployment |

## Disagreements with the master/product direction

1. **A future remote-persistence feature flag should not exist in V1.** Create documentation/interfaces only; an executable adapter is an avoidable governance bypass.
2. **The coach should not accept free text in the first governed study.** Selectable intent cards can test much of the behavioural mechanism with materially lower risk.
3. **Patient use cannot be authorised merely by avoiding direct identifiers.** Smoking and comorbidity profiles are sensitive health data; public access makes real input foreseeable.
4. **A “research prototype” is not a regulatory category.** Research, DCB, UK GDPR, accessibility and medical-device duties are determined independently.
5. **Service evaluation is not a convenient pilot route.** A new intervention designed to generate generalisable evidence is likely research.
6. **DTAC should not be left until procurement.** Its domains should shape design, but the current assessment still has to be repeated for the released version and local use.
7. **Architecture-level modularity is not governance scalability.** Each new health module creates a new intended purpose, evidence base, hazard set, equality profile and possibly a new regulatory classification.
8. **No product should be described as MPFT’s until local authority is explicit.** A disclaimer does not neutralise branding.

## Required changes to the architecture

1. Add governance state to the release model: intended-purpose version, evidence/content version, model/prompt version, DCB safety-case version, DPIA version, DTAC version, MHRA status and approved environment.
2. Make an external/public build fail closed unless its gate-specific approval manifest is present.
3. Remove free-text coach and manual health entry from Gate 1; make AI a separately deployable/disabled capability.
4. Add immutable evidence publication events with two-person approval and recall, not a mutable `status` field alone.
5. Separate safety-critical metrics from product analytics and prohibit prompt/profile logging by schema.
6. Replace “delete my demo data” with a complete storage statement and deletion semantics across browser, edge/server, supplier and backup layers.
7. Make emergency/help and excluded-group routes static, accessible, versioned and available during AI outage.
8. Add an operational control plane for kill switch, rollback, evidence recall and version inspection before any real deployment.
9. Remove admin mutation from public builds; later require MFA, RBAC, segregation of duties and audit.
10. Treat accessibility, model/provider change, source staleness, ranking and deployment workflow as explicit clinical hazards.

## Confidence

**Overall confidence: high (0.87) in the gate structure and current national requirements; moderate (0.70) in the exact project-specific legal/regulatory classification.**

- High: DCB0129/DCB0160 division, post-April-2026 DTAC position, DPIA/UK GDPR/PECR/Caldicott work, HRA route, accessibility requirements, Procurement Act/PSR distinction and operational assurance need.
- Moderate: whether MPFT or another entity will be manufacturer/controller/sponsor; whether DSPT applies to the supplier at each phase; which procurement route a bundled service will use.
- Unresolved: SaMD qualification/classification, exact REC/MHRA requirements for the eventual study and local MPFT committee/approval sequence.

## What is most likely wrong here?

1. The future intended-purpose wording may be narrow enough to stay outside medical-device scope, or actual behaviour may place it more clearly inside than this roadmap suggests. Formal advice is essential.
2. MPFT may classify tightly controlled formative work as PPI/service development with lighter local governance. That would not authorise efficacy evaluation or public patient use.
3. DCB standards may be revised after the September 2026 consultation, changing artefact terminology or scope. Recheck at every gate.
4. DTAC may gain a central repository/certification approach; NHS England was still exploring this in May 2026 and currently endorsed no scheme.
5. The ICO is still updating some guidance after DUAA, including international-transfer materials. The linked current position must be refreshed before processing starts.
6. Cloudflare/OpenAI configurations may support UK/EU processing and stronger retention controls than assumed, but contractual and technical verification, not marketing, must establish this.
7. Local MPFT policy may require more steps, such as a specific digital board, medical-device committee, innovation review, information asset registration or local DPIA template.
8. Procurement classification will depend on whether the Trust buys software, research/development, or a bundled clinical smoking-cessation service; local legal advice must decide.

## Authoritative source index

### Clinical safety and DTAC

- [NHS England clinical risk management standards](https://digital.nhs.uk/services/clinical-safety/clinical-risk-management-standards)
- [DCB0129 current release](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems/)
- [DCB0160 current release](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems)
- [DCB standards 2026 review](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/review-of-digital-clinical-safety-standards-dcb0129-and-dcb0160)
- [Current DTAC](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac)
- [DTAC assessment roles and trial use](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac/conduct-a-dtac-assessment)

### Privacy, confidentiality, AI and cyber

- [ICO DUAA changes](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-duaa-summary-of-the-changes/)
- [ICO lawful basis](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/)
- [ICO special category data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/)
- [ICO DPIAs](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/)
- [ICO storage/access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/)
- [ICO international transfers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/)
- [National Data Guardian Caldicott Principles](https://www.gov.uk/government/publications/the-caldicott-principles)
- [NHS England AI IG guidance](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence/guidance-for-ig-professionals)
- [DSPT](https://www.dsptoolkit.nhs.uk/)
- [CAF-aligned DSPT transition](https://digital.nhs.uk/data-and-information/information-governance/evolution-of-our-assurance-model)
- [NCSC cloud security principles](https://www.ncsc.gov.uk/collection/cloud/the-cloud-security-principles)

### Medical device and evidence

- [MHRA software/AI medical-device collection](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device)
- [MHRA software applications](https://www.gov.uk/government/publications/medical-devices-software-applications-apps)
- [MHRA intended purpose](https://www.gov.uk/government/publications/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd)
- [MHRA regulation in Great Britain](https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk)
- [MHRA clinical investigations](https://www.gov.uk/guidance/clinical-investigations-in-great-britain)
- [NICE Evidence Standards Framework](https://www.nice.org.uk/what-nice-does/digital-health/evidence-standards-framework-esf-for-digital-health-technologies)

### Research, accessibility and procurement

- [HRA Is my study research?](https://www.hra-decisiontools.org.uk/research/about.html)
- [HRA Approval](https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/)
- [HRA UK Policy Framework v3.4](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/uk-policy-framework-health-social-care-research/uk-policy-framework-health-and-social-care-research/)
- [HRA medical devices/software](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/medical-devices-and-software-applications/)
- [GOV.UK accessibility requirements](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps)
- [NHS WCAG 2.2 guidance](https://service-manual.nhs.uk/accessibility/new-criteria-in-wcag-2-2)
- [Procurement Act 2023 guidance](https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents)
- [NHS Provider Selection Regime](https://www.england.nhs.uk/commissioning/how-commissioning-is-changing/nhs-provider-selection-regime/)
