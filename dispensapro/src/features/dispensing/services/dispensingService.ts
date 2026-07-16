import apiClient from "../../../services/apiClient";
import {
  CurrentServingPrescription,
  UpNextPrescription,
  DispensingMedicine,
  PrescriptionMedicineDto,
} from "../types";

const BASE_URL = "/prescriptions";

export const dispensingService = {
  getCurrentServing: async (): Promise<CurrentServingPrescription | null> => {
    try {
      const response = await apiClient.get<CurrentServingPrescription>(
        `${BASE_URL}/current-serving`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getUpNext: async (): Promise<UpNextPrescription[]> => {
    const response = await apiClient.get<UpNextPrescription[]>(
      `${BASE_URL}/up-next`
    );
    return response.data;
  },

  getPrescriptionMedicines: async (
    prescriptionId: string
  ): Promise<DispensingMedicine[]> => {
    const response = await apiClient.get<PrescriptionMedicineDto[]>(
      `${BASE_URL}/${prescriptionId}/medicines`
    );
    return response.data.map((dto) => ({
      ...dto,
      status: "NOT_STARTED" as const,
    }));
  },

  updatePrescriptionStatus: async (
    prescriptionId: string,
    status: "ISSUED" | "DISPENSED" | "CANCELLED"
  ): Promise<void> => {
    await apiClient.put(`${BASE_URL}/${prescriptionId}/status`, { status });
  },
};
