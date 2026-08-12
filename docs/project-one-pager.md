# Evidence Coach: smoking prototype

## The problem

Standard smoking information is often accurate but impersonal. People may understand that smoking is harmful without seeing which evidence matters to their circumstances, what the numbers mean, or how to turn information into a realistic next step.

## The proposed intervention

A guided digital programme for adults who smoke:

```text
structured review -> relevant evidence -> chosen priority -> goal -> check-in -> progress
```

Broad answers select reviewed population evidence. Cards explain findings, numbers, certainty, limitations and applicability at three levels of depth. An optional scoped coach supports motivation, cravings, plans and setbacks. It cannot diagnose, assess symptoms, prescribe or select treatment.

## What is different

The working hypothesis is that the useful contribution is the combination of:

- transparent evidence translation;
- explicit distinction between relevance and individual prediction;
- behaviour-change support tied to the person's own reasons;
- traceable citations and evidence status;
- a product architecture where generative output is optional rather than authoritative.

This is not yet a novelty or effectiveness claim.

## Prototype design

- Mobile-first React and TypeScript application.
- Synthetic profiles and local browser progress only.
- Small, status-controlled evidence library.
- Deterministic pack-year, spending and progress calculations.
- Server-only optional OpenAI Responses API call with structured output validation.
- Read-only evidence provenance dashboard.
- Disabled remote participant repository.

## Suggested evaluation question

Does evidence-grounded personalised smoking support improve comprehension, motivation and smoking-related behaviour compared with standard digital smoking information?

Possible future arms are standard information, personalised evidence translation, and personalised evidence translation plus coaching. Outcomes could cover comprehension, importance, confidence, quit attempts, cigarettes per day, abstinence, engagement, safety failures and equity across the participation funnel.

## What is needed before a pilot

Named MPFT sponsorship and branding permission; study classification; information governance and DPIA; clinical safety case under DCB0129 and local deployment work under DCB0160; security and accessibility assurance; medical-device review; evidence ownership; approved participant data architecture; research protocol, analysis plan and adverse-event process.

## Current status

Technical proof of concept only. No real participant data, clinical deployment, compliance, efficacy or endorsement claim.
