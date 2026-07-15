import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadPersistedSession, ConsultationSessionState } from "./sessionStoragePersist";

const defaultConsultationSessionState: ConsultationSessionState = {
  status: "idle",
  queueId: null,
  patientId: null,
  visitId: null,
  prescriptionId: null,
  billId: null,
  startedAt: null,
  clinicalNotes: "",
  doctorDiscountPct: 0,
  pharmacyDiscountPct: 0,
};

const consultationSlice = createSlice({
  name: "consultationSession",
  initialState: loadPersistedSession() ?? defaultConsultationSessionState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{
        queueId: string;
        patientId: string;
        visitId: string;
        prescriptionId: string;
        billId: string;
        startedAt: string;
      }>
    ) => {
      state.status = "active";
      state.queueId = action.payload.queueId;
      state.patientId = action.payload.patientId;
      state.visitId = action.payload.visitId;
      state.prescriptionId = action.payload.prescriptionId;
      state.billId = action.payload.billId;
      state.startedAt = action.payload.startedAt;
      state.clinicalNotes = "";
      state.doctorDiscountPct = 0;
      state.pharmacyDiscountPct = 0;
    },
    setClinicalNotes: (state, action: PayloadAction<string>) => {
      state.clinicalNotes = action.payload;
    },
    setDiscounts: (
      state,
      action: PayloadAction<{
        doctorDiscountPct: number;
        pharmacyDiscountPct: number;
      }>
    ) => {
      state.doctorDiscountPct = action.payload.doctorDiscountPct;
      state.pharmacyDiscountPct = action.payload.pharmacyDiscountPct;
    },
    clearSession: (state) => {
      return defaultConsultationSessionState;
    },
  },
});

export const { startSession, setClinicalNotes, setDiscounts, clearSession } =
  consultationSlice.actions;

export default consultationSlice.reducer;
