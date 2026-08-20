# MPFT AI-assisted platform pilot minimum dataset

**Prepared:** 20 August 2026
**Status:** Proposed data specification for discovery. Final fields, measures, lawful basis, retention and access require sponsor, statistician, clinical, information-governance, safety and lived-experience approval before implementation.

## 1. Purpose

This specification defines the minimum data needed to:

- describe who was invited, eligible and enrolled;
- measure use of the website and chatbot;
- measure smoking or gambling outcomes over time;
- evaluate safety, equity, service hand-off, workload and cost;
- reconstruct the exact intervention each participant received; and
- write a transparent pilot report without retrospectively inventing denominators or outcomes.

It is not an instruction to collect every listed field. Each field must survive a necessity, proportionality and burden review. Direct contact details should remain in an approved recruitment or clinical system and not in the pseudonymised research dataset.

## 2. Data principles

1. Collect data for a prespecified purpose, not because the platform can.
2. Separate identity/contact data, intervention data, raw conversations, safety incidents and analysis data.
3. Use pseudonymous immutable identifiers and never put health data or participant IDs in URLs.
4. Preserve missingness. Missing is not zero, abstinence, non-gambling or failure.
5. Record source, timestamp, unit, recall period, measure version and intervention version.
6. Keep general analytics content-free. Do not put raw chat, goals or health details in generic event properties.
7. If raw conversation retention is necessary, obtain specific approval and consent, encrypt it, restrict access and apply a short defined retention period.
8. Store every material application, model, prompt, evidence-corpus and safety-rule version.
9. Make participant correction, withdrawal, erasure and data-lock behaviour explicit.
10. Export only from a versioned, quality-checked snapshot with a data dictionary and derivation code.

## 3. Logical data domains

| Domain | Purpose | Sensitivity | Suggested access |
|---|---|---|---|
| Recruitment/contact | Invite and follow up with people | Directly identifiable | Approved recruiting team only |
| Participant registry | Link pseudonymous study records | Highly sensitive | Restricted study administration |
| Consent | Prove what was shown and agreed | Highly sensitive | Study administration and audit |
| Intervention | Run the participant programme | Health and behavioural data | Participant-facing service and authorised support staff |
| General events | Measure use without content | Pseudonymous behavioural metadata | Evaluation team, least privilege |
| Conversations | Support the interaction and approved safety review | Potentially exceptional-category and high-risk free text | Separate restricted reviewers only |
| Outcomes | Analyse smoking/gambling change | Health and behavioural research data | Approved research team |
| Safety/incidents | Investigate harm and escalation | High-risk health/safeguarding data | Clinical safety and named study safety team |
| Staff/workload/cost | Assess implementation and economics | Operationally sensitive | Product, service and evaluation leads |
| Audit | Prove access and change history | Security sensitive | IG/security/audit roles |
| Release/evidence | Reconstruct intervention | Non-participant controlled records | Product, evidence and safety owners |

## 4. Core entities

### 4.1 `participants`

One row per participant in one approved pathway protocol.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `participant_id` | UUID | Yes | Random pseudonymous primary key |
| `study_id` | Controlled text | Yes | Approved protocol/study identifier |
| `site_id` | Controlled text | Yes | Recruitment/deployment site |
| `pathway` | Enum | Yes | `smoking` or `gambling`; never infer from free text |
| `cohort` | Controlled text | Yes | Defined population or study cohort |
| `arm` | Controlled text | If comparative | Assigned intervention/comparator; conceal where required |
| `randomisation_id` | Controlled text | If randomised | Link to approved randomisation system, not allocation logic in analytics |
| `recruitment_source` | Enum | Yes | Service, clinic, outreach, digital, self-referral or other prespecified source |
| `invited_at` | UTC timestamp | Yes | Participant-flow denominator |
| `screened_at` | UTC timestamp | When screened | Participant-flow denominator |
| `eligibility_status` | Enum | Yes | `not_started`, `eligible`, `ineligible`, `uncertain` |
| `ineligibility_reason_code` | Controlled code | If ineligible | No unnecessary narrative |
| `enrolled_at` | UTC timestamp | When enrolled | After valid consent and eligibility |
| `activated_at` | UTC timestamp | When activated | Defined as first prespecified meaningful action |
| `study_status` | Enum | Yes | `invited`, `screening`, `active`, `completed`, `withdrew`, `lost_to_follow_up`, `stopped_by_team` |
| `withdrawn_at` | UTC timestamp | If withdrawn | Do not delete required audit data automatically without approved rule |
| `withdrawal_scope` | Enum | If withdrawn | Intervention, follow-up, future contact and retained-data choices where applicable |
| `withdrawal_reason_code` | Controlled code | Optional | Voluntary and non-coercive |
| `created_at` | UTC timestamp | Yes | Audit |
| `updated_at` | UTC timestamp | Yes | Audit |

