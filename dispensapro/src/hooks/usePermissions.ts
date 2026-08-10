import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Hook to check if the current user has a specific permission
 * @param permission - The permission code to check
 * @returns true if the user has the permission, false otherwise
 */
export function useHasPermission(permission: string): boolean {
  const userDetails = useSelector((state: RootState) => state.user?.userDetails);
  
  if (!userDetails || !userDetails.permissions) {
    return false;
  }
  
  return userDetails.permissions.includes(permission);
}

/**
 * Hook to check if the current user has any of the specified permissions
 * @param permissions - Array of permission codes to check
 * @returns true if the user has at least one of the permissions, false otherwise
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const userDetails = useSelector((state: RootState) => state.user?.userDetails);
  
  if (!userDetails || !userDetails.permissions) {
    return false;
  }
  
  return permissions.some(permission => userDetails.permissions.includes(permission));
}

/**
 * Hook to check if the current user has all of the specified permissions
 * @param permissions - Array of permission codes to check
 * @returns true if the user has all of the permissions, false otherwise
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const userDetails = useSelector((state: RootState) => state.user?.userDetails);
  
  if (!userDetails || !userDetails.permissions) {
    return false;
  }
  
  return permissions.every(permission => userDetails.permissions.includes(permission));
}

/**
 * Hook to get the current user's permissions
 * @returns Array of permission codes
 */
export function usePermissions(): string[] {
  const userDetails = useSelector((state: RootState) => state.user?.userDetails);
  return userDetails?.permissions || [];
}

/**
 * Hook to get the current user's roles
 * @returns Array of role names
 */
export function useRoles(): string[] {
  const userDetails = useSelector((state: RootState) => state.user?.userDetails);
  return userDetails?.roles || [];
}
