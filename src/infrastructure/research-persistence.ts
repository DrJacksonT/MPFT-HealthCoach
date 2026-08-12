import type { DemoState } from "@/src/domain/types";
export interface ResearchParticipantRepository {
  saveParticipantState(state: DemoState): Promise<void>;
}
export class DisabledResearchParticipantRepository implements ResearchParticipantRepository {
  async saveParticipantState(state: DemoState): Promise<void> {
    void state;
    throw new Error(
      "Research-dataset export is disabled. The separate, user-consented pseudonymous account store must not be reused as a research export without NHS information-governance, research classification, clinical-safety and security approval.",
    );
  }
}
export const REMOTE_PARTICIPANT_STORAGE_ENABLED = false as const;
