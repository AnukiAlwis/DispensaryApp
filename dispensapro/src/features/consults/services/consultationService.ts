import apiClient from "../../../services/apiClient";

const BASE_URL = "/queue";

export const consultationService = {
  getQueueByDoctorId: async (doctorId: string) => {
    const response = await apiClient.get(`${BASE_URL}?doctorId=${doctorId}`);
    return response.data;
  },

  startConsultation: async (queueId: string) => {
    const response = await apiClient.patch(`${BASE_URL}/${queueId}/start`);
    return response.data;
  },

  serveQueue: async (queueId: string) => {
    const response = await apiClient.patch(`${BASE_URL}/${queueId}/serve`);
    return response.data;
  },
};
