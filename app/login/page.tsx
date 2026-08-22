import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><p className="eyebrow">Standalone research account</p><h1>Sign in</h1><p>Use the email address or alias you chose when your account was created. Staff also need the six-digit code from their authenticator.</p><LoginForm showSyntheticCredentials={process.env.NODE_ENV !== "production"} /><p className="auth-card__footer">Have a fictional invitation code? <Link href="/register">Create your alias and password</Link></p></section></main><SiteFooter /></>;
}
