import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Create a fictional account" };

export default function RegisterPage() {
  const emailEnabled = process.env.MAIL_TRANSPORT !== "disabled";
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card auth-card--wide"><p className="eyebrow">Invitation only</p><h1>Create a fictional test account</h1><p>Do not enter real personal, health or contact information. This environment accepts the lower-PII alias route only unless email delivery is explicitly configured.</p><RegisterForm emailEnabled={emailEnabled} /><p className="auth-card__footer">Already registered? <Link href="/login">Sign in</Link></p></section></main><SiteFooter /></>;
}
