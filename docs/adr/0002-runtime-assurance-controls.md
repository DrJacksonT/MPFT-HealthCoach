# ADR 0002: runtime assurance controls

Date: 20 August 2026
Status: accepted for local implementation; live use remains gated

## Context

The standalone platform needs strong browser policy, auditable state changes and a study-wide AI cost ceiling that remain correct under concurrent requests. Static CSP values, best-effort audit appends and sum-before-call budget checks do not provide those properties.

## Decision

1. Generate a fresh CSP nonce and request identifier in the Next.js proxy for every request. Force dynamic rendering so a nonce is not reused through static output. Permit development-only `unsafe-eval`; do not permit inline scripts without a nonce.
2. Serialize audit-chain appends through a database head row and optimistic retries. Canonical JSON version 2 makes hash input explicit. Verification reports chain segments so a historical migration boundary is visible rather than silently accepted.
3. Reserve the conservative maximum AI cost atomically before a provider call and settle the reservation idempotently afterward. An unknown or failed billed call is charged at the reservation ceiling. Expired reservations remain fail-closed until reconciled by retention operations.
4. Expose a minimal database-backed readiness endpoint containing no version, dependency, environment or exception detail.
5. Redirect legacy public development administration URLs into the authenticated staff portal; they must not render operational or evidence data themselves.

## Consequences

All application pages are dynamically rendered, trading some cacheability for per-request CSP isolation. AI capacity can be temporarily conservative after an interrupted request. Audit-chain upgrade boundaries require explicit operational reconciliation. Readiness confirms application/database reachability only; it is not evidence that a live study is approved or clinically safe.
