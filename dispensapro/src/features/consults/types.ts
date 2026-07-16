import { Queue } from "../Queues/types";
import { Visit } from "../visits/types";
import { Medicine } from "../pharmacy/types";

export interface PrescriptionItem {
  id?: string;
  prescriptionId: string;
  medicineId: string;
  medicine?: Medicine;
  medicineName?: string;
  medicineStrength?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  qtyPrescribed: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionItemFormValues {
  medicineId: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: number;
  instructions: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  status: "ACTIVE" | "ISSUED" | "DISPENSED" | "CANCELLED";
  items?: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionRequestDto {
  visitId: string;
  patientId: string;
}

export interface PrescriptionItemRequestDto {
  medicineId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  qtyPrescribed: number;
}

export interface BillLineItem {
  medicineId: string;
  medicineName: string;
  strength: string;
  dose: string;
  frequency: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  visitId: string;
  patientId: string;
  doctorFee: number;
  doctorDiscountPct: number | null;
  doctorFeeFinal: number;
  medicineTotal: number;
  pharmacyDiscountPct: number | null;
  medicineTotalFinal: number;
  grandTotal: number;
  status: "DUE" | "PAID" | "VOID";
  createdAt: string;
  updatedAt: string;
  lineItems: BillLineItem[];
}

export interface BillRequestDto {
  visitId: string;
  patientId: string;
}

export interface BillCalculateResponseDto {
  id: string;
  doctorFee: number;
  medicineTotal: number;
  grandTotal: number;
  totalAmount?: number;
}

export interface BillDiscountsRequestDto {
  doctorDiscountPct: number;
  pharmacyDiscountPct: number;
}

export interface ConsultationState {
  status: "idle" | "initiating" | "active" | "finalizing" | "completed";
  currentQueue?: Queue;
  currentVisit?: Visit;
  currentPrescription?: Prescription;
  currentBill?: Bill;
  prescriptionItems: PrescriptionItem[];
  visitHistory: Visit[];
  clinicalNotes: string;
  error?: string;
  cascadeStep?: number;
}

export interface InitiationCascadeResult {
  queue: Queue;
  visits: Visit[];
  prescription: Prescription;
  bill: Bill;
}

export interface FinalizationCascadeResult {
  success: boolean;
  queueId: string;
}
