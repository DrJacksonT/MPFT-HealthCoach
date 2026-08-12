# Behaviour Change Lead handover

**Handover date:** 12 August 2026
**Status:** Specialist policy review complete. Implementation conformance is not established.

## Work completed

- Reviewed current authoritative behaviour-change and smoking-cessation guidance from NICE, NHS, NCSCT, MINT and Cochrane.
- Defined a concrete coaching policy covering tone, turn structure, reflections, change talk, sustain talk, importance and confidence rulers, goal setting, check-ins, lapse handling, relapse handling and professional support.
- Defined deterministic routing precedence and separate quit, cut-down and understand-options branches.
- Supplied approved examples for ordinary coaching, ambivalence, low confidence, lapses, return to regular smoking, unsupported evidence and personal medicine requests.
- Defined safety handoffs, implementation priorities and 15 acceptance tests.

## Artefacts

- Primary review: [behaviour-change-review.md](../reviews/behaviour-change-review.md)
- Related architecture: [product-architecture.md](../reviews/product-architecture.md)
- Related safety review: [clinical-safety-review.md](../reviews/clinical-safety-review.md)
- Related accessibility critique: [accessibility-review.md](../reviews/accessibility-review.md)

## Decisions that should remain stable

1. Describe the product as using an **MI-consistent coaching style**, not as delivering validated motivational interviewing treatment or therapy.
2. Deterministic code owns safety routing, explicit intent, progress calculations, lapse or relapse clarification, evidence eligibility and medicine boundaries. The model may phrase content inside the selected branch.
3. Explicit user intent wins over importance or confidence scores. Rating thresholds are design heuristics, not validated psychological categories.
4. Use one grounded reflection and no more than one open question in an ordinary coaching turn. Never invent feelings, motives, values or previous success.
5. A user may decline change, revise a goal or choose to understand options without being pushed toward a quit date.
6. Clarify whether smoking was an isolated slip or a return to regular smoking before choosing the lapse or relapse branch.
7. Preserve cumulative progress while reporting a current abstinence streak honestly. Never use failure, reset, shame, family guilt or fear language.
8. Cutting down is a valid engagement route, but must not be presented as equivalent to stopping for health benefit.
9. Professional stop-smoking support remains visible across quit, reduction, relapse and medicine routes. The app must not imply equivalence to trained support.
10. MI style is not the active efficacy claim. The defensible active components are user-chosen goals, action and coping plans, self-monitoring, feedback, environmental change, social support and prompt re-engagement.

## Validation and review evidence

- The review cites current NICE NG209, NICE PH49, NICE NG183, NHS lapse guidance, the NCSCT Standard Treatment Programme, the March 2026 NCSCT not-a-puff briefing, MINT materials and relevant Cochrane reviews.
- The dialogue policy was checked against source-supported behaviour-change components and against known evidence limits for motivational interviewing and relapse prevention.
- Fifteen transcript and state acceptance tests are specified in the review at `Required acceptance tests`.
- The accessibility lead independently challenged response length, jargon, confidence labels, safety hierarchy and the number of options presented at once.
- No runtime transcript suite, human fidelity rating or user study was completed by this role. The evidence is a design and policy review, not proof that the current model follows it.

## Unresolved risks

- Fluent model reflections may still invent emotion or motivation and feel manipulative.
- The current app may implement a friendly tone without the full active behaviour-change components.
- Importance and confidence bands may create false precision or route users badly.
- Compassionate no-smoking guidance after a lapse may still feel moralising.
- Cigarette-count charts can imply that reduction produces proportionate health-risk reduction.
- A polished coach may displace trained behavioural and medicine support.
- Mixed-intent messages can contain a symptom or crisis statement that a narrow classifier misses.
- The tone and choice architecture may work poorly for users with low literacy, low digital confidence, disability, stress or different cultural expectations.
- The evidence base and service wording will change and need freshness review.

## Exact next actions for a future session

1. Convert the P0 policy in the review into a versioned machine-readable dialogue and routing specification with named owners.
2. Map each branch to deterministic state and approved templates. Include emergency, self-harm, symptom, diagnosis, pregnancy, under-18 and personal medicine exits before any coaching branch.
3. Update the coach orchestration so a branch identifier, not the model, selects the allowed response contract.
4. Add output checks for one open question, unsupported emotional inference, prohibited efficacy claims, failure language, personal medicine advice and unsafe mixed-intent continuation.
5. Implement explicit structured clarification before assigning lapse or relapse state.
6. Add a goal state that supports one primary goal, one optional supporting action, if-then coping planning, pause, revision and deletion.
7. Reduce the default check-in to four core fields and reveal trigger or confidence follow-up only when useful.
8. Separate current streak, cumulative smoke-free days, longest streak and goals attempted in domain calculations and display copy.
9. Build a deterministic transcript suite for all 15 acceptance criteria, including adversarial and mixed-intent variants.
10. Ask trained smoking-cessation and MI reviewers to score reflection accuracy, autonomy support, discord response and boundary adherence. Record unsupported emotional inference separately from generic hallucination.
11. Conduct qualitative testing across varied literacy, disability, socioeconomic background and smoking history. Test whether lapse language supports re-engagement without minimising risk.
12. Keep the claim register conservative until outcome evaluation shows whether coaching adds value beyond personalised evidence and standard information.

## Confidence and restart point

Confidence is moderate to high in the policy direction and moderate in the exact branch thresholds and check-in cadence. A future session should start with the `P0: must be present` and `Required acceptance tests` sections of the primary review, then compare each rule with current route, model and UI behavior before changing code.
