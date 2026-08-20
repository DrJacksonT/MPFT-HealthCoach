import type { Metadata } from "next";
import { TokenActionForm } from "@/src/ui/auth/AuthForms";
import { SiteFooter, SiteHeader } from "@/src/ui/site/SiteHeader";

export const metadata: Metadata = { title: "Verify account" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <><SiteHeader compact /><main id="main-content" className="auth-shell"><section className="auth-card"><h1>Verify your test account</h1>{!token && <div className="error-summary" role="alert">The verification token is missing.</div>}<TokenActionForm mode="verify" token={token} /></section></main><SiteFooter /></>;
}
