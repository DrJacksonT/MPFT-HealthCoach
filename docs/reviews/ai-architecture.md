# AI and retrieval architecture review

## Decision

Use a small deterministic retrieval layer over patient-eligible evidence. Do not add embeddings or a vector store for the initial library. The core evidence page uses approved record text and application-rendered numbers. The optional coach receives at most six eligible records and returns a strict schema.

## Request path

1. Validate the request length and structured context with Zod.
2. Apply deterministic scope and safety routing before a model call.
3. Rehydrate requested IDs through `findEvidence`, which drops unknown or ineligible records.
4. Send only the message, intention, importance, confidence and small evidence excerpts.
5. Call the server-side Responses API with `store: false`.
6. Parse the structured response with `zodTextFormat`.
7. Reject any claim without an allowed evidence ID.
8. Rehydrate citation metadata in application code.
9. Return an approved template if the API is absent; return a safe error if validation fails.

The model has no web search, arbitrary URL fetch, evidence publication, database mutation or research storage tool.

## Current OpenAI basis

Official OpenAI documentation shows the Responses API `responses.parse` pattern with Zod-based structured output: [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Current model guidance describes configurable cost tiers; the prototype defaults to a lower-cost model alias but keeps it in environment configuration: [model catalogue](https://developers.openai.com/api/docs/models). OpenAI states that API data is not used for training by default, while abuse-monitoring and application-state conditions still apply; `store: false` is not a complete zero-retention claim: [data controls](https://developers.openai.com/api/docs/guides/your-data#default-usage-policies-by-endpoint).

## Main weakness

A real evidence ID does not prove that a paraphrase is faithful. Schema validation prevents fabricated citations but cannot establish entailment. V1 therefore keeps numerical evidence and the primary evidence explanation outside model generation. Before a pilot, generated claims need an entailment evaluation with source-level human review and a prespecified suppression threshold.

## Assumptions

- The runtime library remains small and curated.
- No real personal information is sent.
- Model access is optional and server-side.
- Effective pricing is updated before business-case use.

## Risks and required changes

- Add request rate limits and abuse controls before any public deployment.
- Prevent request body logging at framework, proxy and hosting layers.
- Add a larger paraphrase-entailment evaluation if generative coaching is retained.
- Pin and evaluate model changes rather than relying indefinitely on a moving alias.
- Replace in-memory telemetry with an approved content-free store only after governance review.
- Gate or remove admin and telemetry routes in public builds.

## Confidence

High confidence in deterministic retrieval for this corpus. Moderate confidence that the optional structured coach can be useful in controlled demonstrations. Low confidence in safety or benefit for unsupervised real-world use without evaluation.

## What is most likely wrong

The retrieved set may be relevant but still insufficient for the exact wording a model produces. The safest future result may be to retain structured coaching prompts and remove generative factual claims altogether.
