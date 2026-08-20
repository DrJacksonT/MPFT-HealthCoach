# Study release, evidence and AI governance

Three independent capabilities are gated: participant recruitment, live AI and gambling participant access. Each needs its environment flag and a matching release for the configured environment with status `authorised`, named authoriser, authorisation time, no revocation, and explicit governance, clinical-safety and deployment approvals.

The release manifest must link commit/build, migration set, protocol/study version, information/consent/privacy versions, evidence corpus, prompt, model, deterministic rules, survey versions, feature flags and operating model. The staff UI displays history and missing approvals but intentionally cannot self-authorise.

Synthetic evidence status supports synthetic QA only. Live retrieval requires a verified release with named approval; a verified human claim decision; active, verified and non-expired source; exact locator; hashed reviewed passage; and citation-to-passage mapping. Automated checks may reject or expire evidence but cannot assign human verification.

AI versions are centralised in `src/coaching/ai-adapter.ts`: prompt, output schema and deterministic rules are recorded for every interaction. Model and effective prices are environment/release configuration. Calls use the Responses API, strict Zod output, `store: false`, zero retries and a short timeout. An atomic database reservation checks the study budget before a call; failures are conservatively charged at the reserved maximum when billing is unknown. Provider billing still requires periodic reconciliation before economic claims.
