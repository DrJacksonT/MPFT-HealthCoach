import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Evidence Coach: smoking prototype",
    template: "%s | Evidence Coach",
  },
  description:
    "A guided smoking review with clear evidence and practical coaching.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Evidence you can use",
    description:
      "Personalised smoking evidence with source-bound risks, benefits and clear limits.",
    images: [{ url: "/og.png", width: 1728, height: 910 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evidence you can use",
    description:
      "Personalised smoking evidence with source-bound risks, benefits and clear limits.",
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