The identity/contact link should be held separately using an approved study enrolment identifier. Do not store name, NHS number, email, phone or full address in this table.

### 4.2 `eligibility_assessments`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `eligibility_id` | UUID | Yes | Primary key |
| `participant_id` | UUID | Yes | Foreign key |
| `pathway` | Enum | Yes | Controls the schema/rules used |
| `ruleset_version` | Text | Yes | Exact approved eligibility version |
| `started_at` | UTC timestamp | Yes | Flow |
| `completed_at` | UTC timestamp | No | Flow |
| `responses_json` | Validated object | Yes | Only approved structured fields |
| `result` | Enum | Yes | `eligible`, `ineligible`, `manual_review` |
| `reason_codes` | Array of codes | No | Deterministic output |
| `human_reviewed_by_role` | Controlled text | If reviewed | Role or pseudonymous staff ID |
| `reviewed_at` | UTC timestamp | If reviewed | Audit |

### 4.3 `consent_events`

Consent must be event-based rather than one mutable boolean.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `consent_event_id` | UUID | Yes | Immutable event |
| `participant_id` | UUID | Yes | Foreign key |
| `participant_information_version` | Text | Yes | Exact content shown |
| `consent_form_version` | Text | Yes | Exact choices shown |
| `presented_at` | UTC timestamp | Yes | Audit |
| `decision_at` | UTC timestamp | Yes | Audit |
| `decision` | Enum | Yes | `accepted`, `declined`, `withdrawn`, `superseded` |
| `purpose_code` | Controlled text | Yes | Participation, reminders, conversation research, future contact or other approved purpose |
| `capture_method` | Enum | Yes | Web, assisted, paper/entered or other approved method |
| `staff_assisted` | Boolean | Yes | Important for accessibility and bias |
| `capacity_or_proxy_route` | Controlled text | If applicable | Only if included in protocol |
| `source_ip_retained` | Boolean | Yes | Prefer false unless specifically justified |

### 4.4 `baseline_assessments`

Store each baseline as a completed instrument with field-level provenance rather than one opaque profile JSON where possible.

Core fields:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `baseline_id` | UUID | Yes | Primary key |
| `participant_id` | UUID | Yes | Foreign key |
| `pathway` | Enum | Yes | Smoking or gambling |
| `instrument_set_version` | Text | Yes | Exact field and measure set |
| `started_at` | UTC timestamp | Yes | Burden and abandonment |
| `completed_at` | UTC timestamp | No | Completeness |
| `completion_mode` | Enum | Yes | Self-completed, assisted or staff-entered |
| `age_band` | Enum | If approved | Do not collect exact date of birth unless necessary |
| `sex_or_gender_fields` | Controlled fields | If approved | Follow protocol wording; explain purpose |
| `ethnicity` | Controlled code | If approved | Use current approved coding and `prefer not to say` |
| `deprivation_measure` | Derived category | If approved | Derive in a separated service; avoid retaining full postcode in research data |
| `disability_or_access_needs` | Controlled array | If approved | Collect functional/access needs, not unnecessary diagnoses |
| `preferred_language` | Controlled code | Yes | Supports safety and equity |
| `health_literacy_measure` | Instrument value | If approved | Use validated/approved instrument |
| `digital_access` | Controlled fields | If approved | Device, connectivity, shared device, confidence and assisted use |
| `quality_of_life_measure` | Instrument value | If approved | Instrument, version, score and completion stored separately |
| `current_service_use` | Controlled fields | Yes | Existing care/support and referral source |

