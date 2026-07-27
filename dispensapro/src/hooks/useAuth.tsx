import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearTokens, getRefreshTokenFromStore } from '../utils/auth';
import { getTokenFromStore } from '../utils/auth';
import { logout as logoutApi } from '../services/authApiService';

export function useAuth() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth?.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  const logout = async () => {
    const refreshToken = getRefreshTokenFromStore();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    clearTokens();
    navigate('/login');
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated && !getTokenFromStore()) {
    navigate('/login');
  }

  return {
    user,
    isAuthenticated: Boolean(isAuthenticated),
    logout,
  };
}