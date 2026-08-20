# Synthetic QA record

Date: 20 August 2026. Data: fictional only. Browser: Playwright Chromium desktop and 390×844 mobile.

Automated checks cover invited email registration, verification, login, one-time password reset and old-session revocation; participant login, consent/baseline, plan, check-in, progress, structured coaching, forced AI fallback, due survey, due smoking follow-up, optional-consent update, data-copy request, help, withdrawal and post-withdrawal write denial; participant denial from staff routes; staff password plus TOTP with session rotation; overview, data quality, AI cost, gambling and release gates. The due assessment records exist only in the reset E2E fixture and do not alter ordinary seed behaviour.

Axe checks run on public, participant/progress/coach/help and staff/release pages. The first run found a colour-only urgent-help link; it was fixed with a persistent underline. Mobile dashboard and coaching checks found no horizontal overflow. Useful screenshots are under `artifacts/qa/`.

Final results: `npm test` passed 55 unit tests, the production build and two rendered-HTML checks; `npm run e2e` passed four Chromium journeys in 1.1 minutes; `npm run audit:verify` validated 21 events in one chain after the final operational dry runs; `npm run evidence:freshness` found no overdue/invalid runtime records; `npm audit --omit=dev` found zero vulnerabilities; and `npm run sbom` wrote 27 production components. `npm run report:synthetic` produced three analysis rows and a deterministic Markdown report.

The complete development audit retains four moderate findings in Drizzle Kit's development-only legacy esbuild loader. The proposed automated repair is a breaking downgrade and was not applied; the production dependency graph is clear.

Docker/PostgreSQL and a true Node 24 runtime were unavailable on this Windows workstation. The build ran on Node 25.5 with the package correctly warning that Node 24.x is required. A Node 24/PostgreSQL pre-production run remains mandatory.
