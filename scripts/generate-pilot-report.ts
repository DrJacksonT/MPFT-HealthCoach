import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { closeDb } from "../db/index";
import { aiReliabilityRows, safetyRows, surveyAndOutcomeRows } from "../src/research/staff-data";
import { buildAnalysisExport, exportCsv } from "../src/research/export";

async function main() {
  const generatedAt = process.env.REPORT_AS_OF ? new Date(process.env.REPORT_AS_OF) : new Date();
  if (Number.isNaN(generatedAt.getTime())) throw new Error("REPORT_AS_OF must be an ISO date-time.");
  const exportId = randomUUID();
  const [analysis, ai, safety, surveys] = await Promise.all([
    buildAnalysisExport({ exportId, generatedAt }),
    aiReliabilityRows(),
    safetyRows(),
    surveyAndOutcomeRows(),
  ]);
  const records = analysis.records;
  const participants = records.length;
  const enrolled = records.filter((record) => record.enrolled_at).length;
  const activated = records.filter((record) => record.completed_checkins > 0 || record.coach_attempts > 0).length;
  const meaningfulUse = records.filter((record) => record.completed_checkins >= 2 && record.coach_attempts >= 1).length;
  const surveysCompleted = surveys.surveys.filter((survey) => survey.completedAt).length;
  const followupsCompleted = surveys.outcomes.filter((outcome) => outcome.completedAt).length;
  const followupsAvailable = surveys.outcomes.filter((outcome) => outcome.selfReport).length;
  const fallback = ai.filter((row) => row.outcome === "fallback").length;
  const refused = ai.filter((row) => row.outcome === "refused").length;
  const totalCost = ai.reduce((total, row) => total + Number(row.costUsd), 0);
  const referralsAccepted = records.reduce((total, row) => total + row.referrals_accepted, 0);
  const referralsUsed = records.reduce((total, row) => total + row.referrals_reported_used, 0);
  const report = `# Synthetic MPFT behaviour-change feasibility report

**Status:** technically generated from fictional/staff-test records only; not a live-pilot finding

**Generated at:** ${generatedAt.toISOString()}

**Export ID:** ${exportId}
**Derivation:** ${analysis.metadata.derivationVersion}

## Interpretation boundary

This is a descriptive software-validation report. It cannot show that the tool caused any outcome. Missing observations remain unknown. Cells and records are synthetic and must not be presented as MPFT service performance.

## Participant flow and denominators

- Participant records: ${participants}
- Enrolled records: ${enrolled}/${participants || 0}
- Activation: ${activated}/${participants || 0}. Activation means at least one completed check-in or one recorded coaching interaction.
- Meaningful use: ${meaningfulUse}/${participants || 0}. Meaningful use means at least two completed check-ins and one coaching interaction; this is a prespecified product-use definition, not improvement.

## Baseline description

Baseline cigarettes per day are recorded for ${records.filter((record) => record.baseline_cigarettes_per_day !== null).length}/${participants || 0} participants. No missing baseline value is imputed.

## Engagement, retention and feature use

- Completed check-ins: ${records.reduce((total, record) => total + record.completed_checkins, 0)}
- Missing scheduled progress days: ${records.reduce((total, record) => total + record.missing_days, 0)}
- Coaching interactions: ${ai.length}; fallback ${fallback}; deterministic refusals ${refused}
- Completed surveys: ${surveysCompleted}/${surveys.surveys.length}
- Completed smoking follow-ups: ${followupsCompleted}/${surveys.outcomes.length}

## Acceptability, usability and burden

Survey response is ${surveysCompleted}/${surveys.surveys.length}. Burden seconds are retained with survey events. Custom pilot items are not validated instruments and no official score is claimed.

## Smoking outcomes

There are ${followupsAvailable} participant self-report follow-up records with available data. Any change should be described as observed change among participants with available follow-up. Self-report and biochemical verification remain separate; silence, inactivity and missing check-ins are never interpreted as abstinence.

## Gambling staff simulation

The gambling module is a separate staff-only synthetic configuration. Participant access remains fail-closed. No live gambling result is included in this smoking feasibility denominator.

## Safety and unintended effects

- Safety or quality flags: ${safety.length}
- Open or acknowledged records: ${safety.filter((row) => row.status !== "resolved").length}

The review queue is a quality workflow, not a clinical command centre or emergency-response promise.

## Equity, access and digital exclusion

Equity fields are not reported from this tiny synthetic dataset. Small-number disclosure control and prespecified denominators are required before subgroup reporting. Missing demographic data remains unknown.

## Referral and support uptake

- Support options accepted: ${referralsAccepted}
- Participant-reported used: ${referralsUsed}

Opening a link is not counted as acceptance or use.

## AI reliability and delivery cost

- Recorded interactions: ${ai.length}
- Fallback: ${fallback}
- Refused before generation: ${refused}
- Recorded provider cost: $${totalCost.toFixed(6)}

Structured support remains available when the provider is disabled or fails. The current synthetic run does not demonstrate live-provider quality.

## Release history and configuration

Each analysis row includes study code, protocol reference, study version, export ID, cutoff and derivation version. Evidence, prompt, model and rules versions are retained with each coach interaction. Live recruitment, live AI and gambling participant release require separate environment and database approvals.

## Limitations and deviations

- Fictional single-site technical dataset; no clinical or service inference is possible.
- No comparator and no causal estimand.
- Very small denominators; subgroup analysis is suppressed.
- Follow-up completeness and survey timing were manipulated only in the local QA database to exercise due-state software.
- Provider-disabled fallback does not validate a real model release.
- Human governance, clinical safety, evidence-content, privacy, accessibility and deployment approvals remain external gates.
`;
  const outputDir = "artifacts/synthetic-pilot";
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(`${outputDir}/pilot-report.md`, report, "utf8"),
    writeFile(`${outputDir}/analysis-export.json`, `${JSON.stringify(analysis, null, 2)}\n`, "utf8"),
    writeFile(`${outputDir}/analysis-export.csv`, exportCsv(records), "utf8"),
  ]);
  console.log(`Generated synthetic pilot report and ${records.length} analysis rows in ${outputDir}.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Report generation failed."); process.exitCode = 1; }).finally(closeDb);