### 4.5 `goals`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `goal_id` | UUID | Yes | Primary key |
| `participant_id` | UUID | Yes | Foreign key |
| `pathway` | Enum | Yes | Smoking or gambling |
| `goal_type` | Controlled code | Yes | Approved goal taxonomy |
| `participant_wording` | Text | Optional | Sensitive; short length and privacy warning |
| `structured_behaviour` | Controlled text | Yes | What they will do |
| `context` | Controlled/short text | If used | When or where |
| `frequency_or_limit` | Structured value | If used | Unit required |
| `start_date` | Date | Yes | Participant chosen |
| `review_date` | Date | Yes | Follow-up |
| `reason_code_or_text` | Controlled/short text | Optional | Participant's reason |
| `anticipated_barrier` | Controlled/short text | Optional | Minimise narrative |
| `if_then_plan` | Short text | Optional | Participant-approved |
| `support_route` | Controlled code | Optional | Person/service/tool |
| `status` | Enum | Yes | `planned`, `attempted`, `completed`, `revised`, `paused` |
| `supersedes_goal_id` | UUID | If revised | Preserve history |
| `created_at` | UTC timestamp | Yes | Audit |
| `status_changed_at` | UTC timestamp | Yes | Analysis |

## 5. Pathway outcome data

### 5.1 Smoking baseline fields

| Field | Type | Notes |
|---|---|---|
| `cigarettes_per_usual_day` | Integer with bounds | Baseline for change; unit and recall wording fixed |
| `days_smoked_past_7` | Integer 0-7 | Useful for current pattern |
| `years_smoked` | Numeric/band | Use only if required |
| `time_to_first_cigarette` | Approved category | Dependence indicator, not a diagnosis by the app |
| `previous_quit_attempts` | Approved category/count | Define recall period |
| `longest_previous_quit` | Approved category/duration | Participant reported |
| `current_intention` | Enum | `quit`, `cut_down_before_quit`, `reduce_for_now`, `understand_options` |
| `planned_quit_date` | Date/none | Participant chosen |
| `current_support` | Controlled array | Adviser, pharmacy, GP, medication discussion, digital support, none |
| `current_treatment_status` | Controlled array | General categories; do not use app to select treatment |
| `vaping_or_other_nicotine` | Controlled fields | Needed to interpret outcomes if in protocol |
| `importance_0_10` | Integer | Mechanism measure |
| `confidence_0_10` | Integer | Mechanism measure |

### 5.2 Smoking check-in

The default daily check-in should be brief.

| Field | Type | Frequency | Notes |
|---|---|---|---|
| `check_in_id` | UUID | Each check-in | Primary key |
| `participant_id` | UUID | Each check-in | Foreign key |
| `local_date` | Date plus timezone | Each check-in | Needed for daily outcomes |
| `recorded_at` | UTC timestamp | Each check-in | Audit |
| `cigarettes_smoked` | Integer 0-100 | Daily | Zero is a recorded zero, not missing |
| `goal_attempt` | Enum | Daily | `yes`, `partly`, `no`, `not_applicable` |
| `strongest_craving_0_10` | Integer | Daily | Fixed wording |
| `trigger_code` | Controlled code | Conditional | Ask if smoking occurred, goal not attempted or craving high |
| `helped_code` | Controlled code | Optional | Avoid unnecessary narrative |
| `confidence_0_10` | Integer | Weekly/after lapse/on request | Avoid daily burden unless justified |
| `post_quit_status` | Enum | Conditional | `none`, `isolated`, `regular`, `unclear`; participant confirms |
| `support_contact_since_last` | Controlled code | Weekly/event | Service uptake |

### 5.3 Smoking outcome assessment

