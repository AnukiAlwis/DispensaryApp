import apiClient from "../../../services/apiClient";
import { Distributor } from "../types";

const BASE_URL = "/distributors";

export const distributorService = {
  async getAll(): Promise<Distributor[]> {
    const response = await apiClient.get<Distributor[]>(BASE_URL);
    return response.data;
  },

  async create(distributorData: Omit<Distributor, "id">) {
    const response = await apiClient.post(BASE_URL, distributorData);
    return response.data;
  },
};
