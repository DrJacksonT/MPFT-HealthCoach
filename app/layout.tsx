import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN ?? "http://localhost:3000"),
  title: {
    default: "MPFT Behaviour Change Research",
    template: "%s | MPFT Behaviour Change Research",
  },
  description:
    "A standalone research test platform for supported behaviour change.",
  icons: {
    icon: [{ url: "/favicon.svg?v=2", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg?v=2"],
  },
  openGraph: {
    title: "MPFT Behaviour Change Research",
    description:
      "A standalone research test platform for supported behaviour change.",
    images: [{ url: "/og.png", width: 1728, height: 910 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MPFT Behaviour Change Research",
    description:
      "A standalone research test platform for supported behaviour change.",
    images: ["/og.png"],
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
