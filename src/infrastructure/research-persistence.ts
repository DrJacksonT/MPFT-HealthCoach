import type { DemoState } from "@/src/domain/types";
export interface ResearchParticipantRepository {
  saveParticipantState(state: DemoState): Promise<void>;
}
export class DisabledResearchParticipantRepository implements ResearchParticipantRepository {
  async saveParticipantState(state: DemoState): Promise<void> {
    void state;
    throw new Error(
      "Remote participant persistence is disabled. NHS information-governance, research classification, clinical-safety and security approval are required before an adapter may be implemented or enabled.",
    );
  }
}
export const REMOTE_PARTICIPANT_STORAGE_ENABLED = false as const;
