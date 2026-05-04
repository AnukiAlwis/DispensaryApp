import apiClient from "../../../services/apiClient";
import { Visit, VisitRequestDto, VisitResponseDto } from "../types";

export const visitService = {
  /**
   * Get all visits for a specific patient
   * @param patientId The visit details of the mentioned patientId is requested.
   * @returns A promise resolving to the created Visit.
   */
  getAllByPatientId: async (patientId: string): Promise<Visit[]> => {
    const res = await apiClient.get(`/visits`, {
      params: { patientId },
    });
    return res.data;
  },

  /**
   * Creates a new visit entry by calling the backend API.
   * @param data The visit details including patientId and doctorId.
   * @returns A promise resolving to the created VisitResponseDto.
   */
  create: async (data: VisitRequestDto): Promise<VisitResponseDto> => {
    const res = await apiClient.post("/visits", data);
    return res.data;
  },

  
};