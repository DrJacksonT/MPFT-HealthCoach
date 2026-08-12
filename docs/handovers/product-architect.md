# Product architect handover

## Completed

Defined the V1 scope, guided flows, modular monolith, trust boundaries, local and server data ownership, verified evidence lifecycle, HealthModule contract and requirement traceability.

## Main artefact

`docs/reviews/product-architecture.md`

## Decisions to preserve

- AI is optional for the core flow.
- Patient evidence uses deterministic relevance and approved content.
- Research persistence is a fail-closed interface only.
- The administration area is for inspection, not publication.
- Future modules cannot weaken central safety, evidence or privacy policy.

## Unresolved risks

- The HealthModule shape may be too influenced by smoking.
- A polished prototype may encourage people to enter real information despite warnings.
- Evidence records may need source, finding and effect estimate separation as the library grows.
- A real evidence ID does not prove a generated sentence is supported.

## Next actions

Review architecture after the final privacy, AI and red-team changes. Update diagrams and traceability if route gating, storage expiry or the evidence schema changes.
