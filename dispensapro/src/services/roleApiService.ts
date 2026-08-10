import apiClient from './apiClient';

export interface PermissionDto {
  id: string;
  code: string;
  description: string;
}

export interface RoleDto {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: PermissionDto[];
}

export interface CreateRoleRequest {
  name: string;
  permissionCodes: string[];
}

export interface PermissionRequest {
  permissionCodes: string[];
}

export const listRoles = async (): Promise<RoleDto[]> => {
  const res = await apiClient.get('/roles');
  return res.data;
};

export const listPermissions = async (): Promise<PermissionDto[]> => {
  const res = await apiClient.get('/roles/permissions');
  return res.data;
};

export const createRole = async (request: CreateRoleRequest): Promise<RoleDto> => {
  const res = await apiClient.post('/roles', request);
  return res.data;
};

export const updateRole = async (id: string, request: CreateRoleRequest): Promise<RoleDto> => {
  const res = await apiClient.put(`/roles/${id}`, request);
  return res.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/roles/${id}`);
};

export const attachPermissions = async (id: string, request: PermissionRequest): Promise<RoleDto> => {
  const res = await apiClient.post(`/roles/${id}/permissions`, request);
  return res.data;
};

export const detachPermissions = async (id: string, request: PermissionRequest): Promise<RoleDto> => {
  const res = await apiClient.delete(`/roles/${id}/permissions`, { data: request });
  return res.data;
};

export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
  await apiClient.post(`/roles/users/${userId}/roles/${roleId}`);
};

export const unassignRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  await apiClient.delete(`/roles/users/${userId}/roles/${roleId}`);
};
