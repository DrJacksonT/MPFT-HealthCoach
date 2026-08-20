import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><p className="eyebrow">Standalone research account</p><h1>Sign in</h1><p>Use an invited email address or account alias. Staff need a second factor after their password.</p><LoginForm showSyntheticCredentials={process.env.NODE_ENV !== "production"} /><p className="auth-card__footer">Have a fictional invitation? <Link href="/register">Create an account</Link></p></section></main><SiteFooter /></>;
}
