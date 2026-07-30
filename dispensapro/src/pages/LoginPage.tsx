import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, TextField, Alert, CircularProgress } from '@mui/material';
import ElevatedCard from '../components/ElevatedCard';
import { Button } from '../components/Button';
import { login } from '../services/authApiService';
import { getTenantCode } from '../utils/tenant';
import { setTokens } from '../utils/auth';
import { setUserDetails } from '../store/userSlice';
import { setCredentials } from '../store/authSlice';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tenantCode = getTenantCode();
      const response = await login(username, password, tenantCode);
      
      // Store tokens in localStorage
      setTokens(response.accessToken, response.refreshToken);
      
      // Store auth credentials in Redux
      dispatch(setCredentials({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));
      
      // Store user details in Redux
      dispatch(setUserDetails({
        id: response.user.id,
        username: response.user.username,
        fullName: response.user.fullName,
        email: response.user.email ?? '',
        phone: response.user.phone ?? '',
        role: response.user.role as any, // Type assertion for UserRole
        doctorCharge: response.user.doctorCharge,
        tenantId: response.user.tenantId,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      }));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        <ElevatedCard>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Enter your credentials to access the dispensary system
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            autoFocus
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading || !username || !password}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Tenant Code: {getTenantCode()}
        </Typography>
        </ElevatedCard>
      </Box>
    </Box>
  );
};

export default LoginPage;
