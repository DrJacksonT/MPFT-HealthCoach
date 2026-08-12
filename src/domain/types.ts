export const EVIDENCE_STATUSES = [
  "UNREVIEWED",
  "VERIFIED",
  "REJECTED",
  "STALE",
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type Certainty = "high" | "moderate" | "limited";

export type ConditionTag =
  | "diabetes"
  | "cardiovascular"
  | "copd"
  | "asthma"
  | "hypertension"
  | "mental-wellbeing"
  | "none"
  | "prefer-not-to-say";

export interface EvidenceRecord {
  id: string;
  title: string;
  authors: string[];
  organisation: string;
  publicationYear: number;
  publicationDate: string;
  lastVerifiedDate: string;
  reviewDueDate: string;
  url: string;
  doi?: string;
  sourceType:
    | "guideline"
    | "systematic-review"
    | "public-health-resource"
    | "service-resource";
  studyDesign: string;
  population: string;
  sampleSize?: string;
  interventionOrExposure: string;
  comparator?: string;
  outcome: string;
  timeframe: string;
  effectMeasure?: string;
  effectValue?: string;
  confidenceInterval?: string;
  absoluteEffect?: string;
  relativeEffect?: string;
  mainFinding: string;
  patientFriendlySummary: string;
  applicabilityTags: string[];
  limitations: string[];
  riskOfBiasNotes: string;
  evidenceConfidence: Certainty;
  superseded: boolean;
  sourceStatus: "active" | "changed" | "broken";
  status: EvidenceStatus;
  verificationNotes: string;
}

export interface Assessment {
  ageBand: "18-29" | "30-44" | "45-59" | "60-65" | "66+";
  cigarettesPerDay: number;
  yearsSmoked: number;
  firstCigarette: "within-5" | "6-30" | "31-60" | "after-60";
  previousAttempts: "none" | "1" | "2-3" | "4+";
  longestQuit:
    "not-applicable" | "under-day" | "days" | "weeks" | "months-plus";
  methodsTried: string[];
  vaping: "no" | "sometimes" | "daily" | "prefer-not-to-say";
  packPrice?: number;
  motivations: string[];
  importance: number;
  confidence: number;
  conditions: ConditionTag[];
  intention: "quit" | "reduce" | "learn";
}

export interface Goal {
  id: string;
  kind: string;
  title: string;
  detail: string;
  createdAt: string;
  completed: boolean;
}

export interface CheckIn {
  id: string;
  date: string;
  cigarettes: number;
  craving: number;
  confidence: number;
  goalAttempted: boolean;
  trigger: string;
  win: string;
}

export interface DemoState {
  version: 1;
  synthetic: boolean;
  savedAt?: string;
  assessment?: Assessment;
  goal?: Goal;
  checkIns: CheckIn[];
}

export interface HealthModule {
  id: "smoking";
  title: string;
  assessmentFields: readonly string[];
  evidenceTags(assessment: Assessment): string[];
  goals: readonly {
    kind: string;
    title: string;
    detail: string;
    intentions: Assessment["intention"][];
  }[];
  checkInFields: readonly string[];
  coachingBoundaries: readonly string[];
  resources: readonly { title: string; url: string; description: string }[];
  outcomeMeasures: readonly string[];
}
