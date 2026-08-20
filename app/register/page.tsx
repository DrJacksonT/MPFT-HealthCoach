import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Create a fictional account" };

export default function RegisterPage() {
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card auth-card--wide"><p className="eyebrow">Invitation only</p><h1>Create a fictional test account</h1><p>Do not enter real personal, health or contact information. Email messages go only to the configured local mail sink.</p><RegisterForm /><p className="auth-card__footer">Already registered? <Link href="/login">Sign in</Link></p></section></main><SiteFooter /></>;
}
