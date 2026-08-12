# Evidence methodology and citation-verification review

**Role:** Independent Evidence Methodologist and Citation Verifier
**Audit date:** 12 August 2026
**Files reviewed:** `docs/reviews/clinical-evidence-review.md`, `data/evidence.seed.json`, `src/data/evidence.ts`
**Scope:** Patient-facing claims available through the runtime evidence eligibility filter

## Decision

The original runtime evidence file was unsafe because its `record()` helper silently assigned every record `status: "VERIFIED"`, `sourceStatus: "active"`, a verification date, and a statement that direct verification had occurred. That default was not evidence of verification. It allowed any future record to become patient-facing merely by being added to the array.

The runtime catalogue is now fail-closed. A normal `record()` is `UNREVIEWED` and unavailable to `getEligibleEvidence()`. A record becomes eligible only through an explicit `verifiedRecord()` call that records the citation-verification decision. Following the direct checks below, the runtime set contains:

- **12 VERIFIED** records with directly matched claims and URLs;
- **2 UNREVIEWED** records that cannot surface;
- **1 STALE** record that cannot surface; and
- **1 REJECTED** pseudo-evidence record that cannot surface.

The standalone `data/evidence.seed.json` remains a proposal, not the runtime source. It contains **24 records**, of which **23 are UNREVIEWED**, **1 is STALE**, and **none is VERIFIED**. That is methodologically appropriate for a discovery/extraction artefact.

## Verification standard used

A runtime record remained `VERIFIED` only when all patient-visible fields were supported by a directly opened authoritative source:

1. the page and title existed;
2. the population matched;
3. the intervention or exposure and comparator matched;
4. the outcome and minimum follow-up matched;
5. the effect type, estimate, interval, study count and participant count matched when displayed;
6. the plain-language summary did not convert a group result into an individual prediction;
7. an absolute effect was shown only when the source itself supplied it; and
8. the record was not beyond an explicit source review date or known to conflict with newer NICE guidance.

This is claim-level citation verification for a research prototype. It is not clinical governance approval for a live NHS service. A real pilot should add named human clinical/evidence approval and immutable verification history.

## Patient-facing numerical audit

The UI displays `effectMeasure`, `effectValue`, `confidenceInterval`, `population`, `sampleSize`, `timeframe`, and `absoluteEffect` for eligible records. These are therefore patient-facing even when hidden behind “Tell me more”.

