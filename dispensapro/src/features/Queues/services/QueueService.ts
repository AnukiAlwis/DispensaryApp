import apiClient from "../../../services/apiClient";
import { Queue } from "../types";

export const queueService = {
  create: async (data: {
    patientId: string;
    doctorId: string;
    remarks?: string;
  }): Promise<Queue> => {
    const res = await apiClient.post("/queue", data);
    return res.data;
  },

  getAll: async (doctorId?: string): Promise<Queue[]> => {
    const url = doctorId ? `/queue?doctorId=${doctorId}` : "/queue";
    const res = await apiClient.get(url);
    return res.data;
  },

  getById: async (id: string): Promise<Queue> => {
    const res = await apiClient.get(`/queue/${id}`);
    return res.data;
  },

  start: async (queueId: string): Promise<Queue> => {
    const res = await apiClient.patch(`/queue/${queueId}/start`);
    return res.data;
  },

  serve: async (queueId: string): Promise<Queue> => {
    const res = await apiClient.patch(`/queue/${queueId}/serve`);
    return res.data;
  },

//   // Update queue (e.g., change status)
//   update: async (id: string, updates: Partial<Queue>): Promise<Queue> => {
//     const res = await apiClient.put(`/queue/${id}`, updates);
//     return res.data;
//   },

//   // Delete queue entry (if allowed)
//   delete: async (id: string): Promise<void> => {
//     await apiClient.delete(`/queue/${id}`);
//   },
};
