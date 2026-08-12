import type { EvidenceRecord } from "@/src/domain/types";

const checked = "2026-08-12";
const due = "2027-02-12";

type EvidenceInput = Partial<EvidenceRecord> &
  Pick<
    EvidenceRecord,
    | "id"
    | "title"
    | "organisation"
    | "publicationYear"
    | "url"
    | "patientFriendlySummary"
    | "mainFinding"
    | "applicabilityTags"
  >;

function record(input: EvidenceInput): EvidenceRecord {
  const status =
    input.status === "STALE" || input.status === "REJECTED"
      ? input.status
      : "UNREVIEWED";
  return Object.freeze({
    authors: [input.organisation],
    publicationDate: `${input.publicationYear}-01-01`,
    reviewDueDate: checked,
    sourceType: "systematic-review",
    studyDesign: "Evidence synthesis",
    population: "Adults who smoke cigarettes",
    interventionOrExposure: "Stopping smoking or cessation support",
    outcome: "Smoking cessation or smoking-related health",
    timeframe: "Varies by source",
    limitations: ["Population evidence cannot predict an individual outcome."],
    riskOfBiasNotes:
      "Use source-level certainty and limitations; no independent individual prediction.",
    evidenceConfidence: "high",
    ...input,
    lastVerifiedDate: input.lastVerifiedDate ?? "",
    sourceStatus: input.sourceStatus === "broken" ? "broken" : "changed",
    status,
    superseded: false,
    verificationNotes:
      input.verificationNotes ??
      "Not independently verified for patient-facing use.",
  });
}

function verifiedRecord(input: EvidenceInput): EvidenceRecord {
  return Object.freeze({
    ...record(input),
    ...input,
    lastVerifiedDate: checked,
    reviewDueDate: input.reviewDueDate ?? due,
    sourceStatus: "active",
    status: "VERIFIED",
    superseded: false,
    verificationNotes:
      input.verificationNotes ??
      "Evidence Methodologist and Citation Verifier directly matched the displayed claim, population, comparator, outcome, timeframe and URL to the cited source on 12 August 2026.",
  });
}

