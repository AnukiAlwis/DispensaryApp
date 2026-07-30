import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearTokens, getRefreshTokenFromStore } from '../utils/auth';
import { getTokenFromStore } from '../utils/auth';
import { logout as logoutApi } from '../services/authApiService';
import { clearUserDetails } from '../store/userSlice';
import { clearCredentials } from '../store/authSlice';

export function useAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user?.userDetails);
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
    dispatch(clearCredentials());
    dispatch(clearUserDetails());
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