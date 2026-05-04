import apiClient from "../../../services/apiClient";
import { Queue } from "../types";

export const queueService = {
  // Create a new queue entry
  create: async (data: {
    patientId: string;
    doctorId: string;
    remarks?: string;
  }): Promise<Queue> => {
    const res = await apiClient.post("/queue", data);
    return res.data;
  },

//   // Get all queues (optional filters can be added later)
//   getAll: async (): Promise<Queue[]> => {
//     const res = await apiClient.get("/queue");
//     return res.data;
//   },

//   // Get queue by ID
//   getById: async (id: string): Promise<Queue> => {
//     const res = await apiClient.get(`/queue/${id}`);
//     return res.data;
//   },

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
