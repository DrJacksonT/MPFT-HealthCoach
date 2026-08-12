# Personalised evidence and pseudonymous accounts

## Product rule

The briefing is organised around the person, not around a list of papers.
Every profile factor creates an evidence need. For a person who reports COPD,
the system retrieves COPD-specific prognosis, exacerbation, smoking-cessation
and intervention evidence before adding general cessation evidence.

The system must not convert cigarettes per day into an unsupported risk label.
For COPD, NICE says prognosis uses several factors, including smoking status,
symptoms, exacerbation frequency, exercise capacity, lung function, oxygen
status, body mass index and comorbidities. An exact risk tier may be shown only
when a validated calculator is implemented and all required inputs are present.

## Evidence pipeline

1. Convert the structured profile into evidence questions using Population,
   Prognostic factor, Intervention, Comparator and Outcome fields.
2. Give diagnosed or reported conditions the highest retrieval priority.
3. Search and refresh literature in an evidence-management workflow, not in the
   patient request. Start with current guidelines and systematic reviews, then
   add high-quality prognostic cohorts when needed.
4. Methodologically review every record and store population, estimates,
   comparator, certainty, limitations, applicability tags and review date.
5. At runtime, retrieve only verified, active, in-date records.
6. Run a sufficiency check. A condition-specific conclusion requires a matching
   condition-specific record. A numerical risk needs a validated model and all
   required variables.
7. Ask the model to synthesize the retrieved set in plain English. Validate
   every returned citation against the allowed record IDs.
8. Present conclusions first, then expandable references and uncertainties.

This separates literature surveillance from patient-facing generation. It
prevents a live web search from promoting one newly found or unsuitable paper
straight into a health-risk claim.

## Account model

Authentication uses the platform-provided stable user identifier. The service
does not store the person's email or name. It derives a keyed hash from the
identifier and shows a random alias such as `Quiet-Wren-4821`.

The alias is pseudonymous, not anonymous. The database contains personal health
data because the record can be linked back to the same authenticated account.
The account creation screen therefore records explicit storage consent and
explains this distinction.

The D1 schema stores:

- pseudonymous account ID, hashed authentication subject, alias and consent;
- structured assessment and current goal;
- dated check-ins, including cigarettes, cravings, confidence and triggers;
- account-level API tokens, latency, cost estimate and success state;
- no name, email, prompt text or generated answer text.

The account endpoint enforces ownership server-side. Deleting the account
cascades to its profile, check-ins and API usage. Browser storage remains only
as a guest-mode cache, not the authoritative account record.

## Journey insights

Initial insights remain deterministic and auditable: smoke-free versus smoking
check-ins, recent average cigarettes and frequently recorded triggers. Missing
days are never guessed. Later AI insights should consume these aggregates, not
raw free text, unless a separately approved purpose and consent cover that use.

## Governance before a broader pilot

- Establish an Article 6 lawful basis and Article 9 condition for health data.
- Complete a DPIA, retention schedule, privacy notice, data-subject rights flow,
  access-control review, penetration testing and incident process.
- Confirm controller/processor roles and the intended research or care purpose.
- Complete clinical-safety review before showing personal risk categories.
- Configure OpenAI retention controls appropriate to the deployment; `store:
  false` does not by itself guarantee zero retention.

Primary guidance:

- NICE COPD NG115: https://www.nice.org.uk/guidance/ng115/chapter/Recommendations
- ICO pseudonymisation: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/
- ICO special-category data: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
- OpenAI data controls: https://developers.openai.com/api/docs/guides/your-data
