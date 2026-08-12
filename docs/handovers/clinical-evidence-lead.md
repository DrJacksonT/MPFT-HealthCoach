# Clinical evidence lead handover

## Completed

Researched current NICE, NHS, government, Cochrane and MPFT sources. Created a 24 record discovery and extraction catalogue. Kept discovery status separate from patient publication status.

## Main artefacts

- `docs/reviews/clinical-evidence-review.md`
- `data/evidence.seed.json`

## Decisions to preserve

- Use cytisinicline as current NICE terminology and record cytisine as a synonym where needed.
- Do not use an NHS headline multiplier unless its underlying evidence and comparator are traced.
- Separate vaping cessation efficacy from long-term safety uncertainty.
- Treat MPFT and local service links as resources with short freshness cycles.

## Unresolved risks

- Most discovery records remain unreviewed.
- Service and medicines pages change faster than systematic reviews.
- Some public pages do not expose enough provenance for numeric patient claims.

## Next actions

Refresh NICE and Cochrane searches at the next review date. Do not move discovery records into the runtime library without independent citation verification and named human approval.
