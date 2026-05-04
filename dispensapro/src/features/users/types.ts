import { UserRole } from "../../types/enums";

export interface UserResponseDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  doctorCharge: number | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}



