// Legacy role type - kept for reference, now using string arrays
export type UserRole =
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ADMIN";

export type QueueStatus =
  | "BOOKED"
  | "CHECKED_IN_WAITING"
  | "IN_PROGRESS"
  | "SERVED"
  | "NO_SHOW"
  | "REMOVED";

// Permission codes - must match backend Permissions constants
export type Permission =
  | "PATIENT_VIEW"
  | "PATIENT_EDIT"
  | "PATIENT_DELETE"
  | "CONSULT_VIEW"
  | "CONSULT_CREATE"
  | "CONSULT_EDIT"
  | "PRESCRIPTION_DISPENSE"
  | "PRESCRIPTION_VIEW"
  | "PHARMACY_MANAGE"
  | "PHARMACY_VIEW"
  | "QUEUE_MANAGE"
  | "QUEUE_VIEW"
  | "VISIT_VIEW"
  | "VISIT_EDIT"
  | "USER_MANAGE"
  | "USER_VIEW"
  | "ROLE_MANAGE"
  | "BILL_VIEW"
  | "BILL_MANAGE"
  | "DISCOUNTS_ADD";
