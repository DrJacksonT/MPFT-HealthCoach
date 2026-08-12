# Evidence methodologist handover

## Completed

Audited the runtime evidence library. Checked effect type, comparator, population, timeframe, confidence interval, absolute and relative wording, source status and applicability. Changed the runtime constructor so ordinary records fail closed.

## Main artefacts

- `docs/reviews/evidence-methodology-review.md`
- `src/data/evidence.ts`

## Current runtime status

- 12 verified records
- 2 unreviewed records
- 1 stale record
- 1 rejected record

Only the verified, active, current and non-superseded records can surface.

## Important corrections

- Corrected the behavioural review sample count to 250,563.
- Clarified the counselling odds ratio denominator.
- Kept the four additional quitters per 100 comparison specific to nicotine e-cigarettes versus nicotine replacement therapy.
- Suppressed undated or volatile resources from patient evidence.
- Rejected the smoking cost calculation as an evidence record. It remains a labelled arithmetic estimate in application code.

## Next actions

Repeat the claim audit after any content edit. Add named human reviewer identity and immutable verification events before a real study.
