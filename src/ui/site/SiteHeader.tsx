import Image from "next/image";
import Link from "next/link";

export function StatusBanner() {
  return (
    <div className="study-status" role="status">
      <strong>Research test:</strong> fictional data and staff simulation only. Real recruitment is closed.
    </div>
  );
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <StatusBanner />
      <header className={`site-header${compact ? " site-header--compact" : ""}`}>
        <Link href="/" className="site-brand" aria-label="MPFT Behaviour Change Research home">
          <Image src="/mpft-logo.png" alt="Midlands Partnership University NHS Foundation Trust" width={220} height={72} priority />
          <span>Behaviour Change Research</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/study">About this study</Link>
          <Link href="/help">Help and support</Link>
          <Link className="button button--small button--outline" href="/login">Sign in</Link>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>MPFT Behaviour Change Research</strong>
        <p>This site is not an emergency, diagnostic or monitored clinical service.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/study#privacy">Privacy summary</Link>
        <Link href="/study#accessibility">Accessibility</Link>
        <Link href="/help">Urgent and practical support</Link>
      </nav>
    </footer>
  );
}
