# Synthetic pilot analysis plan

This is a descriptive feasibility analysis, not a causal effectiveness analysis. The reproducible implementation is `scripts/generate-pilot-report.ts` and `src/research/export.ts`.

| Question | Records/derivation | Denominator and missing rule |
|---|---|---|
| Participant flow | invitations, participants, consent, withdrawal, follow-ups | All eligible invited/registered records at cutoff; missing stages shown |
| Activation | product events | Baseline completed plus goal created |
| Meaningful use/retention | product events, configured periods | Eligible participants; page views excluded; missing interaction is no recorded use, not outcome failure |
| Acceptability/usability | survey instances/answers/events | Version-specific respondents plus response/missingness and burden |
| Smoking trend | baseline, check-ins, follow-ups | Available self-report by window; no interpolation; biochemical status separate |
| Referral uptake | referrals | Offered, accepted and participant-reported used are distinct |
| Safety/unintended effects | flags/reviews | Recorded deterministic/quality events; not incidence without exposure context |
| Equity/access | consented demographics and access fields | Prefer-not-to-answer retained; cells below configured threshold suppressed |
| AI reliability/cost | interactions, reservations, cost ledger | All attempts; fallback/refusal/provider outcomes and cost-confidence limitations |
| Gambling | synthetic gambling records only | Labelled staff simulation; never pooled with live smoking participants |

Every output carries study/protocol/release/build, cutoff, derivation version and missing rules. Use wording such as “observed change among participants with available follow-up.”
