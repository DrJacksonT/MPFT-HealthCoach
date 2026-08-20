# Evidence source manifest for the MPFT pilot plan

**Manifest ID:** `mpft-pilot-evidence-baseline-2026-08-20-v1`

**Prepared:** 20 August 2026
**Purpose:** Fix the local evidence baseline used to design the pilot-ready product and minimum dataset.

## 1. Use boundary

This manifest records which internal research artefacts informed the product plan and how they were interpreted. It does not promote the internal reviews into clinical guidance.

The research pack is AI-assisted and the broader review is not yet a completed publication-grade systematic review. The smoking concept brief is an internal decision document. The gambling PDF is a narrative literature review authored with ChatGPT Deep Research. These are useful evidence maps and synthesis inputs, but pivotal claims must be checked against the original paper or current guideline before they enter patient-facing content, a safety case, a protocol or a publication.

The product must retain the existing evidence rule:

```text
discovery -> extraction -> independent critique -> citation check -> human review -> VERIFIED
```

No source becomes patient-facing merely because it appears in this manifest.

## 2. Local source baseline

Research root:

`C:\Users\theos\Projects\AI Health Coach Research`

| Source | SHA-256 | How it was used | Important limitation |
|---|---|---|---|
| `AI_Health_Coaching_Evidence_Report_2026.md` | `74FCCF8DC16BE4EAC6E5C83356B4B47A2609B607FBF4F83DEAC3BE2F77D6430C` | Overall evidence position, staged evaluation, minimum outcomes, safety, equity, implementation and economics | Evidence cut-off 19 August 2026; review pack has unresolved search, screening and PRISMA work |
| `AI_Smoking_Cessation_Platform_Concept_Brief_2026.md` | `21874FFC76DBC273039E20DD4A747BF38261F77CC6A2B873EB6FC4089F8400B8` | Smoking product hypothesis, user journey, evidence boundaries, evaluation domains and staged discovery | Internal concept, not a protocol, safety case or approval |
| `critical_synthesis.md` | `333F591F7962BE7F3C9418DBB358396D14E0E721B503D96B7498078AE73805BF` | Interpretation rules separating adjunctive/hybrid systems from autonomous LLMs | Working synthesis; inherits review limitations |
| `review_protocol.md` | `31A42BAA31C2F4CF08B6BEF0F37BFED83991E7F427DD5E5FA63D296BB23C15A1` | Outcome taxonomy and rules for effectiveness, engagement, safety, equity and implementation | Protocol for an incomplete review, not a registered completed systematic review |
| `Gambling (unrelated to smoking cessation research)\AI_Health_Coaching_Gambling_Disorder_Literature_Review_revised.pdf` | `D9C888579D83A3BC2B62EEAE74AA15B6887F87906B7DD8504A0FFFC46B75B83B` | Gambling module rationale, treatment-access gap, direct chatbot/LLM evidence, just-in-time use, outcomes and safety constraints | Narrative AI-assisted review; original sources require independent verification |

If any hash changes, create a new manifest version and record which product, protocol, prompt, corpus or outcome decisions were reassessed.

## 3. Evidence position adopted by the plan

### 3.1 Cross-cutting position

- The evidence supports investigating a bounded, source-grounded adjunct in a named care pathway.
- It does not support an autonomous general-purpose AI therapist or health coach.
- Engagement, empathy, satisfaction and disclosure are process measures, not clinical effectiveness.
- The generative layer must be tested against a strong structured/non-generative baseline.
- Human escalation and service integration are part of the intervention and must be measured.
- Smoking and gambling must be evaluated separately because the interventions, outcomes and risks differ.

### 3.2 Smoking position

- Conversational smoking interventions have a promising but heterogeneous signal.
- Stronger results often come from hybrid services that include medication, counselling, monitoring or live support.
- A positive hybrid result does not establish that free-form generative conversation works independently.
- An active-comparator null result means the later study must ask whether generation adds value beyond good digital support.
- Smoking provides an established pathway, a measurable behaviour and objective verification options, making it the preferred first pilot.

### 3.3 Gambling position

- Internet-delivered and self-guided psychological interventions can improve gambling outcomes.
- Direct gambling chatbot evidence remains small and is principally based on structured/rule-based systems.
- Modern LLM responses can appear clinically useful while also producing potentially harmful advice.
- The most defensible use is a low-threshold bridge into care, between-contact support and approved help during urges or relapse.
- Gambling-related suicide risk, acute financial harm and chasing require deterministic safety controls and a named specialist pathway.
- The gambling module should remain behind a separate release gate until these controls and services exist.

