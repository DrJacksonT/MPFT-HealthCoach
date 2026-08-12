"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Coins,
  ExternalLink,
  HeartHandshake,
  Info,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import type {
  Assessment,
  CheckIn,
  DemoState,
  EvidenceRecord,
  Goal,
} from "@/src/domain/types";
import {
  calculateDailyCost,
  calculatePackYears,
  calculateProgress,
  smokingModule,
} from "@/src/modules/smoking";
import { demoStateSchema } from "@/src/domain/state-schema";

interface CoachCitation {
  id: string;
  title: string;
  organisation: string;
  publicationYear: number;
  url: string;
}
interface CoachClaim {
  text: string;
  evidence_ids: string[];
  certainty: string;
}
interface CoachReply {
  kind: string;
  summary?: string;
  why_relevant?: string;
  claims?: CoachClaim[];
  limitations?: string[];
  coaching_question?: string;
  message?: string;
  citations?: CoachCitation[];
}
interface EvidenceBrief {
  kind: string;
  generatedBy?: "ai" | "reviewed-template";
  headline?: string;
  overview?: string;
  key_points?: {
    title: string;
    explanation: string;
    why_it_matters: string;
    evidence_ids: string[];
    certainty: "high" | "moderate" | "limited";
  }[];
  context_notes?: {
    factor: string;
    explanation: string;
    evidence_ids: string[];
  }[];
  important_uncertainties?: string[];
  follow_up_suggestions?: string[];
  message?: string;
}

const STORAGE_KEY = "evidence-coach-demo-v1";
const empty: DemoState = { version: 1, synthetic: true, checkIns: [] };
const baseAssessment: Assessment = {
  ageBand: "45-59",
  cigarettesPerDay: 10,
  yearsSmoked: 15,
  firstCigarette: "31-60",
  previousAttempts: "1",
  longestQuit: "weeks",
  methodsTried: [],
  vaping: "no",
  motivations: ["health"],
  importance: 7,
  confidence: 5,
  conditions: ["none"],
  intention: "quit",
};
const personas: Record<string, Assessment> = {
  "Family focus": {
    ...baseAssessment,
    ageBand: "45-59",
    cigarettesPerDay: 20,
    yearsSmoked: 25,
    firstCigarette: "6-30",
    previousAttempts: "2-3",
    motivations: ["family", "health"],
    importance: 9,
    confidence: 6,
    conditions: ["hypertension"],
    intention: "quit",
    packPrice: 15,
  },
  "Breathing support": {
    ...baseAssessment,
    ageBand: "60-65",
    cigarettesPerDay: 15,
    yearsSmoked: 40,
    firstCigarette: "within-5",
    previousAttempts: "4+",
    motivations: ["breathing", "independence"],
    importance: 8,
    confidence: 3,
    conditions: ["copd"],
    intention: "reduce",
    packPrice: 14.5,
  },
  "Money & fitness": {
    ...baseAssessment,
    ageBand: "30-44",
    cigarettesPerDay: 8,
    yearsSmoked: 12,
    firstCigarette: "after-60",
    previousAttempts: "none",
    longestQuit: "not-applicable",
    motivations: ["money", "fitness"],
    importance: 7,
    confidence: 7,
    conditions: ["none"],
    intention: "learn",
    packPrice: 16,
  },
  "Is it too late?": {
    ...baseAssessment,
    ageBand: "45-59",
    cigarettesPerDay: 18,
    yearsSmoked: 32,
    firstCigarette: "6-30",
    previousAttempts: "2-3",
    motivations: ["health", "family"],
    importance: 6,
    confidence: 4,
    conditions: ["diabetes", "cardiovascular"],
    intention: "learn",
    packPrice: 15.5,
  },
};
const personaSummaries: Record<string, string> = {
  "Family focus":
    "In their 40s, with high blood pressure, motivated by family and health.",
  "Breathing support":
    "In their 60s, with COPD, aiming to reduce and low confidence.",
  "Money & fitness":
    "In their 30s, motivated by saving money and improving fitness.",
  "Is it too late?":
    "In their 50s, with diabetes and cardiovascular disease, unsure about quitting.",
};
const evidenceTagLabels: Record<string, string> = {
  overall: "general quitting evidence",
  "cessation-support": "stop-smoking support",
  hypertension: "high blood pressure",
  copd: "COPD",
  cardiovascular: "heart and circulation",
  family: "family",
  health: "health",
  breathing: "breathing",
  independence: "independence",
  money: "money",
  fitness: "fitness",
  diabetes: "diabetes",
};
function displayTag(tag: string) {
  return evidenceTagLabels[tag] ?? tag.replaceAll("-", " ");
}
function findPersonaName(assessment?: Assessment) {
  if (!assessment) return undefined;
  return Object.entries(personas).find(
    ([, persona]) => JSON.stringify(persona) === JSON.stringify(assessment),
  )?.[0];
}
type View =
  "landing" | "review" | "evidence" | "plan" | "progress" | "coach" | "help";

