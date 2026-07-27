import apiClient from './apiClient';

// TypeScript interfaces matching backend DTOs
export interface LoginRequest {
  username: string;
  password: string;
  tenantCode: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export const login = async (username: string, password: string, tenantCode: string): Promise<AuthResponse> => {
  const res = await apiClient.post('/api/auth/login', { username, password, tenantCode });
  return res.data;
};

export const refresh = async (refreshToken: string): Promise<AuthResponse> => {
  const res = await apiClient.post('/api/auth/refresh', { refreshToken });
  return res.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await apiClient.post('/api/auth/logout', { refreshToken });
};
