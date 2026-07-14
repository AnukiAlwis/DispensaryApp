export interface Queue {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  status:
    | "BOOKED"
    | "CHECKED_IN_WAITING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "SERVED"
    | "NO_SHOW"
    | "REMOVED";
  queueNumber: number;
  queueDate: string;
  createdAt: string;
  checkedInAt?: string | null;
  inProgressAt?: string | null;
  servedAt?: string | null;
  remarks?: string;
}
