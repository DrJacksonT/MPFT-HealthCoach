# UX and Accessibility Lead handover

**Handover date:** 12 August 2026
**Status:** Architecture and policy critique complete. WCAG conformance and usability are not established.

## Work completed

- Critiqued the product architecture and behaviour-change review for mobile-first usability, health literacy, inclusive interaction and WCAG 2.2 Level AA.
- Defined a plain-language content policy and detailed UI acceptance criteria for structure, navigation, reflow, contrast, forms, dynamic content, evidence cards, safety and destructive actions.
- Defined complete keyboard, screen-reader and mobile journey expectations.
- Specified chart summaries, same-page data alternatives and missing-data language.
- Proposed a shorter six-part core assessment journey and a validation evidence matrix.
- Identified P0, P1 and P2 changes, assumptions, major risks, disagreements, confidence and likely failure points.

## Artefacts

- Primary review: [accessibility-review.md](../reviews/accessibility-review.md)
- Reviewed architecture: [product-architecture.md](../reviews/product-architecture.md)
- Reviewed coaching policy: [behaviour-change-review.md](../reviews/behaviour-change-review.md)
- Related privacy review: [privacy-threat-model.md](../reviews/privacy-threat-model.md)

## Decisions that should remain stable

1. WCAG 2.2 AA applies to complete processes and every responsive state, including no-AI fallback, validation, safety exits, deletion, loading and empty states.
2. Use universal precautions for literacy, numeracy, dexterity, vision, cognition and digital confidence. Do not require a disability disclosure to provide an accessible route.
3. Use 24 by 24 CSS pixels as the minimum target-size floor and 44 by 44 CSS pixels as the product default for primary controls.
4. Every client-side transition needs a meaningful document title, one clear `h1`, predictable focus movement and error-summary behavior.
5. Use native labelled controls and fieldset or legend groups. Every slider needs an equivalent non-drag input and clear 0 and 10 meanings.
6. Essential evidence meaning cannot be hidden in disclosure content. Population, timeframe, uncertainty and the fact that the result is not an exact personal prediction stay visible.
7. Charts are enhancements. A plain summary and complete table or list are the primary equivalent information.
8. Do not stream token-by-token output to assistive technology. Announce a brief loading state, then expose one complete response while preserving focus.
9. Safety actions appear first under a descriptive heading, with explicit 999 and 111 labels. Urgent content is not a long chat bubble.
10. Help and data deletion are separate destinations. Deletion requires an accessible confirmation, safe initial focus and predictable focus after completion.
11. Test persistent mobile navigation at 320 CSS pixels and 400 percent zoom. Remove or simplify it if it crowds targets or obscures focus.
12. Internal terms such as verified, deterministic, lapse, relapse, abstinence and relative risk need plain alternatives or explanations.

## Validation and review evidence

- The review is grounded in WCAG 2.2, W3C understanding documents, NHS Service Manual content and design guidance, NICE risk-communication guidance and the NHS Accessible Information Standard context.
- Sections A through G contain concrete acceptance criteria with a verification method for each.
- The review defines retained evidence for automated scans, keyboard journeys, NVDA, VoiceOver iOS, TalkBack Android, contrast, zoom, text spacing, forced colours, reduced motion, physical mobile devices, resilience states and moderated user research.
- The behaviour policy was independently checked for cognitive load, jargon, choice count, rating ambiguity and safety salience.
- No automated scan, browser matrix, screen-reader session, physical-device test or moderated usability study was performed by this role. This is a specification review, not a conformance claim.

## Unresolved risks

- The mandatory assessment may be too long, but fewer pages are not automatically more accessible.
- Dense evidence cards and nested disclosures may be technically semantic but unusable on mobile or with a screen reader.
- Five persistent mobile navigation items may fail reflow or cover the focused control above a virtual keyboard.
- Card selectors, sliders, charts and dialogs may expose the wrong accessible name, role, state or keyboard behavior.
- Generated coaching copy may drift beyond the plain-language policy.
- Safety actions may lose salience through layout, reassuring prose, colour or icon dependence.
- Controlled synthetic demonstrations understate shared-device, poor-connectivity, low-cost phone, language, stress and craving conditions.
- Reading-age scores can remove necessary uncertainty if treated as a pass or fail target.
- English-only content can deepen inequity; unreviewed machine translation is not an acceptable fix.

## Exact next actions for a future session

1. Turn sections A through G of the primary review into owned acceptance-test tickets and a release checklist.
2. Inventory every route and state, including landing, assessment steps, review, evidence, goal, check-in, progress, coach, safety exit, data deletion, loading, API error and no-AI fallback.
3. Define document title, `h1`, focus target, Back behavior, validation summary and recovery behavior for every state transition.
4. Prototype the six-part assessment sequence and compare it with the longer flow through moderated task testing. Collect optional detail only when it changes a result or next action.
5. Replace or supplement every 0 to 10 range control with a keyboard and single-pointer alternative that exposes endpoint meaning and current value.
6. Add deterministic text summaries and semantic tables or lists for all progress charts. Preserve missing days as missing.
7. Buffer coach output for screen readers and verify focus is not moved into new content unexpectedly.
8. Restructure safety handoffs with the action first, explicit phone labels and stable headed content outside the chat transcript.
9. Separate Help from deletion and implement the confirmation, initial focus, Escape behavior, completion announcement and landing focus specified in the review.
10. Run automated accessibility checks on every stable state at desktop and mobile sizes. Triage all findings and retain reports.
11. Complete keyboard-only journeys and manual screen-reader journeys with NVDA, VoiceOver iOS and TalkBack Android.
12. Test 320 CSS pixel reflow, 400 percent zoom, 200 percent text resize, text spacing, forced colours, contrast, reduced motion, orientation and virtual keyboard obstruction.
13. Test at least one small physical iOS device and one small physical Android device.
14. Conduct moderated research with low digital-confidence users and users of magnification, screen readers, keyboard or switch input, and motor-access methods. Include varied health literacy.
15. Publish an honest accessibility statement only after testing, with dates, methods, known issues and a route to report problems.

## Confidence and restart point

Confidence is high in the WCAG and component requirements and moderate in the recommended journey length and grouping. A future session should begin at `Required changes`, then use `Test matrix and evidence required` as the definition of evidence. Do not declare conformance from automated scans alone.
