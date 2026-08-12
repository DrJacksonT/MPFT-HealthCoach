# UX, accessibility and health-literacy review

**Role:** UX/Accessibility Lead
**Prototype:** MPFT Evidence Coach: Smoking Prototype
**Reviewed:** 12 August 2026
**Documents reviewed:** `product-architecture.md` and `behaviour-change-review.md`
**Target:** WCAG 2.2 Level AA, mobile-first, plain English

## Executive verdict

The proposed architecture is directionally strong: it makes the guided programme primary, keeps AI optional, proposes structured forms and progressive evidence depth, preserves missing data honestly, and names accessibility as a release gate. The behaviour-change review also improves accessibility by limiting ordinary coaching turns to one open question, keeping goals user-selected, reducing check-in burden and avoiding shaming streak mechanics.

However, neither review yet defines an implementable accessibility contract. “Semantic UI”, “accessible charts” and “one question per screen” are intentions, not acceptance criteria. The current design could still produce a visually polished but difficult service: a ten-step wizard, five-item mobile navigation, dense evidence cards, ambiguous 0 to 10 controls, chat streaming that talks over a screen reader, charts without equivalent data, and safety messages whose most important action is buried in a paragraph.

V1 should use a **universal-precautions** approach: assume that any user may have low health literacy, low numeracy, limited dexterity, low vision, a cognitive or learning disability, fluctuating concentration, or unfamiliarity with digital health services. Do not ask users to disclose a disability in order to get an accessible experience. The NHS Digital Service Manual aims for a reading age of 9 to 11, short sentences (normally up to 20 words), short paragraphs and active voice; NHS England notes that more than 6 in 10 adults struggle with health content containing numbers and statistics. See [NHS: how we write](https://service-manual.nhs.uk/content/how-we-write) and [NHS: health literacy](https://service-manual.nhs.uk/content/health-literacy).

**Release decision:** suitable as an architecture proposal, but not accessibility-ready until the P0 criteria in this review are built and manually verified across the complete journeys. Automated accessibility scans are necessary but cannot establish WCAG conformance or health-literacy fitness.

## Standards and review position

- Apply the full [WCAG 2.2 specification](https://www.w3.org/TR/WCAG22/) at Level AA to every responsive variation and complete process, including the no-AI fallback, validation errors, safety exits, deletion, loading and empty states.
- Treat 24 by 24 CSS pixels as the WCAG 2.2 AA minimum target size, including spacing exceptions; use **44 by 44 CSS pixels as the product default** for primary controls and touch targets. See [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Make focused controls fully visible, not merely technically “not entirely hidden”, especially with sticky mobile navigation, virtual keyboards and coach panels. See [W3C: Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum).
- Follow current NHS form, focus, error and content patterns where they suit this non-branded prototype, without copying NHS branding or implying endorsement. See [NHS accessibility design guidance](https://service-manual.nhs.uk/accessibility/design), [NHS focus states](https://service-manual.nhs.uk/design-system/styles/focus-state) and [NHS form components](https://service-manual.nhs.uk/design-system/components).
- Use NICE risk-communication recommendations for evidence numbers: absolute risk where available, natural frequencies, a consistent denominator and timeframe, and positive and negative framing. See [NICE NG197 recommendations](https://www.nice.org.uk/guidance/ng197/chapter/recommendations).
- The 2025 Accessible Information Standard is relevant to future NHS service design, but this prototype must not claim compliance with it. A real service would need to ask, record, flag, share, meet and review communication needs through governed processes. See [NHS England: Accessible Information Standard](https://www.england.nhs.uk/accessible-information-standard/).

## Critique of the product architecture

### What should be retained

- The full journey works without generative AI.
- Structured assessment is preferred to a blank chat prompt.
- Evidence has progressive disclosure and an explicit “not an individual prediction” message.
- Missing check-ins remain missing rather than being interpreted as smoking or abstinence.
- Safety exits, Help and local-data deletion are designed as first-class flows.
- A review screen lets users check answers before completing assessment.
- Static fallbacks reduce the accessibility impact of model failures and long response times.
- Testing includes manual review in addition to an automated engine.

### Gaps and usability risks

1. **The core assessment is probably too long.** Ten pages before the central evidence value is shown may cause abandonment, especially for people using magnification, switch input or screen readers. Start with the minimum fields needed for a useful first result, then collect optional detail when it changes a card, goal or explanation.
2. **“One question per screen” can become a carousel.** It is helpful only if each step is a real page or predictable view with a unique title, one `h1`, persistent Back, clear progress and preserved answers. Animated card-swiping or horizontal dragging is not acceptable.
3. **Five persistent navigation items may not fit at 320 CSS pixels.** A labelled bottom bar can crowd, obscure focused controls and compete with the virtual keyboard. Test it at 320 CSS pixels and 400% zoom. If it does not reflow, keep the three highest-frequency destinations visible and put the rest in a clearly named menu; do not use icon-only navigation.
4. **“Help/data controls” combines unrelated concepts.** Emergency help and deleting local data must have separate, explicit labels. “Help” must stay in a consistent location; “Delete demo data” must be obvious but not easy to activate accidentally.
5. **Progressive disclosure can hide critical limitations.** The essential finding, population, timeframe, uncertainty and “not an exact prediction” statement cannot live only behind “Tell me more”. Disclosure controls need expanded/collapsed state and meaningful accessible names.
6. **The evidence page risks card overload.** A diverse set of cards is good scientifically, but four or more dense cards with nested disclosures create a long screen-reader and mobile journey. Show a short ordered summary first, then one card at a time or a clearly structured list with headings.
7. **Local auto-save is underspecified.** A “Save locally” button suggests work is unsaved until pressed. Prefer automatic local saving with a quiet “Saved on this device” status, plus a visible privacy explanation. Do not announce a live-region message on every keystroke.
8. **Streaming is an accessibility risk.** Token-by-token coach output can cause repeated screen-reader announcements, focus loss and cognitive load. Keep focus on the input/send control, announce a short loading status, then expose and announce the complete response once.
9. **The chart requirement is not yet a chart design.** Every visual trend needs a same-page summary and data alternative; tooltips cannot be the only source of exact values.
10. **The architecture does not define accessible page transitions.** Client-side navigation must update the document title and place focus predictably on the new `h1` or an error summary.
11. **The free-text coach remains a high-burden route.** It needs a visible label, concise examples, character guidance, a privacy warning before typing, and a non-chat route for every core task.
12. **No preference strategy is defined.** The UI must respect browser zoom, text spacing, forced colours, high contrast and `prefers-reduced-motion`. Do not create an in-app accessibility toolbar that duplicates browser features unless research shows a need.

## Critique of the behaviour-change review

### What should be retained

- One open question per ordinary coaching turn.
- Grounded reflections rather than invented emotion.
- No forced goal for a user who is not ready.
- A default check-in of four fields, with conditional follow-up.
- One primary goal and at most one supporting action.
- Separate current streak, total smoke-free days and longest streak.
- Structured lapse/relapse clarification rather than an inferred label.
- Deterministic safety templates and no coaching after an urgent handoff.

### Accessibility and literacy issues to change

1. **Some responses still contain too many ideas.** The lapse example asks a question with four conceptual options after two explanatory sentences. The relapse example offers five choices. On mobile, present no more than three choices at once and group the rest under “Other options”.
2. **Internal terms must not leak into user copy.** “VERIFIED”, “deterministic”, “population evidence”, “harm reduction”, “abstinence”, “applicability”, “relative risk”, “lapse” and “relapse” are useful domain terms but require plain alternatives or explanations.
3. **“Not-a-puff” is compact but can sound like a slogan or rule imposed by the service.** Prefer “After your quit date, not smoking at all gives you the best chance of staying smoke-free.” Explain the reason once; do not repeat it as a badge or warning.
4. **Two meanings of confidence may collide.** Use “How sure are you that you can make this change?” for the user's rating. Use “How certain is the evidence?” for research certainty.
5. **0 to 10 controls need explicit endpoints.** “0: not at all important” and “10: extremely important” must be in the label/hint and programmatic name. A colour gradient is not sufficient.
6. **The goal schema is system language, not display copy.** Show “What I will do”, “When”, “What could get in the way” and “My backup plan”, not `frequency_or_limit`, `anticipated_barrier` or `if_then_plan`.
7. **Safety copy needs hierarchy.** It is necessarily direct, but the action must appear first under a descriptive heading, with telephone numbers and links as separate controls. Do not present it as one long chatbot bubble.
8. **Teach-back must not become a test.** Where evidence is complex, ask “Was that clear?” and offer “Explain it another way”. If using a check, say “To check I explained it clearly…” rather than testing the user.
9. **Free-text ‘what went well’ is optional but still demanding.** Provide quick choices such as “I changed my routine”, “I used support”, “I waited for the craving to pass”, plus “Something else” and “Skip”.

## Plain-language content policy

Use these user-facing substitutions consistently:

| Avoid in patient/demo UI | Prefer |
|---|---|
| VERIFIED evidence | Evidence checked for this prototype |
| population evidence | Research about groups of people |
| applicability | How well this research fits what you told us |
| limitations | What this research cannot tell you |
| uncertainty | What we are not sure about |
| comorbidity | health condition |
| abstinence | not smoking / smoke-free |
| lapse | one or a few cigarettes after your quit date |
| relapse | back to smoking regularly |
| harm reduction | cutting down or stopping for a while |
| pack-years | an estimate of how much you have smoked over time |
| cessation intervention | stop-smoking support |
| synthetic persona | fictional demo profile |
| evidence confidence | how certain the evidence is |

Content acceptance rules:

- Aim for reading age 9 to 11 for the quick explanation; allow necessary medical terms only after a plain-English term.
- Keep most sentences to 20 words or fewer and paragraphs to three sentences or fewer.
- Front-load the action or main finding. Use headings that answer a question or describe the next task.
- Do not use idioms or metaphors such as “bump in the road”, “journey”, “supercharge”, “back on the wagon” or “clean”.
- Use active voice and concrete verbs: “Call 111”, “Choose a goal”, “Check your answers”.
- Explain abbreviations on first use unless widely understood in context. `NRT` should appear as “nicotine replacement therapy (NRT)” first.
- Do not use all capitals for status labels. In admin UI, display “Verified”, not `VERIFIED`; the stored enum may remain uppercase.
- Make link text meaningful out of context: “Read NHS advice about cravings”, not “Read more”.
- Use numerals for measurements and choices. Do not rely on vague frequency terms such as “rare” without numbers.
- For research effects, prefer “10 in 100” to “10%”, keep denominators consistent, state the timeframe and show both outcomes where appropriate. Never create an absolute number when the source does not support one.
- Pair every evidence-depth control with an accurate expectation: “Quick summary”, “More detail”, “Research methods and limitations”.

## Concrete UI acceptance criteria

### A. Page structure and navigation

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| A1 | Every view has a unique, descriptive `<title>` and exactly one visible page `h1`; heading levels do not skip for visual styling. | Navigate all routes with a screen reader heading list. |
| A2 | A visible-on-focus skip link moves to the main content. Landmarks are correctly named and not duplicated without labels. | Keyboard from browser chrome; inspect screen-reader landmarks. |
| A3 | Navigation order and the location of Help remain consistent. Current page is conveyed with text and `aria-current`, not colour alone. | Keyboard and 200% zoom on all main routes. |
| A4 | Client-side route changes update the document title and move focus to the new `h1`; Back restores the prior answer and a sensible focus target. | Complete onboarding with keyboard and VoiceOver/NVDA. |
| A5 | No core task requires chat, drag, swipe, hover, precise pointer movement or a time limit. | Keyboard-only and touch-only journey. |
| A6 | Links opening a new site are clearly named; do not force a new tab. If a new tab is necessary, warn in link text. | Inspect source links and NHS handoffs. |

### B. Reflow, zoom and mobile layout

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| B1 | All content and controls reflow at 320 CSS pixels without horizontal scrolling, except a genuinely two-dimensional data table with an equivalent stacked view. | 1280px viewport at 400% zoom and 320px device emulation. |
| B2 | Text resizes to 200% without clipping, overlap, loss of content or loss of function. | Browser zoom and OS large text. |
| B3 | User text-spacing overrides do not clip or overlap at WCAG 1.4.12 settings. | Text-spacing bookmarklet/manual CSS. |
| B4 | Both portrait and landscape orientations work. The app does not lock orientation. | Phone and tablet rotation. |
| B5 | Sticky headers, bottom navigation, cookie/privacy notices and the virtual keyboard never fully or substantially hide the focused control. | Tab through at 320px and open mobile keyboard. |
| B6 | Primary text is at least 16 CSS pixels, left aligned, with comfortable line height and a readable line length (about 45 to 75 characters on larger screens). | Visual inspection at breakpoints. |
| B7 | `prefers-reduced-motion` removes non-essential transitions, animated counts and chart drawing. No content flashes more than permitted by WCAG. | OS reduced-motion setting. |

### C. Colour, contrast and visual state

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| C1 | Normal text has at least 4.5:1 contrast; large text at least 3:1. | Test every token and state with a contrast tool. |
| C2 | Control boundaries, focus indicators and meaningful graphical objects have at least 3:1 contrast against adjacent colours. | Inputs, cards, charts and focus states. |
| C3 | No meaning uses colour alone. Progress, status, errors and chart series also use text, icons, patterns, line styles or markers. | Greyscale and colour-vision simulation. |
| C4 | Focus is strongly visible on every interactive element in every theme/state; it is not removed or replaced by a faint outline. | Keyboard across all controls. |
| C5 | Windows forced-colours/high-contrast mode preserves control boundaries, selection, focus and chart meaning. | Edge/Windows forced-colours test. |

### D. Controls, forms and validation

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| D1 | Use native HTML controls wherever possible. Every input has a persistent visible label; placeholder text is never the label. | Inspect accessibility tree and label click behaviour. |
| D2 | Radio and checkbox groups use `<fieldset>` and `<legend>`. Hints and errors are associated programmatically. | Screen-reader form navigation. |
| D3 | Required and optional status is in text and programmatic properties, not colour or an asterisk alone. Prefer optional labels because most questions should be skippable. | Form inventory. |
| D4 | Do not validate while the user types or leaves a field. On submit, show a top error summary, focus it, prefix the document title with “Error:”, link each error to its field, and repeat specific correction text beside the field. | Submit each form empty/invalid. Follow [NHS error-summary guidance](https://service-manual.nhs.uk/design-system/components/error-summary). |
| D5 | Entered answers persist after validation, Back and page refresh where local saving is promised. Users are not asked for the same information twice in one process. | Error and backtracking tests. |
| D6 | Interactive targets meet 24px WCAG minimum; primary buttons, radio/checkbox labels and mobile navigation aim for at least 44px in both dimensions. | CSS measurement at all breakpoints. |
| D7 | Visible labels match accessible names so speech users can say what they see. | Voice-control test for every primary action. |
| D8 | Any 0 to 10 slider has keyboard support, an announced current value and endpoints, and plus/minus or select-based alternatives so dragging is never required. | Keyboard, switch simulation and touch. |
| D9 | Conditional questions appear only after an explicit selection, are inserted next in reading order, and are announced once. Do not hide unrelated content. | Radio conditional flow with screen reader. |
| D10 | Review answers use semantic key/value structure and uniquely named “Change [answer]” links; changed answers remain pre-populated. | Link list and review/edit loop. |

### E. Dynamic content, AI and status

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| E1 | Loading, saved, error, empty and completion states are available as text and exposed as status messages without unnecessary focus moves. | Slow network/API-disabled tests with screen reader. |
| E2 | Coach streaming is not announced token by token. Announce “Preparing a response” politely, then announce the complete response once or move focus only at the user's request. | NVDA, VoiceOver and TalkBack. |
| E3 | Focus remains stable when cards load, disclosures expand, goals save or charts update. User-triggered modals trap focus, close with Escape where safe, and return focus to the trigger. | Keyboard interaction. |
| E4 | Notifications are not toast-only. Persistent task outcomes appear near the relevant heading or control. | Save, delete, load-persona and API-error paths. |
| E5 | AI timeout or validation failure returns plain reviewed content and preserves the user's text so it can be retried or copied. | Offline and forced-failure tests. |
| E6 | The coach input has a visible label, concise scope hint and privacy warning before entry. The send button is explicitly named “Send message”. Enter/Shift+Enter behaviour is documented and does not trap multiline users. | Keyboard and screen reader. |

### F. Evidence cards and progressive disclosure

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| F1 | Each card starts with a unique heading and a one- or two-sentence quick finding; source, timeframe, uncertainty and “not an exact prediction” remain available without opening every nested control. | Mobile and screen-reader browse mode. |
| F2 | “Tell me more” controls are buttons with `aria-expanded` and `aria-controls`; their accessible name includes the card topic. | Button list and expand/collapse. |
| F3 | No card nests more than one disclosure level. Research detail may be a separate page with a clear Back link. | Keyboard and cognitive walkthrough. |
| F4 | Source links name the organisation/title rather than “Source” or “Read more”. Publication year and source type are text. | Screen-reader link list. |
| F5 | Certainty is not colour-only and includes a one-sentence explanation. Use distinct language from the user's confidence rating. | Greyscale and content audit. |
| F6 | Numerical comparisons use consistent units, denominators and timeframes. Relative effects are never visually emphasised above available absolute effects. | Numeracy/content review against the source record. |

### G. Safety and destructive actions

| ID | Acceptance criterion | Manual verification |
|---|---|---|
| G1 | Safety exits use a page heading such as “Get urgent help now”, put the primary action first, and expose 999/111 as separate text controls. | Keyboard, mobile and screen reader. |
| G2 | Safety information does not depend on red colour, an icon, animation or a chatbot bubble. It remains usable with CSS/images/AI unavailable. | Disable CSS/images/API. |
| G3 | `tel:` links have accessible names that include the number and purpose, for example “Call 999 for an emergency”. Desktop users also see the number as text. | Mobile and desktop. |
| G4 | “Delete my demo data” opens a clearly labelled confirmation that states exactly what will be deleted and what will remain. Default focus is on the safe option. After deletion, announce completion and move to the landing heading. | Keyboard/screen reader deletion E2E. |
| G5 | Loading a fictional profile states that it will replace current local data before confirmation. Cancel returns focus to the initiating profile. | Persona replacement E2E. |

## Keyboard journey acceptance flows

### Landing and scope

1. `Tab` first reveals “Skip to main content”.
2. Focus order then reaches the service title/home link, Help, “Start my smoking review”, “Load a fictional demo profile” and relevant footer links in visual order.
3. Activating Start updates the title to “Before you start: Evidence Coach”, places focus on the `h1`, and does not announce stale landing content.
4. Scope options are native radios or checkboxes with a legend. Space selects; Tab leaves the group; Continue submits.
5. Out-of-scope selection leads to an explanatory page, not an inline validation error.

### Assessment

1. Each step has Back, “Question n of total”, one `h1`, hint, control group and Continue.
2. Back is a link or button with predictable browser-history behaviour; it never clears the prior answer.
3. Multi-select options use large label targets. “None of these” and “Prefer not to say” are mutually exclusive in code and explained in text.
4. Numeric cigarette/year/spend inputs accept reasonable formats and give specific errors. Do not block pasted values.
5. A 0 to 10 control works with Tab, arrow keys and speech input without drag.
6. The review page provides “Change cigarettes per day”, “Change motivation”, and similarly complete link names.

### Evidence, goal and check-in

1. Focus lands on the evidence page heading; a polite status may say how many topics loaded, but focus does not jump to a card.
2. Heading navigation gives the evidence topics in ranked order.
3. Expand buttons state the topic and current state. Expanded content follows the button in DOM order.
4. Selecting a priority uses a labelled radio/checkbox, not clicking an unlabelled card surface.
5. Goal options are a fieldset. Custom goal fields appear next in order and receive an appropriate announcement.
6. Check-in errors focus the summary. Successful submission announces “Check-in saved on this device” once and shows a text summary before any chart.

### Coach

1. The coach heading and boundaries precede the textarea in reading order.
2. Input remains available while the response is prepared unless double-submission would be unsafe; disabled state is announced.
3. Escape does not delete text. A separate “Clear conversation” control explains and confirms the action.
4. Source/citation links follow the claim they support and have meaningful names.
5. A safety route replaces ordinary coach output with the safety page/region and a clear first action.

## Screen-reader acceptance flows

Test at minimum with NVDA + Firefox or Chrome on Windows, VoiceOver + Safari on iOS, and TalkBack + Chrome on Android. Include browse and forms modes.

- On every page, the title and `h1` describe the current task; the user can list headings, landmarks, controls and links without ambiguous repeated names.
- Step progress is announced as text (“Question 3 of 7”), not inferred from a visual bar. The bar, if present, is decorative or has an accurate accessible value without duplicate noise.
- Form groups announce question, hint, selection state, error and whether multiple choices are allowed.
- Importance/confidence values announce both the number and endpoint meaning.
- Evidence-card buttons announce “More detail about breathing, collapsed/expanded”, not five identical “Tell me more” buttons.
- Dynamic results announce once. The screen reader never reads partial model tokens repeatedly.
- Progress summaries are read before chart details. The equivalent table/list includes every plotted value and missing-day label.
- Modal confirmation has a name, description and contained focus; closure returns to the trigger.
- Safety output is not merely an `aria-live` interruption. It is a stable page or region with navigable heading, text and action links.

## Mobile-first flow requirements

- Design and content review starts at 320 CSS pixels, not desktop. Also test 360px, 390px, tablet portrait and landscape.
- Keep the primary action visible after the question content without fixing it over the viewport. If a sticky action is used, reserve space and prove focus is not obscured.
- Do not place two equal primary buttons side by side on narrow screens. Stack them with the primary action first and clear spacing.
- Use the correct mobile keyboard: numeric input mode for cigarette counts and spend, while still allowing accessible desktop entry and paste.
- Do not auto-focus an input on page load; this can open the virtual keyboard, hide context and disorient screen-reader users.
- Touch targets should normally be at least 44px. Checkbox/radio labels must be clickable across the full row.
- Avoid horizontal swipe carousels for evidence, goals, dates or charts. Use a vertical list and explicit Previous/Next where pagination is necessary.
- Keep safety telephone numbers selectable and visible. Do not render them only as icon buttons.
- Test loss of connectivity and returning from an NHS external link. Local answers must remain intact.

## Chart and progress alternatives

Every chart must have all four layers:

1. **Heading:** for example, “Cigarettes recorded each day”.
2. **Plain-language summary:** for example, “You recorded fewer cigarettes on 4 of the last 7 days. There were no check-ins on Tuesday and Thursday.” This must be deterministic and avoid causal interpretation.
3. **Visual chart:** labelled axes, visible values or accessible tooltips, data markers in addition to colour, and 3:1 contrast for meaningful lines/points.
4. **Equivalent data view:** a visible “Show data as a table” control leading to a semantic table or stacked date/value list containing every point and explicit missing values.

Charts are complex images and need a short description plus a complete text equivalent of essential data. See [W3C: complex images](https://www.w3.org/WAI/tutorials/images/complex/), [W3C: use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [W3C: non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast) and [W3C: accessible tables](https://www.w3.org/WAI/tutorials/tables/).

Additional rules:

- Missing check-ins are gaps labelled “No check-in”, never zero.
- Do not smooth lines or imply measurements between recorded dates.
- Tooltips must be available by keyboard focus as well as pointer, dismissible with Escape, hoverable and persistent long enough to read. They must not contain the only exact value.
- Do not use pie/doughnut charts for cigarette trends or progress composition.
- Avoid celebratory animation and “streak broken” visuals. Respect reduced motion.
- Estimated money not spent and cigarettes avoided need an adjacent “How this estimate is worked out” disclosure and accessible formula inputs.
- At 320px, use the stacked data list if a table would require two-dimensional scrolling; the visual chart may remain supplemental.

## Recommended core journey simplification

The architecture's ten assessment topics should not all be mandatory before value is shown. Test this smaller sequence:

1. **Scope:** adult/current cigarette smoking/prototype acknowledgement.
2. **Current smoking:** cigarettes per day, years smoked and time to first cigarette on no more than two short pages.
3. **What matters:** motivation choices and optional importance/confidence.
4. **Health relevance:** optional predefined conditions with “None” and “Prefer not to say”.
5. **What next:** quit, cut down or understand options.
6. **Check answers**, then show the first evidence summary.

Previous attempts, longest quit, methods tried, vaping and spend should be collected only when the user enters a relevant goal, money view or treatment-information path. This reduces redundant entry and delays sensitive or demanding questions until their purpose is clear.

## Test matrix and evidence required

Accessibility sign-off requires retained evidence, not “axe passed”.

| Area | Minimum evidence |
|---|---|
| Automated | Axe or equivalent on every stable route/state at mobile and desktop; zero serious/critical violations and every finding triaged. |
| Keyboard | Video/checklist for landing → assessment → evidence → goal → check-in → progress; coach safety refusal; persona load; delete data. |
| Screen reader | NVDA desktop, VoiceOver iOS and TalkBack Android notes for all critical flows, including errors and loading. |
| Visual | Contrast token report; 200% text resize; 400%/320px reflow; text-spacing; forced-colours; reduced-motion. |
| Content | Reading-age report used as a prompt, followed by human health-literacy review; jargon and numerical-risk checklist. |
| Mobile | Physical-device test on at least one small iOS and one small Android device; virtual keyboard and orientation included. |
| Resilience | JavaScript delayed/error, AI unavailable, slow network, browser refresh, external-link return and local-data recovery. |
| User research | Moderated task testing with people with low digital confidence and at least users of low-vision magnification, screen reader, keyboard/switch or motor-access methods, plus varied health literacy. |

Automated scans cannot judge reading order intent, meaningful link text in context, whether a reflection is patronising, chart equivalence, cognitive load, safety salience or whether the service works for the target audience.

## Assumptions

1. V1 is an English-language controlled research/demo prototype, not an approved NHS service.
2. No account or cross-device sync exists; answers are saved only on the current browser/device.
3. Core programme tasks can be completed without free text or AI.
4. The team can use standard HTML and tested component patterns even if it does not adopt NHS.UK Frontend wholesale.
5. Evidence content and safety copy will receive separate clinical review.
6. A mobile-first layout includes 320 CSS pixel and 400% zoom testing, not only common modern phone widths.
7. The UI can expose a semantic table/list alongside each chart.
8. The prototype will not claim Accessible Information Standard compliance or provide automatic translation as a substitute for reviewed formats.
9. User research participants can be recruited across disability, literacy and digital-confidence needs before pilot discussion.

## Major risks

1. **Conformance theatre:** passing automated scans is mistaken for WCAG 2.2 AA or usability.
2. **Wizard fatigue:** the long assessment delays value and multiplies page/focus transitions for assistive-technology users.
3. **Card and disclosure overload:** evidence transparency becomes a dense hierarchy that is technically semantic but practically unusable.
4. **Health-numeracy harm:** percentages, relative effects and multiple denominators create false impressions even when the source is correct.
5. **Chat accessibility:** streaming, scrolling history and repeated live-region announcements make the optional coach the least accessible route.
6. **Mobile obstruction:** sticky navigation/actions and the virtual keyboard hide focus or safety controls.
7. **Custom control failure:** visual card selectors, sliders, charts and dialogs do not expose correct name, role, value and keyboard behaviour.
8. **Safety salience:** urgent actions are buried in a reassuring paragraph or depend on colour/iconography.
9. **Plain-language drift:** generated text gradually exceeds the quick mode's literacy target and introduces unexplained clinical terms.
10. **Language exclusion:** English-only V1 may deepen inequity; unsafe automatic translation is not a remedy.
11. **Shared-device harm:** an accessible local history can still expose smoking/health information to another user of the device.
12. **Reduced dexterity/cognition under craving:** a flow that works in calm usability testing may fail during stress or strong cravings.

## Disagreements and design challenges

- **Reduce the mandatory assessment before evidence.** The architecture's ten topics are scientifically attractive but too burdensome as a universal entry gate.
- **Do not default to a five-item bottom navigation.** Keep all destinations available, but only use a persistent mobile bar if it passes 320px, 400% zoom, target-size and focus-obscuration tests.
- **Do not hide data controls inside Help.** Use distinct, plainly named locations and keep Help consistent.
- **Do not require a chart to understand progress.** The summary and data list are primary information; the chart is an enhancement.
- **Do not use an 11-position drag-only slider.** If a slider is retained, add a keyboard/single-pointer alternative and announce endpoints/current value.
- **Do not stream response text to assistive technologies.** Visual streaming may remain optional, but screen readers should receive a buffered complete response.
- **Do not expose “VERIFIED” as a trust badge without explanation.** Say what was checked, by whom/role, and when in research detail; the quick view should use plain language.
- **Do not treat reading age as a pass/fail quality score.** It is a warning signal. User comprehension, numeracy and task success matter more.
- **Do not ask daily confidence by default.** This agrees with the behaviour review and conflicts with the architecture's earlier check-in list. Use weekly or event-triggered measurement unless research supports daily use.
- **Do not show five relapse choices in one sentence.** Group them into at most three clear routes, then reveal secondary options.

## Required changes

### P0: release blockers

- Turn the acceptance criteria in sections A to G into testable tickets and release gates.
- Shorten the mandatory assessment or demonstrate through inclusive usability testing that the longer flow is necessary and completable.
- Define page-title, `h1`, focus-management and error-summary behaviour for every step and SPA transition.
- Use native labelled controls and fieldset/legend structures; provide a non-drag alternative for all 0 to 10 inputs.
- Implement 320px/400% reflow, 200% text resize, text spacing, forced-colours, visible focus and reduced-motion support.
- Ensure persistent mobile UI never obscures focus; remove or redesign it if it does.
- Provide a summary and complete table/list alternative for every progress chart.
- Buffer screen-reader coach output and make all core tasks available without chat.
- Restructure safety handoffs as stable, headed content with primary actions first and explicit 999/111 labels.
- Separate Help from data controls and make deletion confirmation/return focus accessible.
- Rewrite quick-view and coaching copy using the plain-language policy; remove internal status/behaviour terms.
- Complete manual keyboard and screen-reader tests for the full processes, not isolated components.

### P1: required for a credible prototype

- Add an accessibility statement that honestly lists the target, test date/methods, known issues and a non-clinical route to report accessibility problems.
- Add content lint/review for sentence length, unexplained terms, ambiguous links and unsupported risk formats.
- Add deterministic chart summaries and explicit missing-day language.
- Test error, empty, loading, offline, no-AI and stale-local-data states with assistive technology.
- Test with physical small-screen devices and virtual keyboards.
- Conduct moderated research with low digital-confidence and disabled participants; close severe findings before demonstration to external users.
- Provide a clear way to restart, pause, review and change answers without losing work.

### P2: before a real pilot

- Establish an Accessible Information Standard implementation plan and accessible-format/communication-support process under NHS governance.
- Research translated content needs and commission clinically reviewed translations; do not rely on raw machine translation.
- Validate the health-literacy and risk-communication approach through comprehension testing, not readability scores alone.
- Define ongoing accessibility ownership, regression testing, incident handling and change control for evidence/model/UI updates.
- Include accessibility and digital-exclusion outcomes in the research protocol, not only overall completion and engagement.

## Confidence

**Overall confidence: high for the WCAG and component-level requirements; moderate for the recommended journey length and content grouping.**

The technical criteria are directly grounded in WCAG 2.2 and established NHS/W3C patterns. Confidence is also high that charts need complete text/data alternatives and that streaming must be controlled for screen readers. Confidence is moderate that the six-part assessment is the best sequence; only representative user research can establish the right balance between personal relevance and burden.

## What is most likely to be wrong here?

The most likely mistake is assuming that fewer pages always improve accessibility. Some users benefit from one focused question per page, while others need a shorter journey and easier comparison across answers. The correct design may be adaptive rather than uniformly compressed.

The second likely mistake is over-specifying assistive-technology behaviour before implementation. Exact announcements vary by browser, framework, control and screen reader. The acceptance criteria should describe the information and focus outcome, then be verified on the supported combinations rather than relying on ARIA theory.

The third is that a reading-age target may oversimplify clinically important uncertainty. Plain English must not remove population, timeframe, absolute-versus-relative meaning or limitations. Progressive disclosure should reduce initial load while keeping the scientific meaning intact.

Finally, controlled synthetic demonstrations may understate real-world barriers: low-cost phones, shared devices, poor connectivity, stress, cravings, language needs and fear of judgement. A conformant prototype can still widen inequalities if the only alternative is “use another digital page”. Human and non-digital support routes must remain visible.

## Sources

- [W3C: Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C: Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- [W3C: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C: Use of Colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [W3C: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- [W3C: Complex images](https://www.w3.org/WAI/tutorials/images/complex/)
- [W3C: Tables tutorial](https://www.w3.org/WAI/tutorials/tables/)
- [NHS Digital Service Manual: Accessibility design guidance](https://service-manual.nhs.uk/accessibility/design)
- [NHS Digital Service Manual: Focus state](https://service-manual.nhs.uk/design-system/styles/focus-state)
- [NHS Digital Service Manual: Error summary](https://service-manual.nhs.uk/design-system/components/error-summary)
- [NHS Digital Service Manual: How we write](https://service-manual.nhs.uk/content/how-we-write)
- [NHS Digital Service Manual: Formatting](https://service-manual.nhs.uk/content/formatting)
- [NHS Digital Service Manual: Health literacy](https://service-manual.nhs.uk/content/health-literacy)
- [NHS England: Digital accessibility standards](https://www.england.nhs.uk/long-read/digital-accessibility/)
- [NHS England: Accessible Information Standard](https://www.england.nhs.uk/accessible-information-standard/)
- [NICE NG197: Shared decision making recommendations](https://www.nice.org.uk/guidance/ng197/chapter/recommendations)