export const evidenceRecords: readonly EvidenceRecord[] = Object.freeze([
  verifiedRecord({
    id: "nice-ng209-options",
    title:
      "Tobacco: preventing uptake, promoting quitting and treating dependence: stop smoking interventions",
    organisation: "NICE",
    publicationYear: 2025,
    publicationDate: "2025-02-04",
    url: "https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence",
    sourceType: "guideline",
    studyDesign: "National evidence-based guideline",
    interventionOrExposure: "Behavioural support and stop-smoking options",
    outcome: "Successful stopping",
    timeframe: "Varies by intervention and evidence source",
    mainFinding:
      "NICE recommends accessible behavioural support and a range of options; it identifies cytisinicline, combination NRT, varenicline and nicotine-containing e-cigarettes with behavioural support as more likely to help adults stop than the options listed as less likely.",
    patientFriendlySummary:
      "There is more than one way to stop that is supported by evidence. Support and treatment can be combined, and your preferences matter.",
    applicabilityTags: ["overall", "cessation-support", "health", "learn"],
    limitations: [
      "This is general guidance, not a personal treatment recommendation.",
      "A clinician or stop-smoking adviser should consider health, medicines and preferences.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "nice-ng209-reduction",
    title: "NICE approaches for reducing harm",
    organisation: "NICE",
    publicationYear: 2025,
    publicationDate: "2025-02-04",
    url: "https://www.nice.org.uk/guidance/ng209/chapter/treating-tobacco-dependence",
    sourceType: "guideline",
    studyDesign: "National evidence-based guideline",
    interventionOrExposure:
      "Cutting down before stopping or temporary abstinence",
    outcome: "Smoking reduction and later cessation",
    timeframe: "Varies by chosen harm-reduction approach",
    mainFinding:
      "For people not ready to stop in one go, NICE supports structured harm-reduction approaches and recommends helping people set goals such as delaying the first cigarette or choosing smoke-free occasions.",
    patientFriendlySummary:
      "Not ready to stop in one go? A planned step can still be useful. For example, you could delay your first cigarette.",
    applicabilityTags: ["reduce", "independence", "cessation-support"],
    limitations: [
      "Cutting down is not presented as equivalent to stopping.",
      "Some people compensate by smoking remaining cigarettes more intensely.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-combination-nrt-2023",
    title:
      "Different doses, durations and modes of delivery of nicotine replacement therapy for smoking cessation",
    authors: ["Theodoulou A", "Chepkin SC", "Ye W", "et al."],
    organisation: "Cochrane",
    publicationYear: 2023,
    publicationDate: "2023-06-19",
    url: "https://www.cochrane.org/evidence/CD013308_what-best-way-use-nicotine-replacement-therapy-quit-smoking",
    doi: "10.1002/14651858.CD013308.pub2",
    sampleSize:
      "16 studies; 12,169 participants for combination versus single-form NRT",
    comparator: "Single-form NRT",
    outcome: "Long-term smoking cessation",
    timeframe: "Six months or longer",
    effectMeasure: "Risk ratio",
    effectValue: "1.27",
    confidenceInterval: "95% CI 1.17 to 1.37",
    relativeEffect: "27% higher relative quit rate in the included trials",
    mainFinding:
      "Combination NRT (a fast-acting form plus a patch) increased long-term quit rates compared with a single form of NRT.",
    patientFriendlySummary:
      "Using a nicotine patch together with a faster-acting nicotine product helped more people stop than using one type alone.",
    applicabilityTags: ["cessation-support", "quit", "learn"],
    limitations: [
      "The relative effect does not give one person’s exact chance of stopping.",
      "Personal suitability and correct use require professional advice.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-ecig-2025",
    title: "Electronic cigarettes for smoking cessation",
    authors: ["Lindson N", "Livingstone-Banks J", "Butler AR", "et al."],
    organisation: "Cochrane",
    publicationYear: 2025,
    publicationDate: "2025-11-10",
    url: "https://www.cochrane.org/evidence/CD010216_can-electronic-cigarettes-help-people-stop-smoking-and-do-they-have-any-unwanted-effects-when-used",
    doi: "10.1002/14651858.CD010216.pub10",
    sampleSize:
      "7 studies; 2,544 participants for nicotine e-cigarettes versus NRT",
    comparator: "Nicotine replacement therapy",
    outcome: "Abstinence from smoking",
    timeframe: "At least six months",
    effectMeasure: "Risk ratio",
    effectValue: "1.59",
    confidenceInterval: "95% CI 1.30 to 1.93",
    absoluteEffect: "About 4 additional quitters per 100 (95% CI 2 to 6 more)",
    relativeEffect: "59% higher relative quit rate in the included comparison",
    mainFinding:
      "Nicotine e-cigarettes increased quit rates compared with NRT in this review; longer-term safety evidence remains less certain.",
    patientFriendlySummary:
      "In these trials, nicotine e-cigarettes helped more people stop smoking than nicotine replacement therapy. We know less about very long-term effects.",
    applicabilityTags: ["cessation-support", "vaping", "quit", "learn"],
    limitations: [
      "Products and patterns of use vary.",
      "Longer-term safety questions remain.",
      "This is not a recommendation for one individual.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-partial-agonists-2023",
    title: "Nicotine receptor partial agonists for smoking cessation",
    authors: ["Livingstone-Banks J", "Fanshawe TR", "Thomas KH", "et al."],
    organisation: "Cochrane",
    publicationYear: 2023,
    publicationDate: "2023-06-28",
    url: "https://www.cochrane.org/evidence/CD006103_can-medications-varenicline-and-cytisine-nicotine-receptor-partial-agonists-help-people-stop-smoking",
    doi: "10.1002/14651858.CD006103.pub9",
    studyDesign: "Systematic review of randomised trials",
    interventionOrExposure: "Varenicline or cytisine",
    comparator: "Placebo, no medicine or other cessation pharmacotherapy",
    outcome: "Smoking cessation and unwanted effects",
    timeframe: "Six months or longer",
    mainFinding:
      "Varenicline and cytisine both helped more people stop smoking than placebo or no medicine. Comparative benefit and harms differ by comparison and certainty.",
    patientFriendlySummary:
      "Varenicline and cytisinicline have evidence that they can help people stop. A professional needs to discuss whether a medicine is suitable for you.",
    applicabilityTags: ["cessation-support", "quit", "learn"],
    limitations: [
      "The review uses the term cytisine; current NICE UK guidance uses cytisinicline.",
      "This prototype does not select medicines.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-behaviour-2021",
    title:
      "Behavioural interventions for smoking cessation: overview and network meta-analysis",
    authors: [
      "Hartmann-Boyce J",
      "Livingstone-Banks J",
      "Ordóñez-Mena JM",
      "et al.",
    ],
    organisation: "Cochrane",
    publicationYear: 2021,
    publicationDate: "2021-01-04",
    url: "https://www.cochrane.org/evidence/CD013229_does-behavioural-support-help-people-stop-smoking",
    doi: "10.1002/14651858.CD013229.pub2",
    sampleSize: "312 randomised trials; 250,563 participants",
    comparator: "No or less behavioural support",
    outcome: "Abstinence",
    timeframe: "Six months or longer",
    effectMeasure: "Odds ratio for counselling",
    effectValue: "1.44",
    confidenceInterval: "95% credible interval 1.22 to 1.70",
    mainFinding:
      "Behavioural support can increase quit rates; evidence was strongest for counselling and guaranteed financial incentives.",
    patientFriendlySummary:
      "Practical and conversational support can improve the chance of stopping, whether or not someone also uses a treatment.",
    applicabilityTags: [
      "cessation-support",
      "confidence",
      "family",
      "independence",
    ],
    limitations: [
      "Many intervention combinations were studied and effects vary.",
      "An odds ratio is not the same as an individual probability.",
      "The counselling estimate came from 194 studies and 72,273 participants, not the entire network sample.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-combined-support-2016",
    title:
      "Combined pharmacotherapy and behavioural interventions for smoking cessation",
    authors: ["Stead LF", "Koilpillai P", "Fanshawe TR", "Lancaster T"],
    organisation: "Cochrane",
    publicationYear: 2016,
    publicationDate: "2016-03-24",
    url: "https://www.cochrane.org/evidence/CD008286_does-combination-stop-smoking-medication-and-behavioural-support-help-smokers-stop",
    doi: "10.1002/14651858.CD008286.pub3",
    sampleSize: "52 pooled studies; 19,488 participants",
    comparator: "Usual care, brief advice or less intensive support",
    outcome: "Smoking cessation",
    timeframe: "At least six months",
    effectMeasure: "Risk ratio",
    effectValue: "1.83",
    confidenceInterval: "95% CI 1.68 to 1.98",
    mainFinding:
      "Combining pharmacotherapy and behavioural support increased smoking cessation compared with minimal intervention or usual care.",
    patientFriendlySummary:
      "Using treatment and behavioural support together helped more people stop than brief or usual support in these studies.",
    applicabilityTags: ["cessation-support", "quit"],
    limitations: [
      "Most studies used NRT and services differed.",
      "This does not identify which treatment is right for one person.",
      "This comparison is not pharmacotherapy plus behavioural support versus pharmacotherapy alone.",
    ],
    evidenceConfidence: "high",
  }),
  record({
    id: "nhs-benefits",
    title: "Benefits of quitting smoking",
    organisation: "NHS",
    publicationYear: 2026,
    publicationDate: "2026-01-01",
    url: "https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/",
    sourceType: "public-health-resource",
    studyDesign: "National patient information based on public-health evidence",
    interventionOrExposure: "Stopping smoking",
    outcome: "Long-term health and second-hand smoke exposure",
    timeframe: "Short and long term",
    mainFinding:
      "The NHS states that stopping reduces longer-term risks of cancer, lung disease, heart disease and stroke and protects others from second-hand smoke.",
    patientFriendlySummary:
      "Stopping matters at any age: the longer-term risks of several major diseases fall, and people around you are exposed to less smoke.",
    applicabilityTags: [
      "overall",
      "health",
      "family",
      "children",
      "cardiovascular",
      "copd",
      "asthma",
    ],
    limitations: [
      "This page gives general benefits rather than an individual risk estimate.",
      "The page does not display a publication or review date; the current publication metadata is therefore not verified.",
      "The page's numerical milestones do not expose underlying study citations.",
    ],
    evidenceConfidence: "moderate",
    verificationNotes:
      "The qualitative claim and URL resolve, but publication metadata and underlying provenance for numerical milestones were not independently verifiable; record remains non-patient-facing.",
  }),
  verifiedRecord({
    id: "nhs-mental-health",
    title: "Stopping smoking for your mental health",
    organisation: "NHS",
    publicationYear: 2024,
    publicationDate: "2024-01-10",
    reviewDueDate: "2027-01-10",
    url: "https://www.nhs.uk/live-well/quit-smoking/stopping-smoking-mental-health-benefits/",
    sourceType: "public-health-resource",
    studyDesign:
      "National patient information informed by systematic-review evidence",
    interventionOrExposure: "Stopping smoking",
    outcome: "Anxiety, depression, stress and quality of life",
    timeframe: "After stopping",
    mainFinding:
      "Evidence summarised by the NHS indicates that anxiety, depression and stress tend to be lower and positive mood and quality of life improve after stopping.",
    patientFriendlySummary:
      "Although withdrawal can feel difficult at first, stopping smoking is linked with better mental wellbeing on average over time.",
    applicabilityTags: ["mental-wellbeing", "depression/anxiety", "health"],
    limitations: [
      "Mood changes differ between people.",
      "Some medicine doses can be affected by stopping smoking; discuss this with the prescriber.",
      "The linked NHS page is not a primary study; the corresponding Cochrane review reports varying certainty and confounding risk.",
    ],
    evidenceConfidence: "moderate",
    verificationNotes:
      "Directly matched to the NHS page reviewed 10 January 2024 and cross-checked against Cochrane CD013522 on 12 August 2026.",
  }),
  record({
    id: "nhs-services",
    title: "NHS stop smoking services help you quit",
    organisation: "NHS",
    publicationYear: 2022,
    publicationDate: "2022-08-17",
    lastVerifiedDate: checked,
    reviewDueDate: "2025-08-17",
    url: "https://www.nhs.uk/live-well/quit-smoking/nhs-stop-smoking-services-help-you-quit/",
    sourceType: "service-resource",
    studyDesign: "National service information",
    interventionOrExposure: "Specialist stop-smoking support",
    outcome: "Access to cessation support",
    timeframe: "Quit attempt",
    mainFinding:
      "NHS stop-smoking services offer trained adviser support and can discuss cessation aids and coping with cravings.",
    patientFriendlySummary:
      "A stop-smoking adviser can help you build a plan, work through cravings and understand available treatments.",
    applicabilityTags: [
      "cessation-support",
      "confidence",
      "quit",
      "reduce",
      "learn",
    ],
    limitations: [
      "Availability and eligibility vary locally.",
      "The displayed next-review date passed before this audit.",
      "The page omits cytisinicline from its treatment list and is not aligned with the February 2025 NICE update.",
    ],
    evidenceConfidence: "limited",
    sourceStatus: "changed",
    status: "STALE",
    verificationNotes:
      "URL resolves, but the page was last reviewed 17 August 2022, its displayed next review was due 17 August 2025, and treatment content is out of sync with NICE NG209; suppressed on 12 August 2026.",
  }),
  verifiedRecord({
    id: "nice-nicotine-harm",
    title: "NICE information about nicotine and licensed nicotine products",
    organisation: "NICE",
    publicationYear: 2025,
    publicationDate: "2025-02-04",
    url: "https://www.nice.org.uk/guidance/ng209/chapter/promoting-quitting",
    sourceType: "guideline",
    studyDesign: "National evidence-based guideline",
    interventionOrExposure: "Medicinally licensed nicotine-containing products",
    outcome: "Relative harm and safety",
    timeframe: "Use while stopping or reducing",
    mainFinding:
      "NICE states that most smoking-related health problems are caused by other components of tobacco smoke, not nicotine, and risks from licensed nicotine products are much lower than smoking.",
    patientFriendlySummary:
      "Nicotine causes dependence, but most smoking-related damage comes from the other chemicals in tobacco smoke. Licensed nicotine products are much less harmful than smoking.",
    applicabilityTags: ["cessation-support", "learn", "reduce"],
    limitations: [
      "Lower harm does not mean no risk.",
      "Correct use and personal suitability should be discussed with a professional.",
      "The claim is about medicinally licensed nicotine-containing products, not every consumer nicotine product.",
    ],
    evidenceConfidence: "high",
  }),
  record({
    id: "mpft-local-resources",
    title: "Health and Wellbeing Resources: quitting smoking",
    organisation: "Midlands Partnership University NHS Foundation Trust",
    publicationYear: 2026,
    publicationDate: "2026-01-01",
    url: "https://www.mpft.nhs.uk/services/podiatry-adults/podiatry-adults-patient-information/health-and-wellbeing-resources",
    sourceType: "service-resource",
    studyDesign: "Public service directory",
    interventionOrExposure: "Local and national support routes",
    outcome: "Access to support",
    timeframe: "Current service information",
    mainFinding:
      "The MPFT public page links to NHS information and lists commissioned stop-smoking services for Staffordshire and Stoke-on-Trent.",
    patientFriendlySummary:
      "If you live in Staffordshire or Stoke-on-Trent, this MPFT page lists local support routes as well as national information.",
    applicabilityTags: ["cessation-support", "family", "overall"],
    limitations: [
      "This prototype is not an MPFT service.",
      "Service details can change; check the linked page.",
      "The page does not display a publication date, so the current publication metadata is not verified.",
    ],
    evidenceConfidence: "moderate",
    reviewDueDate: "2026-09-12",
    verificationNotes:
      "URL and displayed service statements were checked on 12 August 2026, but publication metadata is invented by the current schema and local contact details need a short freshness cycle; record remains non-patient-facing.",
  }),
  verifiedRecord({
    id: "nice-digital-behaviour",
    title: "Behaviour change: digital and mobile health interventions",
    organisation: "NICE",
    publicationYear: 2020,
    publicationDate: "2020-10-07",
    url: "https://www.nice.org.uk/guidance/ng183",
    sourceType: "guideline",
    studyDesign: "National evidence-based guideline",
    interventionOrExposure: "Digital and mobile behaviour-change interventions",
    outcome: "Health behaviour change",
    timeframe: "Varies",
    mainFinding:
      "NICE provides recommendations for commissioning, developing and evaluating digital behaviour-change interventions, including for stopping smoking.",
    patientFriendlySummary:
      "Digital tools can support behaviour change, but they need suitable evidence, design and evaluation; a polished app alone does not prove benefit.",
    applicabilityTags: ["overall", "learn"],
    limitations: [
      "This guidance does not establish that this prototype is effective.",
      "NICE says digital interventions should supplement rather than replace existing services and that effectiveness is variable.",
    ],
    evidenceConfidence: "moderate",
  }),
  verifiedRecord({
    id: "cochrane-individual-counselling-2017",
    title: "Individual behavioural counselling for smoking cessation",
    authors: ["Lancaster T", "Stead LF"],
    organisation: "Cochrane",
    publicationYear: 2017,
    publicationDate: "2017-03-31",
    url: "https://www.cochrane.org/evidence/CD001292_does-individually-delivered-counselling-help-people-stop-smoking",
    doi: "10.1002/14651858.CD001292.pub3",
    sampleSize:
      "27 studies; 11,100 participants in the main no-pharmacotherapy comparison",
    comparator: "Minimal support",
    outcome: "Smoking cessation",
    timeframe: "Six months or longer",
    effectMeasure: "Risk ratio",
    effectValue: "1.57",
    confidenceInterval: "95% CI 1.40 to 1.77",
    mainFinding:
      "Individual counselling was more effective than minimal support in trials where pharmacotherapy was not offered to either group.",
    patientFriendlySummary:
      "One-to-one counselling helped more people stop than brief information or usual care in these studies.",
    applicabilityTags: ["cessation-support", "confidence"],
    limitations: [
      "This review predates newer digital and medicine evidence.",
      "Counselling quality and setting varied.",
      "This estimate does not apply to counselling added to pharmacotherapy; that comparison had a smaller and less certain effect.",
    ],
    evidenceConfidence: "high",
  }),
  verifiedRecord({
    id: "cochrane-telephone-2019",
    title: "Telephone counselling for smoking cessation",
    authors: ["Matkin W", "Ordóñez-Mena JM", "Hartmann-Boyce J"],
    organisation: "Cochrane",
    publicationYear: 2019,
    publicationDate: "2019-05-02",
    url: "https://www.cochrane.org/evidence/CD002850_does-telephone-counselling-help-people-stop-smoking",
    doi: "10.1002/14651858.CD002850.pub4",
    studyDesign: "Systematic review of randomised trials",
    sampleSize: "14 trials; 32,484 participants who contacted helplines",
    comparator: "Self-help materials or brief counselling in a single call",
    outcome: "Smoking cessation",
    timeframe: "Six months or longer",
    effectMeasure: "Risk ratio",
    effectValue: "1.38",
    confidenceInterval: "95% CI 1.19 to 1.61",
    mainFinding:
      "Multiple proactive telephone counselling sessions increased quit rates among people who contacted helplines.",
    patientFriendlySummary:
      "Support does not always need to be face to face; planned telephone follow-up can help.",
    applicabilityTags: ["cessation-support", "confidence", "independence"],
    limitations: [
      "The studies varied and statistical heterogeneity was substantial.",
      "The estimate applies to people who contacted helplines and received multiple proactive sessions.",
    ],
    riskOfBiasNotes:
      "Moderate-certainty evidence; I-squared 72%; most trials in the full review were at high or unclear risk of bias.",
    evidenceConfidence: "moderate",
  }),
  record({
    id: "financial-estimate",
    title: "Your smoking-cost estimate",
    organisation: "MPFT Evidence Coach prototype",
    publicationYear: 2026,
    publicationDate: "2026-08-12",
    lastVerifiedDate: checked,
    url: "https://www.nhs.uk/better-health/quit-smoking/",
    sourceType: "public-health-resource",
    studyDesign: "Deterministic arithmetic using user-entered values",
    interventionOrExposure: "Cigarettes not smoked",
    outcome: "Estimated money not spent",
    timeframe: "Selected check-in period",
    mainFinding:
      "The prototype divides the entered pack price by 20 and multiplies it by the estimated number of cigarettes avoided.",
    patientFriendlySummary:
      "Your cost figure is an estimate based only on the pack price and cigarette numbers you enter. It is not a research prediction.",
    applicabilityTags: ["money"],
    limitations: [
      "Actual pack size, price and smoking pattern may differ.",
      "This is not a medical evidence claim.",
      "The assessment does not ask for pack size, so the fixed 20-cigarette denominator is an unverified assumption.",
    ],
    evidenceConfidence: "limited",
    sourceStatus: "changed",
    status: "REJECTED",
    verificationNotes:
      "Rejected as an evidence record on 12 August 2026: the cited NHS page does not support the local formula and the code assumes 20 cigarettes per pack without collecting pack size. The deterministic calculation may remain elsewhere only with the assumption shown and tested.",
  }),
]);

function isIsoDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

export function isEligibleEvidence(
  item: EvidenceRecord,
  today = new Date().toISOString().slice(0, 10),
) {
  return (
    item.status === "VERIFIED" &&
    !item.superseded &&
    item.sourceStatus === "active" &&
    isIsoDate(item.lastVerifiedDate) &&
    isIsoDate(item.reviewDueDate) &&
    item.reviewDueDate >= today
  );
}

export function getEligibleEvidence() {
  const today = new Date().toISOString().slice(0, 10);
  return evidenceRecords.filter((item) => isEligibleEvidence(item, today));
}

export function rankEvidence(tags: string[], limit = 6) {
  const scored = getEligibleEvidence().map((item) => ({
    item,
    score: item.applicabilityTags.reduce(
      (n, tag) => n + (tags.includes(tag) ? 2 : tag === "overall" ? 1 : 0),
      0,
    ),
  }));
  return scored
    .sort(
      (a, b) =>
        b.score - a.score || b.item.publicationYear - a.item.publicationYear,
    )
    .slice(0, limit)
    .map(({ item }) => item);
}

export function findEvidence(ids: string[]) {
  const eligible = new Map(
    getEligibleEvidence().map((item) => [item.id, item]),
  );
  return [...new Set(ids)]
    .map((id) => eligible.get(id))
    .filter((item): item is EvidenceRecord => Boolean(item));
}
