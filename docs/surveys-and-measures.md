# Surveys, schedules and measures

Survey definitions and versions are immutable. Supported response types are Likert 1–5, scale 0–10, numeric, single choice, multiple choice, yes/no, yes/no/unsure and controlled optional text (500 characters). Server validation checks type, allowed options, duplicates and required items.

Instances have open/close windows, save/resume, complete, skip, snooze and dismiss states. Terminal states lock answers. Scheduling is independent of coaching use and applies configured offset, open duration, sampling rate and maximum instances. Burden seconds and lifecycle events are exported with the survey version.

Seeded questions are original custom technical-pilot items. Their scoring is descriptive only and `validatedScale: false`. The measure registry contains an approved custom entry and a fail-closed candidate placeholder; no licensed questionnaire wording is seeded until sponsor, wording, scoring, licence and protocol approval are all recorded.

Unsafe/upsetting feedback creates a quality/safety flag and immediately shows help, while stating that the site is not monitored. Surveys never block coaching or urgent help. Missing/skipped answers remain missing.