export function CoachApp({
  evidence,
  showDeveloperLinks = false,
}: {
  evidence: EvidenceRecord[];
  showDeveloperLinks?: boolean;
}) {
  const [state, setState] = useState<DemoState>(empty);
  const [view, setView] = useState<View>("landing");
  const [hydrated, setHydrated] = useState(false);
  /* localStorage is an external browser store. Hydration intentionally restores it once. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = demoStateSchema.safeParse(JSON.parse(saved));
        const tooOld =
          parsed.success &&
          parsed.data.savedAt &&
          Date.now() - new Date(parsed.data.savedAt).getTime() >
            30 * 24 * 60 * 60 * 1000;
        if (parsed.success && !tooOld) {
          setState({
            ...parsed.data,
            personaName:
              parsed.data.personaName ??
              (parsed.data.synthetic
                ? findPersonaName(parsed.data.assessment)
                : undefined),
          });
          setView(parsed.data.assessment ? "evidence" : "landing");
        } else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be disabled. Continue with empty in-memory state.
      }
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (!state.assessment && !state.goal && state.checkIns.length === 0)
        localStorage.removeItem(STORAGE_KEY);
      else
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...state, savedAt: new Date().toISOString() }),
        );
    } catch {
      // Storage can be unavailable or full. The in-memory prototype still works.
    }
  }, [state, hydrated]);
  const assessment = state.assessment;
  const ranked = useMemo(() => {
    const tags = assessment ? smokingModule.evidenceTags(assessment) : [];
    return [...evidence]
      .map((item) => ({
        item,
        score: item.applicabilityTags.reduce(
          (n, tag) => n + (tags.includes(tag) ? 2 : tag === "overall" ? 1 : 0),
          0,
        ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score || b.item.publicationYear - a.item.publicationYear,
      )
      .slice(0, 6)
      .map((x) => x.item);
  }, [evidence, assessment]);
  function loadPersona(name: string) {
    const persona = personas[name];
    if (!persona) return;
    setState({
      ...empty,
      synthetic: true,
      personaName: name,
      assessment: persona,
    });
    setView("evidence");
  }
  function startOwnReview() {
    setState({ ...empty, synthetic: false });
    setView("review");
  }
  function deleteData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The in-memory state is still cleared if browser storage is unavailable.
    }
    setState(empty);
    setView("landing");
  }
  const activePersonaName =
    state.personaName ??
    (state.synthetic ? findPersonaName(assessment) : undefined);
  if (!hydrated) return <Landing onStart={() => {}} onPersona={() => {}} />;
  if (view === "landing")
    return (
      <Landing
        onStart={startOwnReview}
        onPersona={loadPersona}
        activePersonaName={activePersonaName}
      />
    );
  return (
    <div className="app-shell">
      <PrototypeBanner />
      <TopBar
        view={view}
        setView={setView}
        hasAssessment={Boolean(assessment)}
        onDelete={deleteData}
      />
      {state.synthetic && assessment && (
        <DemoModeBar
          personaName={activePersonaName ?? "Fictional profile"}
          onChange={() => setView("landing")}
          onStartOwn={startOwnReview}
        />
      )}
      <main id="main-content" className="main-content">
        {view === "review" && (
          <Review
            initial={assessment ?? baseAssessment}
            onComplete={(value) => {
              setState((s) => ({
                ...s,
                synthetic: false,
                personaName: undefined,
                assessment: value,
              }));
              setView("evidence");
            }}
          />
        )}
        {view === "evidence" && assessment && (
          <EvidencePage
            key={JSON.stringify(assessment)}
            assessment={assessment}
            records={ranked}
            synthetic={state.synthetic}
            personaName={activePersonaName}
            onPlan={() => setView("plan")}
          />
        )}
        {view === "plan" && assessment && (
          <Plan
            assessment={assessment}
            goal={state.goal}
            onGoal={(goal) => setState((s) => ({ ...s, goal }))}
            onBack={() => setView("evidence")}
          />
        )}
        {view === "progress" && assessment && (
          <Progress
            assessment={assessment}
            goal={state.goal}
            checkIns={state.checkIns}
            onCheckIn={(c) =>
              setState((s) => ({ ...s, checkIns: [...s.checkIns, c] }))
            }
          />
        )}
        {view === "coach" && assessment && (
          <Coach assessment={assessment} records={ranked} />
        )}
        {view === "help" && (
          <Help onDelete={deleteData} showDeveloperLinks={showDeveloperLinks} />
        )}
        {!assessment && view !== "review" && (
          <EmptyReview onStart={() => setView("review")} />
        )}
      </main>
    </div>
  );
}

function PrototypeBanner() {
  return (
    <div className="prototype-banner">
      <ShieldCheck size={16} aria-hidden />
      This is a research prototype. It is not an MPFT clinical service. Nobody
      monitors what you enter.
    </div>
  );
}
function DemoModeBar({
  personaName,
  onChange,
  onStartOwn,
}: {
  personaName: string;
  onChange: () => void;
  onStartOwn: () => void;
}) {
  return (
    <aside className="demo-mode-bar" aria-label="Active fictional demo">
      <div>
        <span className="demo-mode-label">DEMO MODE</span>
        <strong>{personaName}</strong>
        <small>Fictional details — not your information</small>
      </div>
      <div className="demo-mode-actions">
        <button type="button" onClick={onChange}>
          Change demo
        </button>
        <button type="button" onClick={onStartOwn}>
          Start my own review
        </button>
      </div>
    </aside>
  );
}
function Landing({
  onStart,
  onPersona,
  activePersonaName,
}: {
  onStart: () => void;
  onPersona: (name: string) => void;
  activePersonaName?: string;
}) {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(
    activePersonaName ?? null,
  );
  const selectedAssessment = selectedPersona
    ? personas[selectedPersona]
    : undefined;
  return (
    <main id="main-content">
      <PrototypeBanner />
      {activePersonaName && (
        <div className="landing-demo-notice">
          <span>
            <strong>Demo currently active:</strong> {activePersonaName}
          </span>
          <button type="button" onClick={onStart}>
            End demo and start my own review
          </button>
        </div>
      )}
      <section className="hero">
        <div className="hero-copy">
          <div className="brand">
            <img
              src="/mpft-logo.png"
              alt="Midlands Partnership University NHS Foundation Trust"
            />
            <span className="prototype-name">
              Evidence Coach
              <small>Smoking research prototype</small>
            </span>
          </div>
          <p className="eyebrow">Understand your smoking</p>
          <h1>
            Understand the evidence.
            <br />
            Make a plan that works <em>for you.</em>
          </h1>
          <p className="lede">
            This guided review shows which population evidence may matter to
            you. It does not try to predict your exact future.
          </p>
          <div className="actions">
            <button className="primary large" onClick={onStart}>
              Start my smoking review <ArrowRight size={19} />
            </button>
            <a className="text-link" href="#capabilities">
              See what this tool does <ChevronDown size={17} />
            </a>
          </div>
          <div className="trust-row">
            <span>
              <LockKeyhole size={16} /> Demo data stays in this browser
            </span>
            <span>
              <BookOpen size={16} /> Sources shown with every claim
            </span>
          </div>
        </div>
        <div className="evidence-preview" aria-label="Example evidence card">
          <div className="preview-top">
            <span className="topic-icon">
              <Activity />
            </span>
            <span className="verified">
              <Check size={13} /> VERIFIED EVIDENCE
            </span>
          </div>
          <p className="preview-label">Relevant to your goals</p>
          <h2>Support makes a difference</h2>
          <p>
            Behavioural support can increase quit rates. The strongest evidence
            includes counselling.
          </p>
          <div className="certainty">
            <span>Evidence confidence</span>
            <strong>
              <i /> High
            </strong>
          </div>
          <div className="source">
            <BookOpen size={17} />
            <span>
              <small>Source</small>Cochrane systematic review, 2021
            </span>
          </div>
          <p className="precision">
            <Info size={16} /> This is population evidence. It is not a personal
            prediction.
          </p>
        </div>
      </section>
      <section className="capabilities" id="capabilities">
        <div>
          <p className="eyebrow">A guided programme, not a blank chatbot</p>
          <h2>From understanding to a next step</h2>
        </div>
        <div className="journey" aria-label="Programme steps">
          {[
            [
              ClipboardList,
              "1",
              "Review",
              "Your smoking, priorities and confidence",
            ],
            [BookOpen, "2", "Understand", "A plain-English evidence briefing"],
            [Target, "3", "Plan", "A goal you choose"],
            [BarChart3, "4", "Check in", "Progress without judgement"],
          ].map(([Icon, n, t, d]) => (
            <article key={String(t)}>
              <span className="step">{String(n)}</span>
              <Icon />
              <h3>{String(t)}</h3>
              <p>{String(d)}</p>
            </article>
          ))}
        </div>
        <div className="can-grid">
          <article className="can">
            <h3>
              <Check /> What it can do
            </h3>
            <ul>
              <li>Explain evidence in plain English</li>
              <li>Help identify your own reasons</li>
              <li>Support goals, cravings and setbacks</li>
              <li>Link to trusted NHS information</li>
            </ul>
          </article>
          <article className="cannot">
            <h3>
              <CircleAlert /> What it cannot do
            </h3>
            <ul>
              <li>Diagnose or assess symptoms</li>
              <li>Prescribe or select medicines</li>
              <li>Contact a clinician or monitor you</li>
              <li>Respond to an emergency</li>
            </ul>
          </article>
        </div>
        <div className="persona-section">
          <div>
            <span className="synthetic">PRESENTATION MODE</span>
            <h2>Try a fictional example</h2>
            <p>
              First choose a fictional profile to preview. Nothing opens until
              you confirm which demo you want to explore.
            </p>
          </div>
          <div className="persona-list">
            {Object.keys(personas).map((name, i) => (
              <button
                key={name}
                type="button"
                aria-pressed={selectedPersona === name}
                onClick={() => setSelectedPersona(name)}
              >
                <span className="persona-avatar">
                  {String.fromCharCode(65 + i)}
                </span>
                <strong>{name}</strong>
                <small>{personaSummaries[name]}</small>
                <span className="persona-select-state">
                  {selectedPersona === name ? <Check size={16} /> : "Preview"}
                </span>
              </button>
            ))}
          </div>
          {selectedPersona && selectedAssessment && (
            <div className="persona-preview" aria-live="polite">
              <div className="persona-preview-heading">
                <span>SELECTED FICTIONAL DEMO</span>
                <h3>{selectedPersona}</h3>
                <p>{personaSummaries[selectedPersona]}</p>
              </div>
              <dl>
                <div>
                  <dt>Age band</dt>
                  <dd>{selectedAssessment.ageBand}</dd>
                </div>
                <div>
                  <dt>Smoking</dt>
                  <dd>{selectedAssessment.cigarettesPerDay} a day</dd>
                </div>
                <div>
                  <dt>Aim</dt>
                  <dd>{selectedAssessment.intention}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{selectedAssessment.confidence} out of 10</dd>
                </div>
              </dl>
              <p className="persona-preview-explanation">
                The next screen will bring together reviewed evidence using
                this profile’s smoking pattern, goals and health areas.
              </p>
              <button
                className="primary"
                type="button"
                onClick={() => onPersona(selectedPersona)}
              >
                Open the {selectedPersona} demo <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function TopBar({
  view,
  setView,
  hasAssessment,
  onDelete,
}: {
  view: View;
  setView: (v: View) => void;
  hasAssessment: boolean;
  onDelete: () => void;
}) {
  const items: [View, string, typeof Target][] = [
    ["evidence", "Evidence", BookOpen],
    ["plan", "My plan", Target],
    ["progress", "Progress", BarChart3],
    ["coach", "Ask coach", MessageCircle],
    ["help", "Help & data", ShieldCheck],
  ];
  return (
    <>
      <header className="topbar">
        <button
          className="logo-button"
          aria-label="Go to home"
          onClick={() => setView("landing")}
        >
          <img src="/mpft-logo.png" alt="" />
          <span className="top-product">
            <strong>Evidence Coach</strong>
            <small>Research prototype</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() =>
                setView(hasAssessment || id === "help" ? id : "review")
              }
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <button
          className="delete-small"
          aria-label="Delete my demo data"
          onClick={onDelete}
          title="Delete my demo data"
        >
          <Trash2 size={17} />
          <span>Delete demo data</span>
        </button>
      </header>
    </>
  );
}

function Review({
  initial,
  onComplete,
}: {
  initial: Assessment;
  onComplete: (a: Assessment) => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof Assessment>(key: K, value: Assessment[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: "motivations" | "conditions", value: string) =>
    set(
      key,
      (form[key] as string[]).includes(value)
        ? (form[key] as string[]).filter((x) => x !== value)
        : ([...(form[key] as string[]), value] as never),
    );
  return (
    <section className="content narrow">
      <PageHead
        eyebrow="Your smoking review"
        title="A few structured questions"
        text="Use broad categories only. Please do not enter real names, contact details or clinical history."
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          onComplete(form);
        }}
      >
        <fieldset>
          <legend>About your smoking</legend>
          <div className="field-grid">
            <label>
              Age group
              <select
                value={form.ageBand}
                onChange={(e) =>
                  set("ageBand", e.target.value as Assessment["ageBand"])
                }
              >
                {[
                  ["18-29", "18 to 29"],
                  ["30-44", "30 to 44"],
                  ["45-59", "45 to 59"],
                  ["60-65", "60 to 65"],
                  ["66+", "66 or over"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cigarettes on a usual day
              <input
                type="number"
                min="0"
                max="100"
                value={form.cigarettesPerDay}
                onChange={(e) =>
                  set("cigarettesPerDay", Number(e.target.value))
                }
              />
            </label>
            <label>
              Approximate years smoked
              <input
                type="number"
                min="0"
                max="80"
                value={form.yearsSmoked}
                onChange={(e) => set("yearsSmoked", Number(e.target.value))}
              />
            </label>
            <label>
              First cigarette after waking
              <select
                value={form.firstCigarette}
                onChange={(e) =>
                  set(
                    "firstCigarette",
                    e.target.value as Assessment["firstCigarette"],
                  )
                }
              >
                <option value="within-5">Within 5 minutes</option>
                <option value="6-30">6 to 30 minutes</option>
                <option value="31-60">31 to 60 minutes</option>
                <option value="after-60">After 60 minutes</option>
              </select>
            </label>
            <label>
              Previous quit attempts
              <select
                value={form.previousAttempts}
                onChange={(e) =>
                  set(
                    "previousAttempts",
                    e.target.value as Assessment["previousAttempts"],
                  )
                }
              >
                <option value="none">None</option>
                <option value="1">One</option>
                <option value="2-3">Two or three</option>
                <option value="4+">Four or more</option>
              </select>
            </label>
            <label>
              Optional price for 20 cigarettes (£)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.packPrice ?? ""}
                onChange={(e) =>
                  set(
                    "packPrice",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>What matters most?</legend>
          <div className="chips">
            {[
              "health",
              "money",
              "family",
              "fitness",
              "breathing",
              "mental-wellbeing",
              "children",
              "appearance",
              "independence",
            ].map((x) => (
              <button
                type="button"
                aria-pressed={form.motivations.includes(x)}
                key={x}
                onClick={() => toggle("motivations", x)}
              >
                {x.replace("-", " ")}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Which evidence may be relevant?</legend>
          <p className="hint">
            These choices select information; they do not diagnose anything.
          </p>
          <div className="chips">
            {[
              ["diabetes", "Diabetes"],
              ["cardiovascular", "Heart or circulation condition"],
              ["copd", "COPD"],
              ["asthma", "Asthma"],
              ["hypertension", "High blood pressure"],
              ["mental-wellbeing", "Depression or anxiety"],
              ["none", "None of these"],
              ["prefer-not-to-say", "Prefer not to say"],
            ].map(([v, l]) => (
              <button
                type="button"
                aria-pressed={form.conditions.includes(v as never)}
                key={v}
                onClick={() => toggle("conditions", v)}
              >
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Your ratings</legend>
          <div className="range-grid">
            <label>
              How important is making a change?{" "}
              <strong>{form.importance}/10</strong>
              <input
                type="range"
                min="0"
                max="10"
                value={form.importance}
                onChange={(e) => set("importance", Number(e.target.value))}
              />
              <span>
                <i>Not important</i>
                <i>Very important</i>
              </span>
            </label>
            <label>
              How confident do you feel? <strong>{form.confidence}/10</strong>
              <input
                type="range"
                min="0"
                max="10"
                value={form.confidence}
                onChange={(e) => set("confidence", Number(e.target.value))}
              />
              <span>
                <i>Not confident</i>
                <i>Very confident</i>
              </span>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>What feels right now?</legend>
          <div className="choice-cards">
            {[
              ["quit", "I want to quit", "Build a stopping plan"],
              ["reduce", "I want to cut down first", "Take a planned step"],
              [
                "learn",
                "I’m not ready yet",
                "Understand options without pressure",
              ],
            ].map(([v, t, d]) => (
              <label key={v} className={form.intention === v ? "selected" : ""}>
                <input
                  type="radio"
                  name="intention"
                  checked={form.intention === v}
                  onChange={() =>
                    set("intention", v as Assessment["intention"])
                  }
                />
                <strong>{t}</strong>
                <span>{d}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="review-summary">
          <span>
            <Activity /> Estimated pack years{" "}
            <strong>
              {calculatePackYears(form.cigarettesPerDay, form.yearsSmoked)}
            </strong>
          </span>
          {calculateDailyCost(form.cigarettesPerDay, form.packPrice) !==
            undefined && (
            <span>
              <Coins /> Estimated daily spend{" "}
              <strong>
                £
                {calculateDailyCost(
                  form.cigarettesPerDay,
                  form.packPrice,
                )?.toFixed(2)}
              </strong>
            </span>
          )}
          <small>
            These estimates use the numbers you entered. They are not risk
            predictions.
          </small>
        </div>
        <button className="primary large" type="submit">
          Create my evidence briefing <ArrowRight size={18} />
        </button>
      </form>
    </section>
  );
}

function EvidencePage({
  assessment,
  records,
  synthetic,
  personaName,
  onPlan,
}: {
  assessment: Assessment;
  records: EvidenceRecord[];
  synthetic: boolean;
  personaName?: string;
  onPlan: () => void;
}) {
  const [brief, setBrief] = useState<EvidenceBrief | null>(null);
  const [briefStatus, setBriefStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const selected = [...assessment.motivations, ...assessment.conditions]
    .filter((x) => x !== "none" && x !== "prefer-not-to-say")
    .map(displayTag);
  const rankingTags = smokingModule.evidenceTags(assessment);
  const evidenceIds = useMemo(() => records.map((item) => item.id), [records]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/evidence-summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ evidenceIds, context: assessment }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as EvidenceBrief;
        if (!response.ok || data.kind === "error") throw new Error();
        setBrief(data);
        setBriefStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBriefStatus("error");
      });
    return () => controller.abort();
  }, [assessment, evidenceIds]);

  function openReference(id: string) {
    const reference = document.getElementById(
      `reference-${id}`,
    ) as HTMLDetailsElement | null;
    if (!reference) return;
    reference.open = true;
    reference.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const profileFactors = [
    `Age ${assessment.ageBand}`,
    `${assessment.cigarettesPerDay} cigarettes a day`,
    `${assessment.yearsSmoked} years smoking`,
    ...assessment.conditions
      .filter((item) => item !== "none" && item !== "prefer-not-to-say")
      .map(displayTag),
    assessment.intention === "quit"
      ? "Wants to quit"
      : assessment.intention === "reduce"
        ? "Wants to cut down"
        : "Exploring options",
  ];
  return (
    <section className="content">
      <PageHead
        eyebrow={synthetic ? "Fictional demo evidence" : "Your evidence review"}
        title={
          synthetic
            ? `${personaName ?? "Fictional profile"} demo`
            : "Your evidence briefing"
        }
        text={
          synthetic
            ? "See how reviewed research is explained for the fictional profile below."
            : "A plain-English summary of the most relevant reviewed research, based on the broad details you entered."
        }
      />
      {synthetic && (
        <div className="demo-profile-card">
          <div>
            <span>FICTIONAL PROFILE</span>
            <strong>{personaName ?? "Fictional profile"}</strong>
            <p>
              {personaName
                ? personaSummaries[personaName]
                : "A fictional set of details used only to demonstrate the tool."}
            </p>
          </div>
          <dl>
            <div>
              <dt>Smoking</dt>
              <dd>{assessment.cigarettesPerDay} cigarettes a day</dd>
            </div>
            <div>
              <dt>Aim</dt>
              <dd>{assessment.intention}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{assessment.confidence}/10</dd>
            </div>
          </dl>
        </div>
      )}
      <div className="profile-factors" aria-label="Details used for this briefing">
        <strong>Based on:</strong>
        {profileFactors.map((factor) => (
          <span key={factor}>{factor}</span>
        ))}
      </div>

      <section className="evidence-brief" aria-live="polite">
        {briefStatus === "loading" && (
          <div className="brief-loading">
            <span className="brief-icon">
              <Sparkles />
            </span>
            <div>
              <p className="eyebrow">Preparing your evidence briefing</p>
              <h2>Bringing the important findings together…</h2>
              <p>
                We are checking the selected research against the broad details
                above.
              </p>
            </div>
          </div>
        )}
        {briefStatus === "error" && (
          <div className="brief-error">
            <CircleAlert />
            <div>
              <strong>The summary is temporarily unavailable</strong>
              <p>
                You can still open the reviewed evidence selected for you below.
              </p>
            </div>
          </div>
        )}
        {briefStatus === "ready" && brief?.headline && (
          <>
            <div className="brief-heading">
              <span className="brief-icon">
                <Sparkles />
              </span>
              <div>
                <p className="eyebrow">
                  {brief.generatedBy === "ai"
                    ? "AI summary of reviewed evidence"
                    : "Plain-English summary of reviewed evidence"}
                </p>
                <h2>{brief.headline}</h2>
                <p>{brief.overview}</p>
              </div>
            </div>
            <div className="brief-points">
              {brief.key_points?.map((point, index) => (
                <article key={`${point.title}-${index}`}>
                  <span className="point-number">{index + 1}</span>
                  <div>
                    <div className="point-heading">
                      <h3>{point.title}</h3>
                      <strong className={`certainty-${point.certainty}`}>
                        <i /> {point.certainty} certainty
                      </strong>
                    </div>
                    <p>{point.explanation}</p>
                    <p className="why-it-matters">
                      <strong>Why this may matter to you:</strong>{" "}
                      {point.why_it_matters}
                    </p>
                    <EvidenceCitations
                      ids={point.evidence_ids}
                      records={records}
                      onOpen={openReference}
                    />
                  </div>
                </article>
              ))}
            </div>
            {brief.context_notes && brief.context_notes.length > 0 && (
              <div className="context-section">
                <div>
                  <p className="eyebrow">Your situation</p>
                  <h3>How your details affect what we selected</h3>
                </div>
                <div className="context-notes">
                  {brief.context_notes.map((note, index) => (
                    <article key={`${note.factor}-${index}`}>
                      <strong>{note.factor}</strong>
                      <p>{note.explanation}</p>
                      <EvidenceCitations
                        ids={note.evidence_ids}
                        records={records}
                        onOpen={openReference}
                      />
                    </article>
                  ))}
                </div>
              </div>
            )}
            <div className="uncertainty-box">
              <Info />
              <div>
                <h3>What the research cannot tell you exactly</h3>
                <ul>
                  {brief.important_uncertainties?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>

      <EvidenceQuestion
        assessment={assessment}
        records={records}
        suggestions={brief?.follow_up_suggestions ?? []}
        onOpenReference={openReference}
      />

      <div className="evidence-library-heading">
        <div>
          <p className="eyebrow">Selected sources</p>
          <h2>Explore the evidence behind your summary</h2>
          <p>
            {selected.length
              ? `We matched sources to ${selected.join(", ")}, your smoking pattern and your goal.`
              : "We matched general stop-smoking research to your smoking pattern and goal."}
            {" "}Open any source to see its findings, limits and full reference.
          </p>
        </div>
      </div>
      <div className="evidence-reference-list">
        {records.map((item, i) => (
          <EvidenceReference
            key={item.id}
            item={item}
            number={i + 1}
            matchingTags={item.applicabilityTags.filter((tag) =>
              rankingTags.includes(tag),
            )}
          />
        ))}
      </div>
      <div className="next-panel">
        <div>
          <p className="eyebrow">Evidence into action</p>
          <h2>What would you like to do with this?</h2>
          <p>A goal is an invitation, not a judgement.</p>
        </div>
        <button className="primary" onClick={onPlan}>
          Choose a next step <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function EvidenceCitations({
  ids,
  records,
  onOpen,
}: {
  ids: string[];
  records: EvidenceRecord[];
  onOpen: (id: string) => void;
}) {
  return (
    <span className="evidence-citations" aria-label="Supporting evidence">
      Evidence{" "}
      {ids.map((id) => {
        const number = records.findIndex((record) => record.id === id) + 1;
        return number > 0 ? (
          <button
            type="button"
            key={id}
            onClick={() => onOpen(id)}
            aria-label={`Open evidence source ${number}`}
          >
            [{number}]
          </button>
        ) : null;
      })}
    </span>
  );
}

function EvidenceReference({
  item,
  number,
  matchingTags = [],
}: {
  item: EvidenceRecord;
  number: number;
  matchingTags?: string[];
}) {
  return (
    <details className="evidence-reference" id={`reference-${item.id}`}>
      <summary>
        <span className="reference-number">{number}</span>
        <span className="reference-summary">
          <small>
            {item.organisation}, {item.publicationYear}
          </small>
          <strong>{item.patientFriendlySummary}</strong>
          {matchingTags.length > 0 && (
            <span>Selected for: {matchingTags.map(displayTag).join(", ")}</span>
          )}
        </span>
        <span className="reference-certainty">
          <i className={`certainty-${item.evidenceConfidence}`} />
          {item.evidenceConfidence}
        </span>
        <ChevronDown className="reference-chevron" size={20} />
      </summary>
      <div className="reference-body">
        <div className="reference-plain-language">
          <h3>What the study found</h3>
          <p>{item.mainFinding}</p>
          {item.absoluteEffect && (
            <div className="number-box">
              <strong>{item.absoluteEffect.split("(")[0]}</strong>
              <span>
                {item.comparator
                  ? `Compared with ${item.comparator.toLowerCase()}`
                  : "In the studied population"}
              </span>
            </div>
          )}
        </div>
        <div className="reference-study-details">
          <h3>Who and what was studied</h3>
          {item.effectValue && (
            <dl>
              <div>
                <dt>Effect measure</dt>
                <dd>
                  {item.effectMeasure}: {item.effectValue}{" "}
                  {item.confidenceInterval && `(${item.confidenceInterval})`}
                </dd>
              </div>
              <div>
                <dt>Population</dt>
                <dd>
                  {item.population}
                  {item.sampleSize && `. ${item.sampleSize}`}
                </dd>
              </div>
              <div>
                <dt>Timeframe</dt>
                <dd>{item.timeframe}</dd>
              </div>
            </dl>
          )}
          <h3>Important limits</h3>
          <ul>
            {item.limitations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="reference-footer">
        <p>
          <Info size={15} /> This source helps explain outcomes in groups. It
          cannot predict exactly what will happen to you.
        </p>
        <a href={item.url} target="_blank" rel="noreferrer">
          Read the full source <ExternalLink size={15} />
        </a>
      </div>
    </details>
  );
}

function EvidenceQuestion({
  assessment,
  records,
  suggestions,
  onOpenReference,
}: {
  assessment: Assessment;
  records: EvidenceRecord[];
  suggestions: string[];
  onOpenReference: (id: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<CoachReply | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setReply(null);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          evidenceIds: records.map((item) => item.id),
          context: assessment,
        }),
      });
      setReply((await response.json()) as CoachReply);
    } catch {
      setReply({
        kind: "error",
        message: "The evidence coach is temporarily unavailable.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="evidence-question">
      <div>
        <p className="eyebrow">Ask about your briefing</p>
        <h2>What would you like explained?</h2>
        <p>
          Ask a follow-up in your own words. Answers use only the selected
          reviewed evidence.
        </p>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="evidence-question">Your question</label>
        <div>
          <input
            id="evidence-question"
            maxLength={800}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="For example, what matters most for someone like me?"
          />
          <button className="primary" disabled={busy}>
            {busy ? "Checking the evidence…" : "Ask a follow-up"}
          </button>
        </div>
        <small>Do not enter names, contact details or new medical details.</small>
      </form>
      {suggestions.length > 0 && (
        <div className="evidence-question-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => setMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {reply && (
        <div className={`evidence-answer ${reply.kind}`} aria-live="polite">
          <span className="brief-icon">
            <Sparkles />
          </span>
          <div>
            {reply.summary && <h3>{reply.summary}</h3>}
            {reply.why_relevant && <p>{reply.why_relevant}</p>}
            {reply.claims?.map((claim, index) => (
              <div key={index} className="answer-claim">
                <p>{claim.text}</p>
                <EvidenceCitations
                  ids={claim.evidence_ids}
                  records={records}
                  onOpen={onOpenReference}
                />
              </div>
            ))}
            {reply.limitations && reply.limitations.length > 0 && (
              <ul>
                {reply.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {reply.coaching_question && (
              <p className="answer-next-question">{reply.coaching_question}</p>
            )}
            {reply.message && <p>{reply.message}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function Plan({
  assessment,
  goal,
  onGoal,
  onBack,
}: {
  assessment: Assessment;
  goal?: Goal;
  onGoal: (g: Goal | undefined) => void;
  onBack: () => void;
}) {
  const [selectedKind, setSelectedKind] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(!goal);
  const options = smokingModule.goals.filter((x) =>
    x.intentions.includes(assessment.intention),
  );
  const selected = smokingModule.goals.find((x) => x.kind === selectedKind);

  if (selected) {
    return (
      <GoalSetup
        option={selected}
        existing={goal?.kind === selected.kind ? goal : undefined}
        onBack={() => setSelectedKind(null)}
        onSave={(nextGoal) => {
          onGoal(nextGoal);
          setSelectedKind(null);
          setChoosing(false);
        }}
      />
    );
  }

  return (
    <section className="content narrow">
      <button
        type="button"
        className="back-link"
        onClick={choosing && goal ? () => setChoosing(false) : onBack}
      >
        <ArrowLeft size={17} /> {choosing && goal ? "Back to my plan" : "Back to evidence"}
      </button>
      <PageHead
        eyebrow="Your plan"
        title={goal && !choosing ? "Your chosen next step" : "Choose a next step"}
        text="You decide what is realistic. You can change it at any time."
      />
      {goal && !choosing ? (
        <div className="goal-active">
          <span>
            <Target />
          </span>
          <div>
            <small>
              {goal.completed ? "COMPLETED DEMO GOAL" : "ACTIVE DEMO GOAL"}
            </small>
            <h2>{goal.title}</h2>
            <p>{goal.detail}</p>
            <GoalDetails goal={goal} />
            <div className="goal-actions">
              <button
                type="button"
                className="primary"
                onClick={() => onGoal({ ...goal, completed: !goal.completed })}
              >
                {goal.completed ? (
                  <>
                    <RotateCcw size={16} /> Mark as active
                  </>
                ) : (
                  <>
                    <Check size={16} /> Mark complete
                  </>
                )}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setSelectedKind(goal.kind)}
              >
                Edit this plan
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setChoosing(true)}
              >
                Choose a different step
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="goal-list">
          {options.map((x) => (
            <button
              type="button"
              key={x.kind}
              onClick={() => setSelectedKind(x.kind)}
            >
              <span>
                <Target size={19} />
              </span>
              <div>
                <strong>{x.title}</strong>
                <small>{x.detail}</small>
              </div>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      )}
      <div className="support-note">
        <HeartHandshake />
        <div>
          <strong>Support can sit alongside your plan</strong>
          <p>
            A pharmacist, GP or stop-smoking adviser can discuss general options
            in light of your health and medicines. This prototype cannot select
            treatment for you.
          </p>
        </div>
      </div>
    </section>
  );
}

type GoalOption = (typeof smokingModule.goals)[number];
type GoalPlan = NonNullable<Goal["plan"]>;

function GoalSetup({
  option,
  existing,
  onBack,
  onSave,
}: {
  option: GoalOption;
  existing?: Goal;
  onBack: () => void;
  onSave: (goal: Goal) => void;
}) {
  const [plan, setPlan] = useState<GoalPlan>(existing?.plan ?? {});
  const set = (key: keyof GoalPlan, value: string) =>
    setPlan((current) => ({ ...current, [key]: value }));
  const isComplete =
    option.kind === "quit-date"
      ? Boolean(plan.targetDate)
      : option.kind === "craving-plan"
        ? Boolean(plan.trigger?.trim() && plan.response?.trim())
        : option.kind === "delay-first"
          ? Boolean(plan.delayUntil)
          : option.kind === "smoke-free-space"
            ? Boolean(plan.smokeFreeSituation?.trim())
            : option.kind === "support"
              ? Boolean(plan.supportRoute)
              : Boolean(plan.learningFocus);

  return (
    <section className="content narrow">
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Back to goal choices
      </button>
      <PageHead
        eyebrow="Set up your next step"
        title={option.title}
        text={option.detail}
      />
      <form
        className="form-card goal-setup"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isComplete) return;
          onSave({
            id: existing?.id ?? crypto.randomUUID(),
            kind: option.kind,
            title: option.title,
            detail: option.detail,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
            completed: existing?.completed ?? false,
            plan,
          });
        }}
      >
        <fieldset>
          <legend>Make the step specific</legend>
          {option.kind === "quit-date" && (
            <div className="field-grid">
              <label>
                My quit date
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={plan.targetDate ?? ""}
                  onChange={(event) => set("targetDate", event.target.value)}
                />
              </label>
              <label>
                Support I want around that date (optional)
                <input
                  maxLength={200}
                  value={plan.supportPlan ?? ""}
                  placeholder="For example, speak to a pharmacist"
                  onChange={(event) => set("supportPlan", event.target.value)}
                />
              </label>
            </div>
          )}
          {option.kind === "craving-plan" && (
            <div className="field-grid">
              <label>
                A situation that triggers me to smoke
                <input
                  required
                  maxLength={100}
                  value={plan.trigger ?? ""}
                  placeholder="For example, after dinner"
                  onChange={(event) => set("trigger", event.target.value)}
                />
              </label>
              <label>
                What I will try instead
                <input
                  required
                  maxLength={200}
                  value={plan.response ?? ""}
                  placeholder="For example, take a five-minute walk"
                  onChange={(event) => set("response", event.target.value)}
                />
              </label>
            </div>
          )}
          {option.kind === "delay-first" && (
            <label>
              I will wait until
              <input
                type="time"
                required
                value={plan.delayUntil ?? ""}
                onChange={(event) => set("delayUntil", event.target.value)}
              />
            </label>
          )}
          {option.kind === "smoke-free-space" && (
            <label>
              The place or routine I will make smoke-free
              <input
                required
                maxLength={150}
                value={plan.smokeFreeSituation ?? ""}
                placeholder="For example, in the car"
                onChange={(event) =>
                  set("smokeFreeSituation", event.target.value)
                }
              />
            </label>
          )}
          {option.kind === "support" && (
            <label>
              Who I will contact first
              <select
                required
                value={plan.supportRoute ?? ""}
                onChange={(event) => set("supportRoute", event.target.value)}
              >
                <option value="">Choose an option</option>
                <option>Local NHS stop smoking service</option>
                <option>Pharmacist</option>
                <option>GP practice</option>
                <option>NHS quit smoking information</option>
              </select>
            </label>
          )}
          {option.kind === "learn-options" && (
            <label>
              What I want to understand first
              <select
                required
                value={plan.learningFocus ?? ""}
                onChange={(event) => set("learningFocus", event.target.value)}
              >
                <option value="">Choose a topic</option>
                <option>Nicotine replacement options</option>
                <option>Stop-smoking medicines</option>
                <option>Behavioural support</option>
                <option>Quitting in one go or cutting down</option>
              </select>
            </label>
          )}
        </fieldset>
        <p className="goal-privacy-note">
          Keep this general. Do not enter names, contact details or medical
          information.
        </p>
        <div className="goal-form-actions">
          <button type="submit" className="primary" disabled={!isComplete}>
            {existing ? "Save changes" : "Save and activate this step"}
            <ArrowRight size={17} />
          </button>
          <button type="button" className="secondary" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function GoalDetails({ goal }: { goal: Goal }) {
  const plan = goal.plan;
  if (!plan) return null;
  const rows: [string, string | undefined][] = [
    ["Quit date", plan.targetDate],
    ["Support around that date", plan.supportPlan],
    ["My trigger", plan.trigger],
    ["What I will try", plan.response],
    ["Wait until", plan.delayUntil],
    ["Smoke-free place or routine", plan.smokeFreeSituation],
    ["Contact first", plan.supportRoute],
    ["Learn about", plan.learningFocus],
  ];
  const visible = rows.filter((row): row is [string, string] => Boolean(row[1]));
  if (visible.length === 0) return null;
  return (
    <dl className="goal-details">
      {visible.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Progress({
  assessment,
  goal,
  checkIns,
  onCheckIn,
}: {
  assessment: Assessment;
  goal?: Goal;
  checkIns: CheckIn[];
  onCheckIn: (c: CheckIn) => void;
}) {
  const [open, setOpen] = useState(checkIns.length === 0);
  const [cigs, setCigs] = useState(assessment.cigarettesPerDay);
  const [craving, setCraving] = useState(5);
  const [confidence, setConfidence] = useState(assessment.confidence);
  const [trigger, setTrigger] = useState("routine");
  const progress = calculateProgress(
    assessment.cigarettesPerDay,
    checkIns,
    assessment.packPrice,
  );
  const max = Math.max(
    assessment.cigarettesPerDay,
    ...checkIns.map((x) => x.cigarettes),
    1,
  );
  return (
    <section className="content">
      <PageHead
        eyebrow="Progress"
        title="Notice patterns, not perfection"
        text="A lapse does not erase progress. Missing days simply mean that no check-in was recorded. We do not treat them as smoking or as abstinence."
      />
      <div className="stats">
        <article>
          <small>CHECK-INS</small>
          <strong>{checkIns.length}</strong>
          <span>stored locally</span>
        </article>
        <article>
          <small>EST. CIGARETTES AVOIDED</small>
          <strong>{progress.avoided}</strong>
          <span>against your starting number</span>
        </article>
        <article>
          <small>EST. MONEY NOT SPENT</small>
          <strong>
            {progress.money === undefined
              ? "Not available"
              : `£${progress.money.toFixed(2)}`}
          </strong>
          <span>based on your pack price</span>
        </article>
        <article>
          <small>GOAL</small>
          <strong className="small-stat">
            {goal?.completed ? "Completed" : goal ? "In progress" : "Not set"}
          </strong>
          <span>{goal?.title ?? "Choose one in My plan"}</span>
        </article>
      </div>
      {checkIns.length > 0 && (
        <div className="chart-card">
          <h2>Cigarettes per check-in</h2>
          <div
            className="bars"
            role="img"
            aria-label={checkIns
              .map((x) => `${x.date}: ${x.cigarettes} cigarettes`)
              .join("; ")}
          >
            {checkIns.map((x) => (
              <div key={x.id}>
                <span
                  style={{
                    height: `${Math.max(4, (x.cigarettes / max) * 100)}%`,
                  }}
                />
                <strong>{x.cigarettes}</strong>
                <small>
                  {new Date(x.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </small>
              </div>
            ))}
          </div>
          <table>
            <caption>Accessible progress data</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cigarettes</th>
                <th>Craving</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.map((x) => (
                <tr key={x.id}>
                  <td>{new Date(x.date).toLocaleDateString("en-GB")}</td>
                  <td>{x.cigarettes}</td>
                  <td>{x.craving}/10</td>
                  <td>{x.confidence}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="primary" onClick={() => setOpen(!open)}>
        {open ? "Close check-in" : "Add today’s check-in"}
      </button>
      {open && (
        <form
          className="checkin"
          onSubmit={(e) => {
            e.preventDefault();
            onCheckIn({
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              cigarettes: cigs,
              craving,
              confidence,
              goalAttempted: Boolean(goal),
              trigger,
              win: "",
            });
            setOpen(false);
          }}
        >
          <h2>How did today go?</h2>
          <div className="field-grid">
            <label>
              Cigarettes today
              <input
                type="number"
                min="0"
                max="100"
                value={cigs}
                onChange={(e) => setCigs(Number(e.target.value))}
              />
            </label>
            <label>
              Biggest trigger
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
              >
                <option>routine</option>
                <option>craving</option>
                <option>stress</option>
                <option>social situation</option>
                <option>alcohol</option>
                <option>other / not sure</option>
              </select>
            </label>
          </div>
          <div className="range-grid">
            <label>
              Craving <strong>{craving}/10</strong>
              <input
                type="range"
                min="0"
                max="10"
                value={craving}
                onChange={(e) => setCraving(Number(e.target.value))}
              />
            </label>
            <label>
              Confidence <strong>{confidence}/10</strong>
              <input
                type="range"
                min="0"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
              />
            </label>
          </div>
          {cigs > assessment.cigarettesPerDay && (
            <p className="lapse">
              <HeartHandshake /> One day does not erase your progress. Looking
              at the trigger can help you plan the next response.
            </p>
          )}
          <button className="primary" type="submit">
            Save locally
          </button>
        </form>
      )}
    </section>
  );
}

function Coach({
  assessment,
  records,
}: {
  assessment: Assessment;
  records: EvidenceRecord[];
}) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<CoachReply | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setReply(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          evidenceIds: records.map((x) => x.id),
          context: assessment,
        }),
      });
      setReply((await res.json()) as CoachReply);
    } catch {
      setReply({
        kind: "error",
        message:
          "The coach is unavailable. Your guided programme and evidence cards still work.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="content narrow">
      <PageHead
        eyebrow="Optional conversation"
        title="Ask your smoking coach"
        text="An automated, scoped coach for motivation and planning. It retrieves only eligible evidence from this prototype, never the live web."
      />
      <div className="coach-boundaries">
        <div>
          <Check />
          <span>
            <strong>I can help with</strong> motivation, cravings, plans,
            setbacks and general evidence
          </span>
        </div>
        <div>
          <CircleAlert />
          <span>
            <strong>I cannot help with</strong> symptoms, diagnosis,
            emergencies, prescribing or personal medicine choice
          </span>
        </div>
      </div>
      <div className="coach-thread" aria-live="polite">
        {reply && (
          <div className={`reply ${reply.kind}`}>
            <span className="coach-avatar">
              <Sparkles />
            </span>
            <div>
              {reply.summary && (
                <>
                  <h2>{reply.summary}</h2>
                  <p>{reply.why_relevant}</p>
                  {reply.claims?.map((c, i) => (
                    <p key={i}>
                      {c.text} <small>[{c.evidence_ids.join(", ")}]</small>
                    </p>
                  ))}
                  {reply.limitations && reply.limitations.length > 0 && (
                    <ul>
                      {reply.limitations.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  )}
                  <p className="question">{reply.coaching_question}</p>
                </>
              )}
              {reply.message && <p>{reply.message}</p>}
              {reply.citations && reply.citations.length > 0 && (
                <div className="mini-citations">
                  {reply.citations.map((c) => (
                    <a key={c.id} href={c.url} target="_blank" rel="noreferrer">
                      {c.organisation}, {c.publicationYear}{" "}
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <form className="coach-form" onSubmit={submit}>
        <label htmlFor="coach-message">Your question or thought</label>
        <textarea
          id="coach-message"
          maxLength={800}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="For example: I keep smoking when work gets stressful. What could I plan?"
        />
        <div>
          <small>
            Please do not enter names, contact details or real clinical history.
          </small>
          <button className="primary" disabled={busy}>
            {busy ? "Preparing a grounded reply…" : "Ask the coach"}
          </button>
        </div>
      </form>
      <div className="prompt-suggestions">
        {[
          "Help me plan for a craving",
          "I had one cigarette. Have I failed?",
          "Why might support help?",
        ].map((x) => (
          <button key={x} onClick={() => setMessage(x)}>
            {x}
          </button>
        ))}
      </div>
    </section>
  );
}

function Help({
  onDelete,
  showDeveloperLinks,
}: {
  onDelete: () => void;
  showDeveloperLinks: boolean;
}) {
  return (
    <section className="content narrow">
      <PageHead
        eyebrow="Help, safety & data"
        title="Know the boundaries"
        text="This prototype is not monitored and cannot contact anyone for you."
      />
      <div className="urgent">
        <CircleAlert />
        <div>
          <h2>Need urgent help?</h2>
          <p>
            If someone is seriously ill or in immediate danger, call{" "}
            <strong>999</strong>. For urgent medical advice that is not an
            emergency, use <strong>NHS 111</strong>. This tool cannot assess
            symptoms.
          </p>
        </div>
      </div>
      <div className="help-grid">
        <article>
          <LockKeyhole />
          <h2>Your demo data</h2>
          <p>
            Your structured review, goals and check-ins are stored in this
            browser’s local storage. Evidence is application data. If the
            optional AI coach is configured, your message plus a small
            structured context is sent from the server to OpenAI with{" "}
            <code>store: false</code>. This setting is not a full zero data
            retention guarantee.
          </p>
          <button className="danger" onClick={onDelete}>
            <Trash2 size={17} /> Delete my demo data
          </button>
        </article>
        <article>
          <ShieldCheck />
          <h2>Prototype status</h2>
          <p>
            Research and development prototype only. Not an MPFT clinical
            service, not endorsed clinical software, not a diagnosis tool and
            not a replacement for a clinician, pharmacist or stop smoking
            adviser.
          </p>
        </article>
      </div>
      <h2>Trusted routes</h2>
      <div className="resource-list">
        {smokingModule.resources.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
            <span>
              <strong>{r.title}</strong>
              <small>{r.description}</small>
            </span>
            <ExternalLink />
          </a>
        ))}
      </div>
      {showDeveloperLinks && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="secondary inline" href="/admin/evidence">
            Evidence dashboard <ArrowRight size={16} />
          </a>
          <a className="secondary inline" href="/admin/telemetry">
            Development telemetry <ArrowRight size={16} />
          </a>
        </div>
      )}
    </section>
  );
}
function EmptyReview({ onStart }: { onStart: () => void }) {
  return (
    <section className="content narrow">
      <div className="empty">
        <ClipboardList />
        <h1>Complete your smoking review first</h1>
        <p>
          The programme uses structured answers to select evidence, then
          explains the combined findings in plain English.
        </p>
        <button className="primary" onClick={onStart}>
          Start review
        </button>
      </div>
    </section>
  );
}
function PageHead({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <header className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <span>
        Research tool created by Dr Theo Jackson and the Public Health Team at
        MPFT.
      </span>
      <span>
        Research prototype only. Not monitored. Not a clinical service.
      </span>
    </footer>
  );
}
