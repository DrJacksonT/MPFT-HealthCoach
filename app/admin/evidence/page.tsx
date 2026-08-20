import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Evidence administration",
  robots: { index: false, follow: false },
};

export default function LegacyEvidenceAdmin() {
  redirect("/staff/evidence");
}