## 4. Evidence-to-feature traceability

| Evidence signal | Required feature | Required data |
|---|---|---|
| Adjunctive/hybrid smoking evidence | Named stop-smoking service, referral and treatment-support route | Offer, acceptance, sent, received, completed, treatment uptake and staff workload |
| Smoking behaviour is measurable | Daily/weekly smoking log and scheduled outcomes | Cigarettes/day, quit attempt, abstinence definition, verification and missingness |
| QuitBot active-comparator result did not show superiority | Structured/non-generative comparator mode | Assigned arm, exposure, intervention version and intention-to-treat outcomes |
| MI-style prompt did not show an incremental effect | MI-consistent policy without efficacy claims | Independent fidelity sample plus behavioural outcomes |
| Check-in and relapse literature | Short non-judgemental check-in and user-confirmed lapse/relapse route | Cigarettes, goal attempt, craving, participant-confirmed post-quit status |
| Gambling treatment-access and stigma gap | Private, low-threshold entry and warm hand-off | Recruitment source, help-seeking stage, treatment entry and time to contact |
| Gambling just-in-time literature | `I am about to gamble` quick route and pre-agreed coping plan | Urge, context, protective action, whether gambling occurred and outcome |
| Only two gambling chatbot RCTs and uncertain between-group effects | Feasibility language and separate controlled evaluation | Engagement plus validated gambling behaviour/harm outcomes |
| Harmful advice found in gambling LLM evaluation | Gambling-specific prohibitions and regression set | Advice-request route, refusal correctness, safety incidents and release version |
| NICE gambling suicide-risk recommendations | Direct crisis route and specialist service integration | Trigger, route shown, selection, hand-off time, missed escalation and incident outcome |
| Generative-system drift and citation risk | Release and evidence manifests | App, model, prompt, corpus, rules, claim/source IDs and pre/post-release tests |
| Equity and digital exclusion risks | Accessible multi-channel pathway and subgroup monitoring | Prespecified equity fields, assisted use, device/access, reach, retention, outcome and harm |

## 5. Pivotal smoking sources for verification

