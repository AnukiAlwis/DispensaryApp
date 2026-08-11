import apiClient from "../../../services/apiClient";
import { Medicine } from "../types";

const BASE_URL = "/medicines";

export interface MedicineFilterOptions {
  stockStatus?: string;
}

export const medicineService = {
  /**
   * Fetches all medicine records from the API.
   * @param options Optional filter options including stockStatus
   * @returns A promise that resolves to an array of Medicine objects.
   */
  async getAll(options?: MedicineFilterOptions): Promise<Medicine[]> {
    const params = options?.stockStatus ? { stockStatus: options.stockStatus } : {};
    const response = await apiClient.get<Medicine[]>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Creates a new medicine record.
   * @param medicineData The medicine data excluding the ID.
   * @returns A promise that resolves when the creation is complete.
   */
  async create(medicineData: Omit<Medicine, "id">) {
    const response = await apiClient.post(BASE_URL, medicineData);
    return response.data;
  },
};