| Field | Type | Notes |
|---|---|---|
| `assessment_timepoint` | Controlled code | Baseline, 4 weeks, 12 weeks and longer if approved |
| `target_quit_date` | Date | Defines follow-up calculations |
| `quit_attempt_since_baseline` | Boolean plus date | Prespecified definition |
| `seven_day_point_prevalence_abstinence` | Boolean/unknown | Exact question and denominator in protocol |
| `continuous_or_prolonged_abstinence` | Boolean/unknown | Use prespecified definition |
| `cigarettes_per_day` | Numeric | Fixed recall period |
| `days_smoked_in_recall_period` | Numeric | Fixed recall period |
| `biochemical_verification_type` | Enum | CO or other approved method |
| `verification_value` | Numeric | Unit and device required |
| `verification_result` | Enum | `verified`, `not_verified`, `not_attempted`, `not_available`, `indeterminate` |
| `treatment_uptake` | Controlled array | Behavioural/pharmacological support categories |
| `service_referral_status` | Enum | Link to referral entity |
| `quality_of_life_score` | Instrument score | Instrument and version required |
| `adverse_events_reported` | Boolean | Links to safety record |

Do not derive abstinence from missing check-ins or the number of zero-cigarette entries. The primary outcome must be collected through a separate scheduled outcome assessment.

### 5.4 Gambling baseline fields

The specialist team must approve wording, recall periods and measure licences.

| Field | Type | Notes |
|---|---|---|
| `validated_baseline_measure_id` | Controlled text | For example a properly administered identification/severity instrument |
| `validated_baseline_score` | Numeric/category | Deterministic scoring; not an LLM judgement |
| `gambling_days_in_recall_period` | Integer | Recall period stored |
| `gambling_episodes_in_recall_period` | Integer/unknown | Define episode |
| `gambling_expenditure_or_loss` | Numeric/band/unknown | Definition, currency and period required; never collect bank credentials |
| `chasing_present` | Approved response | Do not use alone as a diagnosis |
| `urge_intensity_0_10` | Integer | Mechanism and just-in-time support |
| `recent_harm_codes` | Controlled array | Financial, relationship, work, mental health or other approved categories |
| `current_treatment_or_support` | Controlled array | Service context |
| `protective_measures_active` | Controlled array | Self-exclusion, blocks, trusted person or other approved measure |
| `help_seeking_stage` | Controlled code | Early intervention, in treatment, relapse prevention or other protocol stratum |

### 5.5 Gambling check-in

| Field | Type | Frequency | Notes |
|---|---|---|---|
| `check_in_id` | UUID | Each check-in | Primary key |
| `participant_id` | UUID | Each check-in | Foreign key |
| `local_date` | Date plus timezone | Each check-in | Daily pattern |
| `recorded_at` | UTC timestamp | Each check-in | Audit |
| `gambled_since_last` | Boolean/unknown | Each check-in | Missing remains missing |
| `gambling_episode_count` | Integer/unknown | Conditional | Define episode |
| `expenditure_or_loss` | Numeric/band/unknown | Conditional | Optional if burden/safety dictates |
| `strongest_urge_0_10` | Integer | Each check-in | Fixed wording |
| `chasing_episode` | Boolean/unknown | Conditional | Approved wording |
| `trigger_code` | Controlled code | Conditional | Payday, sport, advertising, alcohol, distress, loss or other approved codes |
| `protective_action_code` | Controlled code | Each check-in | Blocking, delay, contact, alternative activity, none |
| `goal_attempt` | Enum | Each check-in | `yes`, `partly`, `no`, `not_applicable` |
| `acute_harm_route_shown` | Boolean | System-derived | Links to safety event |

### 5.6 Gambling outcome assessment

