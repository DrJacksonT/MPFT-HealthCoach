# Clinical evidence review: adult cigarette smoking cessation

**Role:** Clinical Evidence Lead
**Scope:** UK adults aged 18 or over who currently smoke cigarettes; general education and behaviour-change support only
**Search/check date:** 12 August 2026
**Deliverable status:** Evidence-lead review and candidate catalogue, not final clinical sign-off

## Executive judgement

The prototype can safely provide a useful, evidence-grounded smoking review if it uses a small, curated library and separates three different kinds of statement:

1. current UK recommendations (primarily NICE NG209);
2. population-level effect estimates from systematic reviews or major cohort studies; and
3. deterministic estimates from user-entered data, such as spend and pack-years.

It must not turn any of these into an exact individual prognosis. The evidence supports saying that stopping smoking improves health, that behavioural support and established cessation aids increase long-term quitting, and that evidence can be made more relevant to a person with COPD, cardiovascular disease, diabetes, or depression/anxiety. It does **not** support calculating that person's exact benefit from age band, cigarettes per day, pack-years, or comorbidity alone.

The current NICE guideline is [NG209, published 30 November 2021 and last updated 4 February 2025](https://www.nice.org.uk/guidance/NG209). The 2025 update added cytisinicline (also called cytisine in some sources). NICE currently says adults should have access to behavioural support, cytisinicline, short- and long-acting NRT, varenicline, bupropion, nicotine-containing e-cigarettes, and the Allen Carr's Easyway in-person group seminar. NICE says cytisinicline, combination short- plus long-acting NRT, varenicline, and nicotine-containing e-cigarettes are more likely to result in stopping when combined with behavioural support than bupropion or either form of NRT used alone ([recommendations 1.12.2 and 1.12.8 to 1.12.9](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)).

No record in the accompanying catalogue is labelled `VERIFIED`. This is deliberate. This agent performed discovery and structured extraction; the brief requires independent evidence criticism and citation verification before patient-facing publication. Records recommended for that next stage are labelled `PRIORITY_FOR_VERIFICATION`, while sources that are outdated, conflicting, weakly sourced, or useful only for signposting are labelled accordingly.

## Current authoritative UK position

### NICE NG209

NICE NG209 remains the controlling UK-first source for this prototype. Its overview currently reports a last update of **4 February 2025**, specifically following review of cytisinicline evidence ([NICE overview](https://www.nice.org.uk/guidance/NG209); [update information](https://www.nice.org.uk/guidance/ng209/chapter/Update-information)).

Implementation points:

- The V1 target is adults, although NG209 covers wider age groups. Medication content must be general education, not prescribing or personal selection.
- Stopping in one go is the preferred approach, but NICE also supports harm-reduction approaches for people who are not ready to stop in one go. Relevant strategies include delaying the first cigarette, extending intervals, and creating smoke-free times or situations ([NG209 harm-reduction recommendations](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)).
- NICE says most smoking-related health problems are caused by other components of tobacco smoke rather than nicotine, and risks from medicinally licensed nicotine-containing products are much lower than those of smoking ([recommendation 1.12.11](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)).
- NICE's e-cigarette advice is nuanced: explain that use is likely to be substantially less harmful than smoking, that long-term harms remain uncertain, and that people should stop smoking completely if they choose vaping. NICE also notes that, at the February 2025 publication point, no nicotine-containing e-cigarette was licensed as a medicine and commercially available in the UK ([NG209 e-cigarette section](https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence)).
- Cytisinicline should be the canonical database term, with `cytisine` as a searchable synonym. Do not merge it with varenicline.
- The application should never reproduce dosing, contraindication, interaction, or treatment-selection instructions from the evidence records. Those belong in clinician/pharmacist discussions and current product information.

### NHS and OHID/GOV.UK

The NHS Better Health page says health improvements begin after stopping and gives three memorable long-term milestones: after **1 year**, heart-attack risk is half that of a person who smokes; after **10 years**, risk of death from lung cancer is half that of a person who smokes; and after **15 years**, heart-attack risk is the same as for someone who has never smoked ([NHS Better Health benefits page](https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/)). These are useful patient-facing milestones, but the page does not expose the underlying studies. Keep them `UNREVIEWED` until the citation verifier traces the estimates to primary or systematic-review evidence; do not imply they apply identically to every user.

The NHS page on stop-smoking services states that treatment plus specialist service support makes a person **up to 3 times** more likely to stop for good ([NHS stop-smoking services page](https://www.nhs.uk/live-well/quit-smoking/nhs-stop-smoking-services-help-you-quit/)). Its displayed review date was **17 August 2022** and next-review date **17 August 2025** when checked, so the numerical claim should be treated as `STALE` rather than copied into the app.

An older OHID/PHE page similarly says combining aids and expert support makes success **3 times** as likely ([Health matters: stopping smoking  to  what works?](https://www.gov.uk/government/publications/health-matters-stopping-smoking-what-works/health-matters-stopping-smoking-what-works)). It is useful contextual corroboration but not a substitute for the underlying trials.

OHID's 2022 vaping review concludes that, in the short and medium term, vaping poses a small fraction of the risks of smoking, is not risk-free, and lacks adequate long-term evidence ([OHID main findings](https://www.gov.uk/government/publications/nicotine-vaping-in-england-2022-evidence-update/nicotine-vaping-in-england-2022-evidence-update-main-findings)). Avoid presenting “95% less harmful” as a precise individual risk reduction: the review itself explains why a single percentage across products, behaviours, and outcomes can be simplistic ([OHID summary](https://www.gov.uk/government/publications/nicotine-vaping-in-england-2022-evidence-update/nicotine-vaping-in-england-2022-evidence-update-summary)).

### MPFT and local signposting

MPFT has a public [Health and Wellbeing Resources page](https://www.mpft.nhs.uk/services/podiatry-adults/podiatry-adults-patient-information/health-and-wellbeing-resources) with a quitting-smoking section, the national helpline, and local service information for Staffordshire, Stoke-on-Trent, Shropshire, and Hampshire. It currently says the Staffordshire service is available to residents aged **18 or over** and gives local contact details. Because service eligibility and contact details change, these should be displayed from a freshness-checked resource record, not hard-coded into coaching copy.

MPFT also publicly states that it is a smoke-free trust ([visitor guidance](https://www.mpft.nhs.uk/service-users-and-carers/guidance-visitors)). Neither page is evidence that this prototype is an MPFT service or endorsed by MPFT. The product disclaimer must remain prominent.

## Evidence synthesis for candidate cards

### Overall health and longevity

The strongest motivational longevity estimate located for a UK population is the British Doctors Study. Among male British doctors, stopping at about ages **60, 50, 40, or 30** was associated with gains of about **3, 6, 9, or 10 years** of life expectancy, respectively ([BMJ 2004](https://www.bmj.com/content/328/7455/1519.abstract), DOI `10.1136/bmj.38142.554479`). This is an observational historical cohort of men who were doctors. It supports “benefit at any age” but is not a personal life-expectancy calculator and should not be shown as an exact promise.

### Cardiovascular health

In a Framingham cohort analysis restricted to heavy ever-smokers, quitting within **5 years** was associated with an incident cardiovascular disease hazard ratio of **0.61 (95% CI 0.49 to 0.76)** versus current smoking; incidence rates were **6.94 versus 11.56 per 1,000 person-years**. Compared with never smoking, excess risk ceased to be statistically significant at **10 to 15 years** in the pooled cohort, but estimates varied between cohorts ([JAMA 2019](https://jamanetwork.com/journals/jama/fullarticle/2748507), DOI `10.1001/jama.2019.10298`). This supports a population-level card for people with cardiovascular disease or hypertension, with explicit residual-risk and observational-confounding caveats.

### Cancer

The NHS timeline states that after **10 years** the risk of death from lung cancer is half that of a person who continues to smoke ([NHS Better Health](https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/)). This is suitable only as a pending candidate because the page does not expose a primary citation. A safer card lead is qualitative: stopping lowers future cancer risk, and benefit grows with time. Never infer an individual's cancer probability from pack-years in V1.

### COPD and respiratory health

The Lung Health Study reported that, after the first year, sustained quitters with mild-to-moderate airway obstruction had about half the annual decline in FEV1 of continuing smokers: **31 ± 48 mL/year versus 62 ± 55 mL/year** ([American Journal of Respiratory and Critical Care Medicine record](https://pubmed.ncbi.nlm.nih.gov/10673175/)). This supports a COPD-relevance card, but the population had measured airway obstruction and the result is not transferable to an individual without spirometry or to all COPD severities.

### Diabetes

A 2015 meta-analysis of **88 prospective studies**, **5,898,795 participants**, and **295,446 incident type 2 diabetes cases** found current smoking versus non-smoking was associated with RR **1.37 (95% CI 1.33 to 1.42)**. The pattern after quitting was non-linear: compared with never-smokers, pooled RR was **1.54 (1.36 to 1.74)** at less than **5 years**, **1.18 (1.07 to 1.29)** at **5 to 9 years**, and **1.11 (1.02 to 1.20)** at **10 years or longer** ([Lancet Diabetes & Endocrinology 2015](https://www.sciencedirect.com/science/article/abs/pii/S2213858715003162), DOI `10.1016/S2213-8587(15)00316-2`). This is observational evidence and confounding/weight change complicate interpretation. The app should not say quitting immediately reduces diabetes incidence; it may say smoking is relevant to diabetes risk and long-term cessation remains important, while avoiding alarm about the short-term association.

### Mental wellbeing

A Cochrane review included **102 studies** representing more than **169,500 participants**. Compared with continuing to smoke, cessation was associated with improvements in anxiety (SMD **−0.28, 95% CI −0.43 to −0.13**; low certainty), depression (SMD **−0.30, −0.39 to −0.21**; very low certainty), and mixed anxiety/depression (SMD **−0.31, −0.40 to −0.22**; moderate certainty). All studies were considered at serious risk of bias from possible time-varying confounding ([Cochrane CD013522](https://www.cochrane.org/evidence/CD013522_does-stopping-smoking-improve-mental-health)). Patient wording should therefore be “on average, mental health does not appear to worsen and may improve after the withdrawal period,” not “quitting will treat your depression.”

### Behavioural support and combined support

A Cochrane overview/network meta-analysis found high-certainty evidence for counselling versus no/minimal behavioural support: OR **1.44 (95% credible interval 1.22 to 1.70)**, from **194 studies** and **72,273 participants** ([Cochrane CD013229](https://www.cochrane.org/evidence/CD013229_does-behavioural-support-help-people-stop-smoking)).

A separate Cochrane review found combined pharmacotherapy plus behavioural treatment improved abstinence at **6 months or longer** versus usual care, brief advice, or less intensive support: RR **1.83 (95% CI 1.68 to 1.98)** in **52 studies** and **19,488 participants**, after excluding an atypically intensive outlier study ([Cochrane CD008286](https://www.cochrane.org/evidence/CD008286_does-combination-stop-smoking-medication-and-behavioural-support-help-smokers-stop)). These comparisons differ from “medicine plus NRT” claims and should not be conflated.

### NRT

For any NRT versus placebo/no NRT, a Cochrane review reported RR **1.55 (95% CI 1.49 to 1.61)** for long-term abstinence ([Cochrane CD000146](https://www.cochrane.org/evidence/CD000146_can-nicotine-replacement-therapy-nrt-help-people-quit-smoking)). A later Cochrane review found combination NRT (patch plus a fast-acting form) outperformed a single form: RR **1.27 (95% CI 1.17 to 1.37)** across **16 studies** and **12,169 participants**, high-certainty evidence ([Cochrane CD013308](https://www.cochrane.org/evidence/CD013308_what-best-way-use-nicotine-replacement-therapy-quit-smoking)). Absolute quit rates depend on baseline support and population; the UI must not manufacture an absolute effect from the RR.

### Varenicline and cytisinicline/cytisine

The 2023 Cochrane review found varenicline versus placebo RR **2.32 (95% CI 2.15 to 2.51)** across **41 studies** and **17,395 participants**; varenicline versus single-form NRT RR **1.25 (1.14 to 1.37)** across **11 studies** and **7,572 participants**. Cytisine versus placebo produced RR **1.30 (1.15 to 1.47)** across **4 studies** and **4,623 participants**, moderate-certainty evidence with substantial heterogeneity (**I² 83%**). Direct cytisine to varenicline evidence found no clear difference, RR **1.00 (0.79 to 1.26)**, low certainty ([Cochrane CD006103](https://www.cochrane.org/evidence/CD006103_can-medications-varenicline-and-cytisine-nicotine-receptor-partial-agonists-help-people-stop-smoking)).

NICE adopted the term **cytisinicline** in its February 2025 update ([NICE evidence review Q](https://www.nice.org.uk/guidance/ng209/evidence)). Public NHS pages also use “cytisine.” Store both terms but display the current NICE term first. No personal suitability advice should be generated.

### Nicotine-containing e-cigarettes

The 2025 Cochrane living review found nicotine e-cigarettes increased cessation for at least **6 months** compared with NRT: RR **1.59 (95% CI 1.30 to 1.93)** across **7 studies** and **2,544 participants**, with an estimated absolute difference of **4 additional quitters per 100 (95% CI 2 to 6)** ([Cochrane CD010216](https://www.cochrane.org/evidence/CD010216_can-electronic-cigarettes-help-people-stop-smoking-and-do-they-have-any-unwanted-effects-when-used)). The review reported high certainty for efficacy but low certainty for serious adverse-event comparisons and said longer, larger studies are needed for safety. The app must distinguish “more effective for quitting in these trials” from “harmless” or “safe long term.”

### Relapse and lapses

A Cochrane relapse-prevention review included **81 studies** and **69,094 participants**. Behavioural relapse-prevention add-ons did not show a worthwhile benefit in assisted abstainers; extended varenicline did show benefit, RR **1.23 (95% CI 1.08 to 1.41)** in **2 studies** and **1,297 participants**, with moderate certainty and substantial heterogeneity ([Cochrane CD003999](https://www.cochrane.org/evidence/CD003999_do-any-treatments-help-people-who-have-successfully-quit-smoking-avoid-starting-smoking-again)). This does not justify medicine advice in the coach. It does justify being honest that relapse is common and that a generic coping-skills module should not be marketed as a proven relapse-prevention treatment.

### Financial effects

Do not publish a national “average smoker saves £X” claim as personal evidence. Calculate only from user-entered or clearly labelled demo inputs:

`estimated spend avoided = cigarettes avoided × (user-entered pack price ÷ user-entered pack size)`

Show the price assumptions beside the result and label it an estimate. Do not infer pack price, brand, or purchasing pattern.

## Patient-language rules

- Say “This evidence may be especially relevant because you selected COPD/diabetes/heart disease…”
- Say “In groups studied…” before an effect estimate.
- Keep the comparator, timeframe, outcome definition, effect type, confidence interval, and certainty with every number.
- Never convert relative effects to absolute effects without a defensible baseline risk from the same source and population.
- Never say “your risk falls by X%,” “you will gain X years,” or “your lungs will recover by X date.”
- For vaping, say “likely substantially less harmful than smoking, not risk-free, with long-term uncertainty.”
- For medicines, present options and evidence only; direct users to a stop-smoking adviser, pharmacist, or GP for suitability and current availability.
- For diabetes, do not hide the short-term observational signal after cessation. Avoid turning it into a warning against stopping.
- For mental health, warn users taking some psychiatric medicines that stopping smoking can alter medicine metabolism and they should speak to their clinician; do not name a dose change.

## Required product changes

1. **Keep all seed records non-patient-facing initially.** Promote only after independent evidence critic and citation verifier sign-off.
2. **Canonicalise terminology.** Use `cytisinicline` with synonym `cytisine`; update any UI or prompts that describe only two prescription medicines.
3. **Suppress untraceable headline multipliers.** Do not use the NHS Better Health “over 5 times more likely” combination-product claim unless its underlying comparison, population, timeframe, and source are obtained and independently checked ([page carrying the claim](https://www.nhs.uk/better-health/quit-smoking/ready-to-quit-smoking/find-the-best-stop-smoking-products-for-you/)).
4. **Separate evidence from resource signposting.** MPFT/local-service records should not appear as outcome evidence and require frequent link/contact checks.
5. **Add claim-level provenance.** A citation at record level is insufficient where one record contains several numbers; store a source locator or table/line/section for each numerical claim.
6. **Add applicability gating.** COPD, diabetes, cardiovascular, and mental-health cards must clearly identify the studied population and observational limitations.
7. **Do not expose medication regimen data.** The prototype is not prescribing and should not calculate quit dates around medicines.
8. **Create a terminology and evidence freshness test.** Flag NICE change dates, NHS pages beyond their next-review date, broken MPFT links, and newer Cochrane living-review versions.

## Assumptions

- The active prototype population is adults who smoke cigarettes, excluding pregnancy, under-18s, and prescribing.
- “Current” means accessible and apparently current on 12 August 2026; it does not mean the source owner has formally reconfirmed every page on that date.
- A resolving URL is evidence only that a page is reachable, not that every claim is still endorsed.
- Cochrane review certainty ratings have been carried across only where explicitly reported.
- `evidence-confidence` in the catalogue describes the source/result, not confidence that the record has completed the local verification workflow.

## Risks and disagreements

- **Guidance-content drift:** NHS consumer pages are not fully synchronised. The mental-health page still describes two prescription medicines, whereas newer Better Health content includes cytisine and NICE includes cytisinicline.
- **Untraceable consumer-page numbers:** NHS timelines and headline multipliers are memorable but often omit primary citations.
- **Treatment ranking disagreement:** Network estimates, pairwise comparisons, NICE committee recommendations, and NHS marketing copy answer different questions. The app must not collapse them into a league table.
- **Vaping uncertainty:** High-certainty cessation efficacy does not establish long-term safety. The OHID “small fraction” formulation is preferable to a precise universal percentage.
- **Observational residual confounding:** Longevity, cardiovascular, diabetes, COPD progression, and mental-health estimates may be affected by who succeeds in quitting and changes in other behaviours.
- **Absolute-effect portability:** Absolute quit-rate estimates can vary greatly with population, support intensity, product use, and outcome definition.
- **Local-service volatility:** MPFT-hosted signposting can become wrong even while the page still resolves.

## What is most likely to be wrong

1. The most likely data error is an apparently correct number paired with the wrong comparator or timeframe.
2. The most likely clinical communication error is presenting a group-average relative effect as an individual's expected benefit.
3. The most likely freshness error is medication terminology/availability drifting faster than the evidence database review cycle.
4. The most likely safety overstatement is equating e-cigarette cessation efficacy with known long-term harmlessness.
5. The most likely product-design error is treating a comorbidity tag as enough to make an effect estimate personally predictive.
6. The catalogue may have missed a newer review published after the indexed search dates even though the web pages were checked on 12 August 2026; database searches should be repeated during formal verification.

## Confidence

- **High:** NICE NG209 version/date and recommendation wording; Cochrane effect estimates copied from the linked abstracts; existence and content of the checked MPFT pages.
- **Moderate:** selection of the proposed seed set as adequate for a prototype; applicability notes; recommendation to use the cited observational studies for contextual cards.
- **Limited:** source provenance behind NHS consumer-page timelines and multipliers; completeness of the MPFT/local service inventory; evidence freshness beyond the sources' own latest search dates.

## Verification hand-off

For each `PRIORITY_FOR_VERIFICATION` record in `data/evidence.seed.json`, the independent reviewer should:

1. open the DOI or official page;
2. match population, design, intervention/exposure, comparator, outcome, timeframe, effect type, value, confidence interval, and sample;
3. check whether a newer review/guideline supersedes it;
4. record risk-of-bias and applicability judgements independently;
5. verify each `numeric_claims[].source_locator`;
6. only then change `status` to `VERIFIED`, set `last_verified_date`, and name the human/role responsible in a separate audit log.
