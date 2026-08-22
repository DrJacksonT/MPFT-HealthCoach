import type { Metadata } from "next";
import { MfaForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Staff second factor" };

export default function MfaPage() {
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><p className="eyebrow">Staff access</p><h1>Enter your second factor</h1><p>Open the authenticator linked when your staff account was created and enter its current six-digit code.</p><MfaForm /></section></main><SiteFooter /></>;
}
