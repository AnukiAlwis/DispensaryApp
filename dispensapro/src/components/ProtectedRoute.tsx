import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { getTokenFromStore } from '../utils/auth';
import { getMe, UserDto } from '../services/authApiService';
import { setUserDetails } from '../store/userSlice';
import { UserRole } from '../types/enums';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const mapUserDtoToUserDetails = (user: UserDto) => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  email: user.email ?? '',
  phone: user.phone ?? '',
  role: user.role as UserRole,
  doctorCharge: user.doctorCharge,
  tenantId: user.tenantId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const token = getTokenFromStore();
  const userDetails = useSelector((state: RootState) => state.user.userDetails);
  const [isHydratingUser, setIsHydratingUser] = useState(Boolean(token && !userDetails));

  useEffect(() => {
    let isActive = true;

    const hydrateCurrentUser = async () => {
      if (!token || userDetails) {
        if (isActive) {
          setIsHydratingUser(false);
        }
        return;
      }

      setIsHydratingUser(true);

      try {
        const currentUser = await getMe();
        if (isActive) {
          dispatch(setUserDetails(mapUserDtoToUserDetails(currentUser)));
        }
      } catch (error) {
        console.error('Failed to restore current user details:', error);
      } finally {
        if (isActive) {
          setIsHydratingUser(false);
        }
      }
    };

    hydrateCurrentUser();

    return () => {
      isActive = false;
    };
  }, [dispatch, token, userDetails]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isHydratingUser) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