| Field | Type | Notes |
|---|---|---|
| `assessment_timepoint` | Controlled code | Baseline, 6 weeks, 12 weeks and longer if approved |
| `measure_id_and_version` | Controlled text | Use a responsive validated measure with appropriate recall period |
| `measure_score` | Numeric/category | Deterministic scoring |
| `gambling_days` | Integer | Prespecified recall period |
| `gambling_episodes` | Integer/unknown | Prespecified definition |
| `expenditure_or_loss` | Numeric/band/unknown | Prespecified definition and currency |
| `clinically_significant_deterioration` | Boolean/unknown | Statistician-approved rule |
| `treatment_entry` | Boolean/date | Human service outcome |
| `treatment_retention` | Controlled value | Define contact/retention |
| `protective_measures_started` | Controlled array | Since prior assessment |
| `protective_measures_maintained` | Controlled array | At follow-up |
| `gambling_related_harm_measure` | Instrument/value | Approved measure |
| `quality_of_life_score` | Instrument/value | Approved measure |
| `adverse_events_reported` | Boolean | Links to safety record |

## 6. Scheduled assessments

Use a schedule table so follow-up denominators do not depend on app engagement.

### `assessment_schedule`

| Field | Type | Notes |
|---|---|---|
| `schedule_id` | UUID | Primary key |
| `participant_id` | UUID | Foreign key |
| `assessment_type` | Controlled text | Baseline, weekly, 4-week, 6-week, 12-week, safety or other approved type |
| `due_at` | UTC timestamp/date | Protocol schedule |
| `window_opens_at` | UTC timestamp | Analysis window |
| `window_closes_at` | UTC timestamp | Analysis window |
| `status` | Enum | `scheduled`, `started`, `completed`, `missed`, `declined`, `withdrawn` |
| `completed_at` | UTC timestamp | Completion |
| `completion_mode` | Enum | In-app, phone, clinic, assisted or other approved method |
| `reminder_count` | Integer | Burden and fidelity |
| `missing_reason_code` | Controlled code | If known |

## 7. Interaction event taxonomy

### 7.1 `product_events`

General product events must contain no raw message, goal, trigger or health content.

Required event envelope:

| Field | Type | Notes |
|---|---|---|
| `event_id` | UUID | Deduplication and audit |
| `participant_id` | UUID | Pseudonymous foreign key; nullable only for approved pre-consent flow analytics |
| `session_id` | Rotating pseudonymous ID | No cross-purpose tracking |
| `occurred_at` | UTC timestamp | Client occurrence |
| `received_at` | UTC timestamp | Server receipt |
| `event_name` | Controlled enum | Never arbitrary strings in production |
| `pathway` | Enum | Smoking/gambling/core |
| `page_or_feature` | Controlled enum | Approved navigation taxonomy |
| `app_release_id` | Text | Exact code release |
| `intervention_version` | Text | Protocol intervention version |
| `properties_json` | Allowlisted object | Content-free properties only |
| `schema_version` | Text | Event contract version |

Approved core event names should include:

- `invitation_opened`
- `eligibility_started`
- `eligibility_completed`
- `participant_information_viewed`
- `consent_decided`
- `baseline_started`
- `baseline_completed`
- `intervention_activated`
- `session_started`
- `session_ended`
- `evidence_card_viewed`
- `evidence_source_opened`
- `goal_started`
- `goal_created`
- `goal_revised`
- `goal_paused`
- `check_in_started`
- `check_in_completed`
- `coping_tool_opened`
- `coping_tool_completed`
- `coach_opened`
- `coach_message_submitted`
- `coach_reply_delivered`
- `coach_reply_failed`
- `safety_route_shown`
- `safety_route_selected`
- `service_route_offered`
- `service_route_accepted`
- `service_route_sent`
- `service_route_received`
- `service_route_completed`
- `assessment_due`
- `assessment_started`
- `assessment_completed`
- `reminder_sent`
- `reminder_opened`
- `data_export_requested`
- `data_corrected`
- `withdrawal_requested`
- `account_deleted`

Define `activated`, `meaningful completion`, `retained` and `abandoned` in the protocol before analysis. A page view is not activation.

## 8. Chatbot interaction record

### 8.1 Structured metadata

One row per user message/system reply pair.

