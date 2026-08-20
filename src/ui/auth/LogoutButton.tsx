"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    const csrf = document.cookie.split("; ").find((part) => part.startsWith("mpft_csrf="))?.split("=").slice(1).join("=") ?? "";
    await fetch("/api/auth/logout", { method: "POST", headers: { "x-csrf-token": decodeURIComponent(csrf) } });
    router.push("/");
    router.refresh();
  }
  return <button type="button" className="plain-button" onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>;
}
