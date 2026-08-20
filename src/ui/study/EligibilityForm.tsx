"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function EligibilityForm() {
  const [result, setResult] = useState<"none" | "eligible" | "ineligible" | "urgent">("none");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("urgent") === "yes") setResult("urgent");
    else if (["age", "smokes", "consent"].every((name) => form.get(name) === "yes")) setResult("eligible");
    else setResult("ineligible");
  }
  return (
    <form className="eligibility-form" onSubmit={submit}>
      <div className="notice notice--warning"><strong>Draft technical criteria.</strong> This result cannot confirm eligibility for a real study.</div>
      <YesNo name="age" legend="Are you aged 18 or over?" />
      <YesNo name="smokes" legend="Do you currently smoke tobacco?" />
      <YesNo name="consent" legend="Can you understand the draft study information and make your own choice about taking part?" />
      <YesNo name="urgent" legend="Do you need urgent medical help right now?" />
      <button className="button" type="submit">Check the fictional route</button>
      {result === "eligible" && <div className="success-summary" role="status"><h2>The fictional route can continue</h2><p>This is not real eligibility confirmation. You still need a synthetic invitation code.</p><Link className="button button--small" href="/register">Create a fictional account</Link></div>}
      {result === "ineligible" && <div className="notice" role="status"><h2>This fictional route does not continue</h2><p>That does not say anything about ordinary stop-smoking support. Speak to a GP, pharmacist or local stop-smoking service about options.</p></div>}
      {result === "urgent" && <div className="notice notice--urgent" role="alert"><h2>Use urgent help instead</h2><p>Call 999 if someone is in immediate danger. Otherwise use NHS 111 online or call 111. This site is not monitored.</p></div>}
    </form>
  );
}

function YesNo({ name, legend }: { name: string; legend: string }) {
  return <fieldset className="question"><legend>{legend}</legend><label><input type="radio" name={name} value="yes" required />Yes</label><label><input type="radio" name={name} value="no" required />No</label></fieldset>;
}
