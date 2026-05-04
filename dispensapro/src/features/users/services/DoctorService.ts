import { UserResponseDto } from "../types";
import { UserRole } from "../../../types/enums";
import apiClient from "../../../services/apiClient";

export const doctorService = {
  /**
   * Fetches a list of users, optionally filtered by one or more roles.
   * @param roles A list of roles to filter by (e.g., [UserRole.DOCTOR, UserRole.STAFF])
   * @returns A promise resolving to an array of UserResponseDto.
   */
  getAllUsersByRoles: async (roles: UserRole[]): Promise<UserResponseDto[]> => {
    const params = roles.map((role) => `roles=${role}`).join("&");
    const url = `/users${params ? "?" + params : ""}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  getDoctors: async (): Promise<UserResponseDto[]> => {
    return doctorService.getAllUsersByRoles(["DOCTOR"]);
  },
};
