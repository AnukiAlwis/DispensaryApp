import { useState } from 'react';
import { visitService } from '../services/visitService';
import { VisitPayload, VisitResponseDto } from '../types';

type CreateVisitFunction = (payload: VisitPayload) => Promise<void>;

interface UseCreateVisitResult {
  isCreating: boolean;
  error: Error | null;
  createVisit: CreateVisitFunction;
}


//
// ---------------------------
// Hook 1: useCreateVisit
// ---------------------------

export const useCreateVisit = (): UseCreateVisitResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [visits, setVisits] = useState<VisitResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const createVisit: CreateVisitFunction = async ({ patientId, doctorId }) => {
    setIsCreating(true);
    setError(null);

    const dataToSend = {
      patientId,
      doctorId,
      visitTime: new Date().toISOString(),
      status: 'OPEN' as const,
    };

    try {
      await visitService.create(dataToSend);
    } catch (err: any) {
      console.error("Visit creation failed:", err);
      setError(err);
    } finally {
      setIsCreating(false);
    }
  };


  return { isCreating, error, createVisit };
};


//
// ---------------------------
// Hook 2: useGetVisitsByPatientId
// ---------------------------

interface UseGetVisitsByPatientIdResult {
  visits: VisitResponseDto[];
  loading: boolean;
  error: Error | null;
  fetchVisits: (patientId: string) => Promise<void>;
}

export const useGetVisitsByPatientId = (): UseGetVisitsByPatientIdResult => {
  const [visits, setVisits] = useState<VisitResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVisits = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.getAllByPatientId(patientId);
      setVisits(response);
    } catch (err: any) {
      console.error('Failed to fetch visits:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { visits, loading, error, fetchVisits };
};