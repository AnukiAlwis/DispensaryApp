import { useEffect, useState } from "react";
import { patientService } from "../services/patientService";
import { Patient } from "../types";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);


  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } finally {
      setLoading(false);
    }
  };

    // Fetch a single patient by ID
  const fetchPatientById = async (id: string) => {
    setLoading(true);
    try {
      const res = await patientService.getById(id);
      setSelectedPatient(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient: Omit<Patient, "id">) => {
    return await patientService.create(patient);
  };

  const editPatient = async (id: string, updates: Partial<Patient>) => {
    return await patientService.update(id, updates);
  };

  const deletePatient = async (id: string) => {
    await patientService.delete(id);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    selectedPatient,
    loading,
    fetchPatients,
    fetchPatientById,
    addPatient,
    editPatient,
    deletePatient,
  };
}