| Field | Type | Notes |
|---|---|---|
| `interaction_id` | UUID | Primary key |
| `participant_id` | UUID | Foreign key |
| `session_id` | Rotating ID | Conversation grouping |
| `turn_number` | Integer | Sequence |
| `submitted_at` | UTC timestamp | User message time |
| `responded_at` | UTC timestamp | Delivery time |
| `message_character_count` | Integer | Engagement without content |
| `response_character_count` | Integer | Engagement without content |
| `route_class` | Controlled enum | Coaching, evidence, medication-general, medication-personal, symptoms, crisis, gambling-advice, unsupported or other approved route |
| `safety_class` | Controlled enum | Deterministic classification |
| `response_kind` | Controlled enum | Generated, approved template, refusal, safety hand-off, error |
| `evidence_ids` | Array of controlled IDs | Sources used |
| `claim_ids` | Array of UUIDs | Links to stored structured claims if retained |
| `model_id` | Text | Exact provider model/snapshot |
| `prompt_version` | Text | Exact prompt policy |
| `corpus_version` | Text | Exact evidence release |
| `safety_rules_version` | Text | Exact deterministic rules |
| `output_schema_version` | Text | Exact structured schema |
| `provider_request_id` | Text | If approved and available |
| `input_tokens` | Integer | Cost |
| `output_tokens` | Integer | Cost |
| `latency_ms` | Integer | Reliability |
| `status` | Enum | Delivered, refused, fallback, timeout, validation_failed, provider_error |
| `human_review_status` | Enum | Not sampled, queued, reviewed, incident |

### 8.2 Raw conversation content

Raw text must not be copied into `product_events` or routine dashboards. If the approved pilot requires it for safety evaluation:

- store it in a separate encrypted table or service;
- use a different access role and auditable reason-for-access;
- state the purpose and retention in participant information;
- minimise or redact direct identifiers before persistence where feasible;
- prohibit model-training reuse;
- define whether deletion or withdrawal applies before and after data lock; and
- retain the exact system response and citations, not only the user message.

If raw text is not retained, the safety case must explain how incidents can be investigated. The decision cannot be left implicit.

## 9. Referral and human hand-off

### `referrals`

| Field | Type | Notes |
|---|---|---|
| `referral_id` | UUID | Primary key |
| `participant_id` | UUID | Foreign key |
| `pathway` | Enum | Smoking or gambling |
| `service_id` | Controlled text | Approved receiving service |
| `reason_code` | Controlled code | Routine support, treatment, safety, participant request or other approved reason |
| `offered_at` | UTC timestamp | System or staff offer |
| `accepted_at` | UTC timestamp | Participant accepted |
| `sent_at` | UTC timestamp | Real transfer occurred |
| `received_at` | UTC timestamp | Receiving service confirmation |
| `first_contact_at` | UTC timestamp | Service response |
| `completed_at` | UTC timestamp | Prespecified completed hand-off |
| `status` | Enum | Offered, declined, accepted, sent, received, contacted, completed, failed, unknown |
| `failure_reason_code` | Controlled code | Capacity, contact, technical or other approved reason |
| `operating_model_version` | Text | Expected service hours/SLA |

A link click may support `accepted` or `selected` but must not be recorded as `completed`.

## 10. Safety, incidents and complaints

### `safety_events`

| Field | Type | Notes |
|---|---|---|
| `safety_event_id` | UUID | Primary key |
| `participant_id` | UUID | Nullable only where necessary |
| `interaction_id` | UUID | If linked to coach interaction |
| `detected_at` | UTC timestamp | Audit |
| `detection_source` | Enum | Deterministic, model, participant, staff, follow-up, complaint |
| `hazard_code` | Controlled code | Hazard-log mapping |
| `severity` | Approved category | Clinical safety taxonomy |
| `expectedness` | Enum | Expected, unexpected, uncertain |
| `product_relatedness` | Enum | Unrelated, unlikely, possible, probable, definite, uncertain |
| `route_shown` | Controlled code | User-facing action |
| `route_selected_at` | UTC timestamp | If selected |
| `human_team_notified_at` | UTC timestamp | Only if a real monitored route exists |
| `human_acknowledged_at` | UTC timestamp | Response time |
| `resolved_at` | UTC timestamp | Closure |
| `outcome_code` | Controlled code | Approved disposition |
| `incident_or_near_miss` | Enum | Safety reporting |
| `serious_adverse_event` | Boolean | Protocol definition |
| `reporting_reference` | Controlled text | Link to approved incident system, not narrative copy |
| `app_release_id` | Text | Exact version |
| `model_prompt_corpus_rules_manifest` | Text | Exact intervention state |
| `reviewed_by_role` | Controlled text | Audit |

