import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><p className="eyebrow">Account recovery</p><h1>Request a password reset</h1><p>We use the same response whether or not an account exists. In local email mode, the message is written to the test mail folder.</p><ForgotPasswordForm /></section></main><SiteFooter /></>;
}
