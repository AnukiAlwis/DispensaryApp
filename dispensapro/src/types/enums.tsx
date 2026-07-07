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