Maintain separate tables for complaints and data/security incidents where organisational processes require them, with links rather than duplicate narrative.

## 11. Evidence and release reproducibility

### `system_releases`

| Field | Type | Notes |
|---|---|---|
| `release_id` | Text | Immutable release identifier |
| `git_commit` | Text | Source revision |
| `deployed_at` | UTC timestamp | Release time |
| `environment` | Enum | Test, simulation, pilot or production |
| `model_id` | Text | Exact configured model |
| `prompt_version` | Text | Exact prompt |
| `corpus_version` | Text | Evidence package |
| `safety_rules_version` | Text | Deterministic rules |
| `measure_set_version` | Text | Outcome instruments |
| `consent_version` | Text | Participant materials |
| `hazard_log_version` | Text | Safety evidence |
| `approval_reference` | Text | Release authority record |
| `rollback_release_id` | Text | Tested rollback |
| `retired_at` | UTC timestamp | End of use |

### `evidence_items`

Each patient-facing clinical or quantitative claim should resolve to an approved source passage.

Minimum fields:

- evidence item ID;
- title, organisation, publication date and durable URL/DOI;
- source type and population;
- approved source passage locator;
- approved claim text and patient-friendly explanation;
- limitations and applicability;
- verification status, reviewer roles and dates;
- review due date;
- supersession/withdrawal status; and
- evidence release/corpus version.

## 12. Staff workload and economics

### `staff_activity`

| Field | Type | Notes |
|---|---|---|
| `activity_id` | UUID | Primary key |
| `staff_role` | Controlled code | Avoid names in analysis extract |
| `participant_id` | UUID | If participant-related |
| `activity_type` | Controlled code | Review, referral, safety, support, training, incident, evidence, admin |
| `started_at` | UTC timestamp | Workload |
| `ended_at` | UTC timestamp | Workload |
| `minutes` | Numeric | Validated bounds |
| `release_id` | Text | Version context |

### `cost_ledger`

Capture:

- model/API usage and dated unit price;
- hosting and storage;
- development and maintenance;
- evidence review and clinical safety;
- information governance, security and accessibility assurance;
- licences and suppliers;
- staff support, follow-up and safety review;
- training;
- incident management; and
- decommissioning/exit.

Store currency, price date, quantity, unit, source and whether the cost is observed or estimated.

## 13. Data quality and audit

### `data_quality_issues`

| Field | Type | Notes |
|---|---|---|
| `issue_id` | UUID | Primary key |
| `participant_id` | UUID | If applicable |
| `entity_name` | Controlled text | Affected table/entity |
| `record_id` | UUID/text | Affected record |
| `rule_code` | Controlled text | Validation rule |
| `detected_at` | UTC timestamp | Audit |
| `status` | Enum | Open, queried, corrected, accepted, excluded |
| `resolution_code` | Controlled text | No uncontrolled overwriting |
| `resolved_at` | UTC timestamp | Audit |
| `original_value_hash` | Text | Preserve provenance where appropriate |

### `access_audit`

Record:

- pseudonymous staff/service principal;
- timestamp;
- action;
- participant or dataset scope;
- reason/purpose code;
- success/failure;
- export identifier; and
- source IP/device only where approved and necessary for security.

## 14. Derived variables

Derivations must be implemented once in version-controlled analysis code. Examples include:

- days from invitation to screening, consent and activation;
- meaningful activation and completion;
- active days and sessions;
- follow-up completion within window;
- cigarettes/day change from baseline;
- recorded smoke-free days, separate from prespecified abstinence outcomes;
- gambling days/expenditure change using the fixed recall period;
- referral completion and time to contact;
- safety event rate per participant and per interaction;
- cost per participant and per meaningful completion;
- subgroup reach, retention, missingness, safety and outcome; and
- intervention exposure by exact release.

