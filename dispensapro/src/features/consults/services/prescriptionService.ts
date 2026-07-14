import apiClient from "../../../services/apiClient";
import {
  Prescription,
  PrescriptionRequestDto,
  PrescriptionItemRequestDto,
  PrescriptionItem,
} from "../types";

const BASE_URL = "/prescriptions";

export const prescriptionService = {
  create: async (data: PrescriptionRequestDto): Promise<Prescription> => {
    const response = await apiClient.post<string>(BASE_URL, data);
    return {
      id: response.data,
      visitId: data.visitId,
      patientId: data.patientId,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Prescription;
  },

  getById: async (id: string): Promise<Prescription> => {
    const response = await apiClient.get<Prescription>(`${BASE_URL}/${id}`);
    return response.data;
  },

  addItem: async (
    prescriptionId: string,
    item: PrescriptionItemRequestDto
  ): Promise<PrescriptionItem> => {
    const response = await apiClient.post<string>(
      `${BASE_URL}/${prescriptionId}/items`,
      item
    );
    return { id: response.data } as PrescriptionItem;
  },

  getItems: async (prescriptionId: string): Promise<PrescriptionItem[]> => {
    const response = await apiClient.get<PrescriptionItem[]>(
      `${BASE_URL}/${prescriptionId}/items`
    );
    return response.data;
  },

  updateStatus: async (
    prescriptionId: string,
    status: string
  ): Promise<Prescription> => {
    const response = await apiClient.put<Prescription>(
      `${BASE_URL}/${prescriptionId}/status`,
      { status }
    );
    return response.data;
  },
};
