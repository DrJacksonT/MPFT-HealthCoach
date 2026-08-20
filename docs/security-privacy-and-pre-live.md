# Security, privacy and pre-live checklist

Implemented controls include Argon2id, generic auth errors, invitation limits, hashed one-time/reset/session tokens, session expiry/revocation and MFA rotation, HttpOnly/SameSite cookies, Secure cookies in production, CSRF/origin checks, durable rate limits, server RBAC, Zod validation, parameterised Drizzle queries, no-store sensitive responses, nonce CSP, production HSTS, frame/content/referrer/permissions/isolation headers, request IDs, atomic AI budget reservations, strict AI output checks, a CycloneDX SBOM and hash-chained privileged audit.

Data minimisation separates contact identity, pseudonymised research observations, safety/quality, optional raw text and operational events. Default exports exclude contact and raw text. No third-party client analytics or error service is configured. Raw health text is absent from generic logs and product events.

Controller, processor, sponsor, lawful basis, UK GDPR Article 9 condition, confidentiality basis, retention schedule and data-subject verification process are **undecided external decisions**. A DPIA, records of processing, processor contracts, international-transfer assessment and hosting encryption/key-management evidence are required before live data.

Pre-live checks: Node 24/PostgreSQL restore drill in the selected host; secret rotation; TLS/domain/mail configuration; production MFA; penetration test and dependency/SBOM review; accessibility audit and user research; DPIA/IG approval; clinical-safety case; evidence and protocol approval; incident/monitoring rota; backup RPO/RTO approval; supplier/data-region approval; exact release manifest and rollback rehearsal. None is claimed complete here.

Residual risks include keyword safety false positives/negatives, model error despite constraints, operational metadata sensitivity, over-conservative failed-call cost estimates, shared-device privacy, digital exclusion and the untested Docker path in this workstation.