| Source | Contribution | Verification status for product use |
|---|---|---|
| [NICE NG209](https://www.nice.org.uk/guidance/ng209) | Current tobacco-dependence pathway and behavioural support | Current official guidance; verify exact recommendation and update date at release |
| [NICE NG183](https://www.nice.org.uk/guidance/ng183) | Digital and mobile behaviour-change interventions | Current official guidance; verify at release |
| [Bendotti et al., 2023](https://doi.org/10.1177/20552076231211634) | Systematic review/meta-analysis of conversational smoking interventions | Verify full text, intervention classes, risk of bias, outcomes and follow-up |
| [He et al., 2023](https://doi.org/10.1093/ntr/ntac281) | Effectiveness/acceptability review | Verify full text and pooled-analysis caveats |
| [Olano-Espinosa et al., 2022](https://doi.org/10.2196/34273) | Dejal@bot pragmatic randomised trial | Verify primary outcome, CO validation, attrition and co-interventions |
| [Bricker et al., 2024](https://doi.org/10.2196/57318) | QuitBot development and randomised trial | Verify ITT outcome, comparator and timing of GPT feature |
| [He et al., 2022](https://doi.org/10.1186/s12889-022-13115-x) | MI-style versus neutral chatbot experiment | Verify outcomes and limitations before using MI claims |
| [Abroms et al., 2025](https://doi.org/10.2196/66896) | Guideline-adherence and misinformation evaluation | Use as failure-mode evidence, not as the error rate of a future locked system |

## 6. Pivotal gambling sources for verification

| Source | Contribution | Verification status for product use |
|---|---|---|
| [NICE NG248](https://www.nice.org.uk/guidance/ng248) | Identification, stigma, motivational engagement, treatment, suicide/self-harm and service integration | Current official guidance; verify exact recommendations at release |
| [Çakmak et al., 2025](https://doi.org/10.1007/s41347-025-00562-7) | Systematic review of gambling chatbot trials | Verify full text, search date, eligibility and between-group results |
| [So et al., 2020 GAMBOT](https://pubmed.ncbi.nlm.nih.gov/32162075/) | Randomised chatbot-delivered CBT trial | Verify primary PGSI and secondary G-SAS results, retention and analysis population |
| [So et al., 2024 GAMBOT2](https://doi.org/10.1016/j.addbeh.2023.107889) | Guided versus unguided chatbot CBT | Verify trial design, supervision and outcomes |
| [Ghaharian et al., 2025](https://doi.org/10.1007/s10899-025-10430-x) | Expert evaluation of modern LLM problem-gambling responses | Verify prompts, raters, model versions and harmful-response themes |
| [Rolvien et al., 2024](https://doi.org/10.1001/jamanetworkopen.2024.17282) | Self-guided internet intervention RCT | Verify primary/secondary outcomes, follow-up and attrition |
| [Sagoe et al., 2021](https://doi.org/10.1556/2006.2021.00062) | Internet-treatment systematic review/meta-analysis | Verify intervention mix and heterogeneity |
| [Smith, Peters and Reiter, 2024](https://journals.plos.org/digitalhealth/article?id=10.1371%2Fjournal.pdig.0000605) | NLP detection of gambling-harm signals | Supports detection research, not diagnosis or treatment efficacy |
| [GamblingLess: Curb Your Urge](https://doi.org/10.2196/25786) | Ecological momentary/just-in-time intervention precursor | Verify outcomes and relevance to proposed quick-support feature |

## 7. Official governance baseline checked on 20 August 2026

- [NHS DTAC](https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac) states that DTAC covers clinical safety, data protection, technical security, interoperability, and usability/accessibility. The current form must be downloaded at the point of use.
- [NHS digital clinical safety assurance](https://www.england.nhs.uk/long-read/digital-clinical-safety-assurance/) describes DCB0129 for manufacturers and DCB0160 for deploying health and care organisations, with a trained Clinical Safety Officer, hazard log and clinical safety case.
- [HRA Is my study research?](https://www.hra-decisiontools.org.uk/research/about.html) supports classification, but the exact project also needs local MPFT R&D confirmation.
- [HRA UK Policy Framework version 3.4](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/uk-policy-framework-health-social-care-research/uk-policy-framework-health-and-social-care-research/) states that health and social care research has a sponsor and requires a justified protocol, integrity, transparency and proportionate risk management.
- [HRA medical devices and software](https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/medical-devices-and-software-applications/) describes ethical review requirements for relevant device investigations or new purposes.
- [MHRA software and AI as a medical device](https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device) makes intended purpose and qualification/classification central and includes specific digital mental health guidance.
- [NHS AI guidance for IG professionals](https://digital.nhs.uk/data-and-information/information-governance/guidance/artificial-intelligence/guidance-for-ig-professionals) should be applied to the approved data flow and supplier arrangement.

These pages are time-sensitive. Recheck them at each governance gate and before protocol submission, procurement or deployment.

## 8. Evidence governance for the product

Each evidence release should have:

- a release ID and cut-off date;
- source file and original-publication identifiers;
- source passage locators;
- extracted claim, outcome, population and limitation;
- independent citation and entailment check;
- named clinical/evidence owner approval;
- patient-facing wording approval;
- review due date and update watch;
- supersession and withdrawal process;
- regression tests for affected responses; and
- links to app, prompt and model releases that used it.

The runtime should publish only records that are verified, active, not superseded and within their review date. Automated freshness checks can flag a record but cannot approve it.

## 9. Known evidence work still required

1. Complete export, deduplication, screening, full-text retrieval, exclusions and PRISMA reconciliation for the broader AI health-coaching review.
2. Independently verify the pivotal smoking and gambling sources listed above.
3. Confirm current local MPFT/ICS prevalence, service reach, treatment uptake, outcomes, waiting time, capacity and inequality data.
4. Select and verify validated gambling outcome measures, recall periods and licences.
5. Confirm the smoking primary outcome, follow-up point and biochemical verification process with the tobacco-dependence service and statistician.
6. Review qualitative evidence with underserved users and people with lived experience.
7. Establish the current active digital comparator and its effectiveness, cost and service fit.
8. Complete the economic evidence and local resource model.
9. Re-run an update search before protocol lock and before any controlled trial.

## 10. Change control

Create a new manifest version when:

- a source file hash changes;
- a pivotal source is added, withdrawn or superseded;
- an official guideline changes;
- intended purpose, pathway or population changes;
- a patient-facing claim changes;
- a validated measure or primary outcome changes; or
- a material evidence limitation is discovered.

Record the impact assessment on the product content, prompt, rules, protocol, participant materials, hazard log and analysis plan.
