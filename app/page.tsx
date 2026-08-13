import type { Metadata } from "next";
import { getEligibleEvidence } from "@/src/data/evidence";
import { CoachApp } from "@/src/ui/CoachApp";

export const metadata: Metadata = {
  title: "Evidence Coach: smoking prototype",
  description:
    "Review smoking evidence and choose practical next steps.",
};

export default function Home() {
  const showDeveloperLinks =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_DEV_ADMIN === "true";
  return (
    <CoachApp
      evidence={getEligibleEvidence()}
      showDeveloperLinks={showDeveloperLinks}
    />
  );
}
