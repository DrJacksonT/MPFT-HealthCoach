export type RightsRequestType = "data_copy" | "restriction" | "deletion" | "withdrawal";

export function rightsProcessingPlan(requestType: RightsRequestType, synthetic: boolean) {
  if (!synthetic) return { executable: false, reason: "live_identity_verification_and_approved_retention_decision_required", actions: [] as string[] };
  if (requestType === "restriction") return { executable: true, reason: null, actions: ["close_new_research_entries", "revoke_sessions", "retain_audit"] };
  if (requestType === "deletion") return { executable: true, reason: null, actions: ["delete_contact_identity", "disable_account", "delete_expired_raw_coach_text", "restrict_research_record", "retain_audit", "record_research_retention_pending"] };
  return { executable: false, reason: requestType === "data_copy" ? "use_deidentified_data_copy_generation" : "withdrawal_is_processed_in_the_participant_route", actions: [] as string[] };
}
