import apiClient from "../../../services/apiClient";
import { Medicine } from "../types";

const BASE_URL = "/medicines";

export const medicineService = {
  /**
   * Fetches all medicine records from the API.
   * @returns A promise that resolves to an array of Medicine objects.
   */
  async getAll(): Promise<Medicine[]> {
    const response = await apiClient.get<Medicine[]>(BASE_URL);
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
