export interface VisitResponseDto {
    id: string;
    patientId: string;
    doctorId: string;
    status: string;
    createdAt: string;
}

export interface VisitRequestDto {
  patientId: string;
  doctorId: string;
  visitTime: string | null;
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED'; 
}


export interface VisitPayload {
  patientId: string;
  doctorId: string;
}


export interface VisitNote {
  id: string;
  note: string;
  recordedById: string;
  recordedByUsername: string;
  recordedByRole: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  visitTime: string;
  status: string;
  doctorFee: number;
  createdAt: string;
  updatedAt?: string | null;
  createdById: string;
  notes?: VisitNote[];
}