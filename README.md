# Evidence Coach: smoking prototype

A guided, evidence-grounded smoking review and behaviour-change coaching proof of concept. It is a research and development prototype, not an MPFT clinical service.

The core journey is structured: review, relevant evidence, chosen goal, check-in, progress, and optional scoped coaching. The evidence page works without a language model. Patient-facing evidence comes only from records that pass the application eligibility rule: `VERIFIED`, active, not superseded, and within the review date.

## Safety and data position

- Adults aged 18 and over who currently smoke cigarettes are the intended V1 demo audience.
- Children, pregnancy, diagnosis, symptom assessment, emergencies, prescribing, medicine selection and interaction advice are outside scope.
- Nobody monitors the tool. It cannot alert a clinician or arrange care.
- Use synthetic or demonstration information only. Do not enter identifiable or real clinical information.
- Reviews, goals and check-ins are kept in browser local storage. The visible **Delete my demo data** action clears that state.
- Remote participant storage is fail-closed. Only an interface and a throwing disabled adapter exist.
- The patient-facing coach has no live web search, database tool or arbitrary URL access.
- If an OpenAI key is configured, coach calls happen on the server with `store: false`. This does not amount to a zero-data-retention guarantee. See the [official OpenAI data controls documentation](https://developers.openai.com/api/docs/guides/your-data#default-usage-policies-by-endpoint).

## Run locally

Requirements: Node.js 22.13 or later.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. An API key is optional. Without one, the coach uses an approved local template and the rest of the programme works normally.

Optional environment values:

```text
OPENAI_API_KEY=
OPENAI_COACH_MODEL=gpt-5.6-luna
ENABLE_REMOTE_PARTICIPANT_STORAGE=false
```

Never put `OPENAI_API_KEY` in a public browser variable or client component.

## Quality checks

```powershell
npm run test:unit
npm run lint
npm run build
npm test
npm run evidence:freshness
```

The tests cover pack-years, cost and progress arithmetic, evidence eligibility, unknown evidence IDs, safety routing, server-rendered product copy and the evidence dashboard. The safety corpus can be expanded without model calls.

## Structure

```text
app/                 routes and server API boundaries
src/domain/          evidence, assessment, safety and progress types
src/modules/         HealthModule contract and SmokingModule
src/data/            patient-eligible evidence library
src/ai/              structured OpenAI adapter and schema
src/telemetry/       content-free development cost metrics
src/infrastructure/  disabled future research persistence
data/                discovery-stage evidence catalogue
docs/                research, governance, demonstration and reviews
scripts/             evidence freshness checks
tests/               deterministic, safety and rendered-output tests
```

The optional coach uses the OpenAI Responses API and Zod structured outputs. The server validates every returned evidence ID and rehydrates citation metadata from the application library. Current OpenAI documentation describes `responses.parse` with `zodTextFormat` for this pattern: [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Evidence lifecycle

Discovery is separate from publication:

```text
discovery -> extraction -> independent critique -> citation check -> human review -> VERIFIED
```

`data/evidence.seed.json` is a discovery and extraction artefact. It is not patient-facing. `src/data/evidence.ts` is the runtime library. The evidence methodologist review records which runtime claims were directly checked. The freshness script can flag review dates, but cannot promote or publish a record.

The admin page at `/admin/evidence` is read-only and intended for local development. It is not a complete evidence quality-management system and must not be exposed publicly without access control.

## Deployment and real research

Do not enable real participant use or remote health-data storage from this repository. A real pilot would need a named sponsor and controller, research or service-evaluation classification, clinical safety work, information governance, DPIA, security assurance, evidence ownership, incident management, accessibility research and a reviewed medical-device position. See [NHS governance roadmap](docs/nhs-governance-roadmap.md).

## Main documents

- [Five-minute demonstration](docs/demo-script.md)
- [Research concept](docs/research-concept.md)
- [Project one-pager](docs/project-one-pager.md)
- [Landscape review](docs/landscape-review.md)
- [Governance roadmap](docs/nhs-governance-roadmap.md)
- [Independent reviews](docs/reviews/)

## Current limitations

- No claim of clinical effectiveness, compliance, safety certification, novelty or MPFT endorsement is made.
- Browser storage is unsuitable for clinical records and can be visible to other users of a shared browser profile.
- Keyword safety routing is scope detection, not clinical triage.
- The small evidence library is deliberately selective. Absence from it does not mean that evidence does not exist.
- Model pricing metadata is effective-dated and must be checked before financial use.
- Local in-memory telemetry resets with the server and contains no prompt or profile content.