| Runtime record | Directly checked source | Patient-facing number | Verification and interpretation |
|---|---|---|---|
| `cochrane-combination-nrt-2023` | [Cochrane CD013308](https://www.cochrane.org/evidence/CD013308_what-best-way-use-nicotine-replacement-therapy-quit-smoking) | RR **1.27**, 95% CI **1.17 to 1.37**; **16 studies**, **12,169 participants**; at least **6 months** | Exact match. The stored “27% higher relative quit rate” is a correct transformation of the risk ratio. It is not a 27-percentage-point increase and no absolute rate is shown. Comparator is single-form NRT. |
| `cochrane-ecig-2025` | [Cochrane CD010216, 2025 Issue 11](https://www.cochrane.org/evidence/CD010216_can-electronic-cigarettes-help-people-stop-smoking-and-do-they-have-any-unwanted-effects-when-used) | RR **1.59**, 95% CI **1.30 to 1.93**; **7 studies**, **2,544 participants**; about **4 additional quitters per 100**, 95% CI **2 to 6**; at least **6 months** | Exact match to the pairwise nicotine-e-cigarette versus NRT result. “59% higher” is relative, not absolute. The absolute effect is source-supplied and may be shown only with the NRT comparator. High certainty applies to cessation efficacy, not long-term safety. DOI corrected/confirmed as `10.1002/14651858.CD010216.pub10`. |
| `cochrane-behaviour-2021` | [Cochrane CD013229](https://www.cochrane.org/evidence/CD013229_does-behavioural-support-help-people-stop-smoking) | Counselling OR **1.44**, 95% credible interval **1.22 to 1.70**; overall network **312 trials**, **250,563 participants**; at least **6 months** | The runtime transcription incorrectly said **250,503** and has been corrected to **250,563**. The OR estimate itself came from **194 studies and 72,273 participants**, not the whole network; this is now stated as a limitation. The OR must not be presented as a 44% risk increase or as a personal probability. |
| `cochrane-combined-support-2016` | [Cochrane CD008286](https://www.cochrane.org/evidence/CD008286_does-combination-stop-smoking-medication-and-behavioural-support-help-smokers-stop) | RR **1.83**, 95% CI **1.68 to 1.98**; **52 pooled studies**, **19,488 participants**; at least **6 months** | Exact match after the review excluded one atypically intensive outlier from this pooled estimate. Comparator is usual care, brief advice or less intensive support, not pharmacotherapy alone. No unsupported absolute effect is shown. |
| `cochrane-individual-counselling-2017` | [Cochrane CD001292](https://www.cochrane.org/evidence/CD001292_does-individually-delivered-counselling-help-people-stop-smoking) | RR **1.57**, 95% CI **1.40 to 1.77**; **27 studies**, **11,100 participants**; at least **6 months** | Exact match for individual counselling versus minimal support where neither group was offered pharmacotherapy. It must not be generalised to counselling added to pharmacotherapy; that separate estimate was smaller and moderate certainty. |
| `cochrane-telephone-2019` | [Cochrane CD002850](https://www.cochrane.org/evidence/CD002850_does-telephone-counselling-help-people-stop-smoking) | RR **1.38**, 95% CI **1.19 to 1.61**; **14 trials**, **32,484 participants**; at least **6 months** | Exact match for helpline callers receiving multiple proactive sessions versus self-help or brief counselling in one call. The record now includes authors, DOI `10.1002/14651858.CD002850.pub4`, comparator precision, moderate certainty, and **I² 72%** heterogeneity. It must not be read as applying to any single telephone call. |

No other eligible runtime record displays an effect estimate. Numeric timelines on the NHS Better Health benefits page remain suppressed because that page does not expose the studies behind the **1-year**, **10-year**, and **15-year** milestones ([NHS page](https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/)).

## Qualitative claim audit

### Verified

- `nice-ng209-options`: directly matches NICE recommendations **1.12.2**, **1.12.6**, **1.12.8**, and **1.12.9** on accessible options, behavioural support, and the qualitative “more likely/less likely” grouping ([NICE NG209 treating tobacco dependence](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)). This is not a head-to-head league table.
- `nice-ng209-reduction`: directly matches NICE harm-reduction approaches and recommendation **1.15.8** on delaying the first cigarette and choosing smoke-free occasions ([NICE NG209](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)). The invented “goals reviewed over weeks” timeframe was replaced with “varies by approach”.
- `cochrane-partial-agonists-2023`: directly matches the conclusion that varenicline and cytisine help more people stop than placebo or no medicine ([Cochrane CD006103](https://www.cochrane.org/evidence/CD006103_can-medications-varenicline-and-cytisine-nicotine-receptor-partial-agonists-help-people-stop-smoking)). The patient wording now names the medicines instead of implying these are the only two non-nicotine medicines available.
- `nhs-mental-health`: the NHS page directly says anxiety, depression and stress are lower and positive mood and quality of life improve after stopping; it was reviewed **10 January 2024** and lists a next review of **10 January 2027** ([NHS mental-health page](https://www.nhs.uk/live-well/quit-smoking/stopping-smoking-mental-health-benefits/)). “On average” was added, and the record is cross-checked against [Cochrane CD013522](https://www.cochrane.org/evidence/CD013522_does-stopping-smoking-improve-mental-health), which reports serious confounding concerns and certainty ranging from very low to moderate.
- `nice-nicotine-harm`: directly matches NICE recommendations **1.8.3 to 1.8.4**: most smoking-related problems are caused by other smoke components rather than nicotine, and risks from medicinally licensed nicotine products are much lower than smoking ([NICE promoting quitting](https://www.nice.org.uk/guidance/ng209/chapter/promoting-quitting)). The claim is explicitly limited to medicinally licensed products.
- `nice-digital-behaviour`: directly matches NICE NG183's scope and recommendations on developing, commissioning and evaluating digital behaviour-change interventions, including smoking ([NICE NG183](https://www.nice.org.uk/guidance/ng183)). The limitations now add NICE's warnings that these tools supplement rather than replace services and that effectiveness varies.

### Suppressed

- `nhs-benefits` is `UNREVIEWED`. Its qualitative text is present on the page, but the runtime record invented a **2026** publication date and the page does not display a publication/review date or primary sources for its numerical milestones.
- `nhs-services` is `STALE`. The page was last reviewed **17 August 2022**, shows a next-review date of **17 August 2025**, and omits cytisinicline despite the February 2025 NG209 update ([NHS service page](https://www.nhs.uk/live-well/quit-smoking/nhs-stop-smoking-services-help-you-quit/)). Its qualitative service statement may be true, but it cannot pass the current freshness policy.
- `mpft-local-resources` is `UNREVIEWED`. The URL and service text resolve, but the record invents a publication date and local service/contact data need a short freshness cycle ([MPFT page](https://www.mpft.nhs.uk/services/podiatry-adults/podiatry-adults-patient-information/health-and-wellbeing-resources)). It should ultimately be represented as a resource, not effectiveness evidence.
- `financial-estimate` is `REJECTED` as evidence. The cited NHS page does not support the local formula, and the assessment collects pack price but not pack size. Code elsewhere assumes **20 cigarettes per pack**. The calculation may remain deterministic, but its assumption must be shown and tested; it must not masquerade as verified evidence.

## Critique of the clinical evidence review

The evidence-lead review is appropriately conservative and accurately distinguishes discovery/extraction from verification. Its most important conclusions survive this audit:

- NICE NG209 is current and was updated **4 February 2025**.
- cytisinicline should be the canonical UK term, with cytisine retained as a synonym;
- NHS headline multipliers and recovery milestones should not be imported without claim-level provenance;
- e-cigarette cessation efficacy must not be confused with established long-term safety;
- population effects must not be converted into personal risk estimates; and
- MPFT/local pages are resources, not outcome evidence.

Two qualifications are important. First, a source-level citation is still too coarse: the same review often contains multiple comparisons with different populations and certainty. Second, “directly checked” is not the same as “current evidence search completed.” Several Cochrane reviews have search dates years before this audit even though their official pages remain active.

## Critique of `data/evidence.seed.json`

Strengths:

- all candidate evidence remains out of the patient-facing `VERIFIED` state;
- numerical claims have source-locator fields;
- absolute and relative effects are usually separated; and
- applicability and risk-of-bias notes are more detailed than the runtime objects.

Problems:

1. It is a second, manually maintained source of truth and already uses IDs different from `src/data/evidence.ts`.
2. Its claim-locator strings name abstract sections but are not immutable quotations, table identifiers, hashes, or source snapshots.
3. Some publication dates are absent or approximated; the runtime schema then invents dates because it cannot represent “not stated”.
4. `prototype-financial-estimate-policy` is not evidence and should move to a calculation-policy/test fixture.
5. The catalogue has strong candidates for COPD, cardiovascular disease, diabetes, longevity and mental health, but these were not promoted into runtime during this audit because the request was to edit runtime records only as needed and because applicability review is still required.
6. A resolving official page does not establish that no newer systematic review exists.

## Absolute-versus-relative effect judgement

- RR **1.27**, **1.59**, **1.83**, **1.57**, and **1.38** are multiplicative relative effects. They must never be displayed as percentage-point gains.
- OR **1.44** is an odds ratio from a component network meta-analysis. It is not a risk ratio and should not be translated into “44% more people quit”.
- The e-cigarette absolute effect of about **4 additional quitters per 100** is acceptable because Cochrane supplies it for the same comparison. It must stay attached to the NRT comparator and at-least-6-month outcome.
- No absolute effect should be computed from a pooled RR using an unrelated NHS or demo baseline.
- “High certainty” applies to the specified comparison/outcome, not to every adverse event, long-term outcome, product, or population.

## Required changes

### Completed in this audit

1. Made evidence verification opt-in rather than the default.
2. Corrected the behavioural network sample from **250,503** to **250,563**.
3. Added the counselling-estimate denominator (**194 studies; 72,273 participants**) as a limitation so it is not conflated with the whole network.
4. Corrected/confirmed e-cigarette DOI `pub10` and telephone-counselling authors/DOI.
5. Tightened populations, comparators, timeframes and limitations for all six numerical records.
6. Marked the outdated NHS service page `STALE`.
7. Kept the undated NHS benefits and MPFT resource records `UNREVIEWED`.
8. Marked the financial pseudo-evidence record `REJECTED`.

### Still required

1. Replace duplicate JSON/TypeScript catalogues with one validated source and a generated runtime representation.
2. Make `publicationDate` and `publicationYear` nullable, and add separate `pageLastReviewedDate`, `accessedDate`, and `sourceSearchDate` fields.
3. Split source, finding, effect estimate and resource into separate types. One source can support several findings with different comparators and certainty.
4. Add immutable claim-level provenance: DOI/version, page/table/analysis identifier, extraction reviewer, verification reviewer, timestamps and source-content hash.
5. Add an integrity test proving that the ordinary record constructor cannot create eligible evidence, expired records are excluded, and only explicit `VERIFIED` + active + in-date records surface.
6. Add unit tests for the **20-cigarette pack-size assumption**, or collect pack size and remove the assumption.
7. Require named human clinical/evidence approval before any real-patient pilot, even for records technically verified in this prototype.
8. Re-search bibliographic databases for newer versions before the February 2027 review date; an official active webpage is not a substitute for an update search.

## Assumptions

- The system date for freshness decisions is **12 August 2026**.
- “Patient-facing” includes content inside expandable details and citations.
- Cochrane and NICE pages opened during this audit are the authoritative current versions of those specific publications/guidelines.
- The user requested an independent agent verification pass; this does not replace named human governance approval.
- The current UI reads only `getEligibleEvidence()`, so non-VERIFIED records are effectively suppressed.

## Disagreements

- I disagree with the original runtime practice of claiming “direct source and displayed claim checked” through a constructor default. Verification is an event, not a default value.
- I disagree with using a six-month review horizon for local service directories. Monthly or change-detection checks are more defensible.
- I disagree with treating an arithmetic policy as an evidence record, especially when its denominator is not collected from the user.
- I would not yet promote NHS recovery timelines solely because they appear on an NHS page; patient-facing numbers need underlying provenance.
- I would not treat `evidenceConfidence: "high"` as a record-wide property where efficacy and harm outcomes have different certainty.

## Risks

- **Citation laundering:** a valid source can be cited beside a claim supported only by another analysis in the same paper.
- **Comparator loss:** “helped more people” can silently become a comparison against no support when the study used active NRT or brief counselling.
- **Denominator confusion:** overall review sample sizes can be shown beside a subgroup/component effect estimate.
- **Freshness illusion:** a URL that resolves can still carry out-of-date treatment or service information.
- **Certainty leakage:** efficacy certainty can be incorrectly applied to long-term safety.
- **Duplicate-catalogue drift:** the JSON and TypeScript records can disagree while both appear authoritative.
- **UI semantic risk:** “VERIFIED” may be interpreted by users as NHS approval; it currently means only that this prototype's claim and citation were checked.

## What is most likely wrong

1. The next defect is most likely to be a correct effect number displayed with the wrong comparator or denominator.
2. The next freshness failure is likely to occur in a service/resource page rather than a Cochrane DOI.
3. A future developer is likely to add a source to one catalogue and forget the other.
4. The `evidenceConfidence` label is likely to overstate certainty because it is attached to the whole record rather than an individual outcome.
5. The fixed **20-cigarette** financial assumption is likely to produce a plausible but incorrect personal estimate for some users.
6. The runtime catalogue remains too treatment-heavy and lacks independently approved disease-specific cards for COPD, cardiovascular disease and diabetes.

## Confidence

- **High:** direct transcription checks for the six numerical runtime records; NICE recommendation wording; status eligibility logic after the edit; stale NHS service-page judgement.
- **Moderate:** qualitative patient wording and decision to retain older Cochrane reviews while their official pages remain current; adequacy of the 12-record verified prototype set.
- **Limited:** completeness of the literature search after each review's published search date; current local-service availability beyond what the MPFT page displays; suitability for any real-patient deployment.

## Integrity-check results

- `npm run build`: **passed** after the catalogue changes.
- Static evidence assertions: **passed**: 12 explicit `verifiedRecord()` entries, 4 suppressed ordinary `record()` entries, no remaining `250,503` transcription, one corrected `250,563` transcription, and an eligibility predicate requiring `VERIFIED`, active, non-superseded and in-date records.
- Seed JSON parse/status check: **passed**: 24 records parsed, comprising 23 `UNREVIEWED`, 1 `STALE`, and 0 `VERIFIED`.
- `npm test`: **14 Vitest tests passed and the production build passed, then the command failed in the rendered-HTML stage** because the coach-page assertion expected the copy `Research/development prototype` in the server-rendered loading shell. The separate admin-page rendered check passed.
- Direct `node --test tests/rendered-html.test.mjs` repetition: **1 of 2 passed**, reproducing the same coach-page copy failure. No UI was edited in this audit.
- `npm run lint`: **failed on the pre-existing synchronous state update inside `src/ui/CoachApp.tsx`** (`react-hooks/set-state-in-effect`), plus its unused suppression directive. No evidence-file lint error was reported.
- `npx tsc --noEmit`: **failed on missing Cloudflare worker ambient types** (`cloudflare:workers`, `Fetcher`, and `D1Database`). The production build nevertheless completed successfully.

These failures are reported, not treated as verification successes. They do not invalidate the catalogue-specific assertions, but they do mean the repository does not yet have a fully green independent test baseline.
