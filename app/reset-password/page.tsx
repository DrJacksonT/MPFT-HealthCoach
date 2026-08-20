import type { Metadata } from "next";
import { TokenActionForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><h1>Choose a new password</h1>{!token && <div className="error-summary" role="alert">The reset token is missing.</div>}<TokenActionForm mode="reset" token={token} /></section></main><SiteFooter /></>;
}
