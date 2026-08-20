import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "AI operations",
  robots: { index: false, follow: false },
};

export default function LegacyTelemetryAdmin() {
  redirect("/staff/ai");
}
