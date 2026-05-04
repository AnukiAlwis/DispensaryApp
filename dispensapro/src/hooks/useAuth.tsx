import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function useAuth() {
  // adjust path according to your slice
  const user = useSelector((state: RootState) => (state as any).auth?.user);

  // you can return more auth data here
  return {
    user,
    isAuthenticated: Boolean(user),
  };
}