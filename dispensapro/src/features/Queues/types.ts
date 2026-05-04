export interface Queue {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  status: "BOOKED" | "WAITING" | "SHOW" | "CALLED" | "SERVED" | "NO_SHOW";
  queueNumber: number;
  queueDate: string;
  createdAt: string;
  checkedInAt?: string | null;
  inProgressAt?: string | null;
  servedAt?: string | null;
  remarks?: string;
}
