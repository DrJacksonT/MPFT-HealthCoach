import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Evidence Coach: smoking prototype",
    template: "%s | Evidence Coach",
  },
  description:
    "Review smoking evidence and choose practical next steps.",
  icons: {
    icon: [{ url: "/favicon.svg?v=2", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg?v=2"],
  },
  openGraph: {
    title: "Evidence you can use",
    description:
      "Personalised smoking evidence with referenced sources, benefits, risks and clear limits.",
    images: [{ url: "/og.png", width: 1728, height: 910 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evidence you can use",
    description:
      "Personalised smoking evidence with referenced sources, benefits, risks and clear limits.",
    images: ["/og.png"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
