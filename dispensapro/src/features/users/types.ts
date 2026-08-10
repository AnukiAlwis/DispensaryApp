export interface UserResponseDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
  doctorCharge: number | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}



