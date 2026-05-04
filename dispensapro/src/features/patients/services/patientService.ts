import apiClient from "../../../services/apiClient";
import { Patient } from "../types";

export const patientService = {
  getAll: async (search: string = ""): Promise<Patient[]> => {
    const res = await apiClient.get(`/patients`, {
      params: { search },
    });
    return res.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data;
  },

  create: async (data: Omit<Patient, "id">): Promise<Patient> => {
    const res = await apiClient.post("/patients", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const res = await apiClient.put(`/patients/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },
};
