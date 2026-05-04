import { useState, useEffect } from "react";
import { doctorService } from "../services/DoctorService";
import { UserResponseDto } from "../types";

interface UseDoctorsResult {
  doctors: UserResponseDto[];
  loading: boolean;
  error: Error | null;
  fetchDoctors: () => Promise<void>;
}

export const useDoctors = (): UseDoctorsResult => {
  const [doctors, setDoctors] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
    } catch (err: any) {
      console.error("Failed to fetch doctors:", err);
      setError(err);
      setDoctors([]); 
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchDoctors();
  }, []); 

  return { doctors, loading, error, fetchDoctors };
};