Do not derive:

- abstinence from missing check-ins;
- gambling abstinence from lack of app use;
- referral completion from a click;
- clinical diagnosis from chatbot text;
- individual prognosis from population evidence; or
- causal success from within-person change in an uncontrolled feasibility pilot.

## 15. Dashboards

### 15.1 Operational dashboard

- invited, screened, eligible, consented and active;
- due/complete follow-ups;
- app errors, latency and downtime;
- referral queue and service response;
- reminder delivery; and
- data-quality issues.

### 15.2 Safety dashboard

- open safety events by severity and age;
- missed or delayed routes;
- incidents and near misses;
- unsafe-output and unsupported-claim audits;
- model/prompt/corpus version; and
- subgroup safety signals.

This dashboard must be restricted and connected to a real response procedure. It must not imply continuous clinical monitoring if none exists.

### 15.3 Evaluation dashboard

- participant flow and denominators;
- meaningful engagement;
- outcome completion and missingness;
- smoking outcomes or gambling outcomes, never pooled;
- service uptake;
- participant experience;
- equity breakdowns with small-number suppression; and
- uncertainty, not only point estimates.

### 15.4 Economic dashboard

- observed and estimated cost by category;
- model and hosting cost by participant/interaction;
- staff minutes by activity;
- assurance and maintenance cost; and
- scenario sensitivity.

## 16. Analysis-ready exports

Every export should include:

- immutable export ID and creation time;
- study/protocol and analysis-plan version;
- data cut-off and lock status;
- included participant criteria;
- table/schema versions;
- data dictionary;
- derivation-code revision;
- intervention release manifest;
- missing-data summary;
- quality issues and exclusions; and
- export approver and access log.

Recommended analysis views:

1. participant flow;
2. baseline characteristics;
3. intervention exposure/engagement;
4. scheduled outcomes;
5. referrals and service use;
6. safety and incidents;
7. technical performance;
8. staff workload and cost; and
9. equity variables with disclosure control.

## 17. Required decisions before schema implementation

1. Exact first pilot population, pathway and comparator.
2. Research, service-evaluation and medical-device determinations.
3. Sponsor, controller, processor and joint-controller roles.
4. Lawful basis, Article 9 condition and consent purpose model.
5. Validated measures, recall periods, licences and primary outcome definitions.
6. Follow-up schedule and verification method.
7. Whether raw conversations are necessary and their retention/access model.
8. Human monitoring model, operating hours and safety response time.
9. Approved equity variables and small-number reporting rules.
10. Retention, withdrawal, erasure, data lock, backup deletion and archival rules.
11. Identity/contact system and pseudonymisation service.
12. Approved hosting, encryption, key management, access control and export environment.
13. Prespecified feasibility and progression thresholds.
14. Final event names and definitions of activation, completion and retention.

## 18. Mapping from the current prototype

| Current element | Keep | Change before pilot |
|---|---|---|
| `accounts` pseudonymous alias | Pseudonymous participant-facing identity concept | Separate study ID/contact link, consent history, status, withdrawal and audit |
| `profiles.assessment_json` | Validated pathway assessment object | Version instruments and store analysis-critical fields with explicit provenance |
| `check_ins` | Cigarettes, craving, confidence, trigger and date | Correct goal-attempt enum, conditional questions, scheduled outcomes, missingness and pathway-specific tables |
| `api_usage` | Tokens, latency, status and cost | Add intervention versions and retain as operational/economic data, not clinical outcome data |
| In-memory telemetry | Content-free design | Replace with stable protected events and remove public/event-level exposure |
| Coach response schema | Evidence IDs and structured reply | Add interaction/version/safety metadata, approved retention and independent audit |
| Disabled research persistence | Fail-closed boundary | Replace only through a separately approved research-data change, environment and release gate |

This dataset is intentionally broader than the current browser demo. It should be implemented only after fields have been reduced to the approved minimum for the actual pilot.
