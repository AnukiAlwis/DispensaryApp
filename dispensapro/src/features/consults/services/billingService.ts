import apiClient from "../../../services/apiClient";
import {
  Bill,
  BillRequestDto,
  BillCalculateResponseDto,
  BillDiscountsRequestDto,
} from "../types";

const BASE_URL = "/bills";

export const billingService = {
  create: async (data: BillRequestDto): Promise<Bill> => {
    const response = await apiClient.post<string>(BASE_URL, data);
    return { id: response.data } as Bill;
  },

  getById: async (id: string): Promise<Bill> => {
    const response = await apiClient.get<Bill>(`${BASE_URL}/${id}`);
    return response.data;
  },

  calculate: async (billId: string): Promise<BillCalculateResponseDto> => {
    const response = await apiClient.post<BillCalculateResponseDto>(
      `${BASE_URL}/${billId}/calculate`
    );
    return response.data;
  },

  updateDiscounts: async (
    billId: string,
    discounts: BillDiscountsRequestDto
  ): Promise<Bill> => {
    const response = await apiClient.put<Bill>(
      `${BASE_URL}/${billId}/discounts`,
      discounts
    );
    return response.data;
  },

  getByPrescriptionId: async (prescriptionId: string): Promise<Bill> => {
    const response = await apiClient.get<Bill>(BASE_URL, { params: { prescriptionId } });
    return response.data;
  },

  updateStatus: async (billId: string, status: "DUE" | "PAID" | "VOID"): Promise<Bill> => {
    const response = await apiClient.put<Bill>(`${BASE_URL}/${billId}/status`, { status });
    return response.data;
  },
};
