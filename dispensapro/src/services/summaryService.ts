import apiClient from "./apiClient";

export interface DailySummary {
  patientsWaiting: number;
  patientsServed: number;
  totalIncome: number;
  totalCharity: number;
}

export const summaryService = {
  getTodaySummary: async (): Promise<DailySummary> => {
    const res = await apiClient.get("/summary/today");
    return res.data;
  },
};
