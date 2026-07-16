export interface CurrentServingPrescription {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  issuedAt: string;
  waitingTime?: string;
}

export interface UpNextPrescription {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  issuedAt: string;
}

export type MedicineStatus = "NOT_STARTED" | "STARTED" | "READY_TO_DISPENSE";

export interface DispensingMedicine {
  id: string;
  medicineName: string;
  strength: string;
  dose: string;
  frequency: string;
  quantity: number;
  currentStock: number;
  status: MedicineStatus;
}

export interface PreparationState {
  prescriptionId: string;
  medicineStatuses: Record<string, MedicineStatus>;
}

export interface PrescriptionMedicineDto {
  id: string;
  medicineName: string;
  strength: string;
  dose: string;
  frequency: string;
  quantity: number;
  currentStock: number;
}
