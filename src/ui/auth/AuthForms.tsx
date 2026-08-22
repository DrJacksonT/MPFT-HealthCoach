"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormStatus = { kind: "idle" | "busy" | "error" | "success"; message?: string };

async function post(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, data: (await response.json().catch(() => ({}))) as Record<string, unknown> };
}

export function LoginForm({ showSyntheticCredentials }: { showSyntheticCredentials: boolean }) {
  const router = useRouter();
  const [identityKind, setIdentityKind] = useState<"email" | "alias">("alias");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "busy" });
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const { response, data } = await post("/api/auth/login", {
      identityKind,
      identity: form.get("identity"),
      password: form.get("password"),
    });
    if (!response.ok) {
      setStatus({ kind: "error", message: String(data.message ?? "Sign-in failed. Check the details and try again.") });
      return;
    }
    router.push(data.mfaRequired ? "/mfa" : "/participant");
    router.refresh();
  }
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {status.kind === "error" && <div className="error-summary" role="alert"><strong>There is a problem</strong><p>{status.message}</p></div>}
      <fieldset className="segmented-field"><legend>How do you sign in?</legend><label><input type="radio" name="identityKind" value="alias" checked={identityKind === "alias"} onChange={() => setIdentityKind("alias")} />Alias</label><label><input type="radio" name="identityKind" value="email" checked={identityKind === "email"} onChange={() => setIdentityKind("email")} />Email</label></fieldset>
      <label className="field"><span>{identityKind === "alias" ? "Account alias" : "Email address"}</span><input name="identity" type={identityKind === "email" ? "email" : "text"} autoComplete="username" required /></label>
      <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="button button--full" disabled={status.kind === "busy"}>{status.kind === "busy" ? "Signing in…" : "Sign in"}</button>
      <p><Link href="/forgot-password">Forgot your password?</Link></p>
      {showSyntheticCredentials && <div className="test-credentials"><strong>Local fictional participant</strong><code>rowan-fictional-01</code><code>Fictional-only-2026!</code><p>These credentials are seeded only for local synthetic QA and must never be used in production.</p></div>}
    </form>
  );
}

export function RegisterForm({ emailEnabled = true }: { emailEnabled?: boolean }) {
  const [identityKind, setIdentityKind] = useState<"email" | "alias">("alias");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "busy" });
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (form.get("password") !== form.get("confirmPassword")) {
      setStatus({ kind: "error", message: "The passwords do not match." });
      return;
    }
    const { response, data } = await post("/api/auth/register", {
      invitationCode: form.get("invitationCode"), identityKind,
      identity: form.get("identity"), displayName: form.get("displayName"), password: form.get("password"),
    });
    if (!response.ok) {
      setStatus({ kind: "error", message: String(data.message ?? "Registration could not be completed.") });
      return;
    }
    setStatus({ kind: "success", message: data.verificationRequired ? "Check the local mail sink for a one-time verification link." : "Your fictional account is ready. You can sign in now." });
    formElement.reset();
  }
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {status.kind === "error" && <div className="error-summary" role="alert"><strong>There is a problem</strong><p>{status.message}</p></div>}
      {status.kind === "success" && <div className="success-summary" role="status"><strong>Account created</strong><p>{status.message}</p><Link href="/login">Go to sign in</Link></div>}
      <label className="field"><span>Invitation code</span><span className="hint">Use the code supplied by the project owner. You will choose your own sign-in alias and password below.</span><input name="invitationCode" autoComplete="off" required /></label>
      <fieldset className="segmented-field"><legend>Account identity</legend><label><input type="radio" name="identityKind" checked={identityKind === "alias"} onChange={() => setIdentityKind("alias")} />Alias</label>{emailEnabled && <label><input type="radio" name="identityKind" checked={identityKind === "email"} onChange={() => setIdentityKind("email")} />Email</label>}</fieldset>
      {!emailEnabled && <p className="hint">Email registration is disabled until an approved delivery provider and domain are configured.</p>}
      <label className="field"><span>{identityKind === "alias" ? "Choose an alias" : "Email address"}</span><input name="identity" type={identityKind === "email" ? "email" : "text"} autoComplete="username" required /></label>
      <label className="field"><span>Display name</span><span className="hint">Use a fictional name for this technical test.</span><input name="displayName" autoComplete="nickname" maxLength={80} required /></label>
      <label className="field"><span>Password</span><span className="hint">At least 12 characters. A longer passphrase is easier to remember.</span><input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
      <label className="field"><span>Confirm password</span><input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
      <button className="button button--full" disabled={status.kind === "busy"}>{status.kind === "busy" ? "Creating account…" : "Create fictional test account"}</button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus({ kind: "busy" });
    const form = new FormData(event.currentTarget);
    const { data } = await post("/api/auth/forgot-password", { identityKind: form.get("identityKind"), identity: form.get("identity") });
    setStatus({ kind: "success", message: String(data.message ?? "If that account can be reset, instructions have been created.") });
  }
  return <form className="auth-form" onSubmit={submit}>{status.kind === "success" && <div className="success-summary" role="status"><p>{status.message}</p></div>}<label className="field"><span>Account type</span><select name="identityKind"><option value="email">Email</option><option value="alias">Alias</option></select></label><label className="field"><span>Email address or alias</span><input name="identity" autoComplete="username" required /></label><button className="button button--full" disabled={status.kind === "busy"}>Request reset</button></form>;
}

export function TokenActionForm({ mode, token }: { mode: "verify" | "reset"; token: string }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus({ kind: "busy" });
    const form = new FormData(event.currentTarget);
    const body = mode === "verify" ? { token } : { token, password: form.get("password") };
    const { response, data } = await post(mode === "verify" ? "/api/auth/verify" : "/api/auth/reset-password", body);
    setStatus(response.ok ? { kind: "success", message: mode === "verify" ? "Your account is verified." : "Your password has been changed. Other sessions were signed out." } : { kind: "error", message: String(data.message ?? "The link is invalid or has expired.") });
  }
  return <form className="auth-form" onSubmit={submit}>{status.kind === "error" && <div className="error-summary" role="alert"><p>{status.message}</p></div>}{status.kind === "success" && <div className="success-summary" role="status"><p>{status.message}</p><Link href="/login">Go to sign in</Link></div>}{mode === "reset" && <label className="field"><span>New password</span><input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>}<button className="button button--full" disabled={!token || status.kind === "busy"}>{mode === "verify" ? "Verify account" : "Change password"}</button></form>;
}

export function MfaForm() {
  const router = useRouter(); const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus({ kind: "busy" });
    const form = new FormData(event.currentTarget);
    const csrf = document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "";
    const response = await fetch("/api/auth/mfa", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": decodeURIComponent(csrf) }, body: JSON.stringify({ token: form.get("token") }) });
    if (!response.ok) { setStatus({ kind: "error", message: "The code was not accepted. Try a current six-digit code." }); return; }
    router.push("/staff"); router.refresh();
  }
  return <form className="auth-form" onSubmit={submit}>{status.kind === "error" && <div className="error-summary" role="alert"><p>{status.message}</p></div>}<label className="field"><span>Six-digit authenticator code</span><input name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></label><button className="button button--full">Verify and continue</button></form>;
}
