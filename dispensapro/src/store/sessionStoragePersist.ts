export interface ConsultationSessionState {
  status: "idle" | "active";
  queueId: string | null;
  patientId: string | null;
  visitId: string | null;
  prescriptionId: string | null;
  billId: string | null;
  startedAt: string | null;
  clinicalNotes: string;
  doctorDiscountPct: number;
  pharmacyDiscountPct: number;
}

export const loadPersistedSession = (): ConsultationSessionState | undefined => {
  try {
    const stored = sessionStorage.getItem("consultationSession");
    if (!stored) {
      return undefined;
    }
    return JSON.parse(stored) as ConsultationSessionState;
  } catch (error) {
    return undefined;
  }
};

export const savePersistedSession = (state: ConsultationSessionState): void => {
  try {
    sessionStorage.setItem("consultationSession", JSON.stringify(state));
  } catch (error) {
    // Ignore quota errors
  }
};
