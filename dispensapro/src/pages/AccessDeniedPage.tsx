import React from 'react';
import { Box, Typography, Button, Container, Paper, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePermissions, useRoles } from '../hooks/usePermissions';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const roles = useRoles();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
            }}
          />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page or perform this action.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Your Current Roles:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
            {roles.length > 0 ? (
              roles.map((role) => (
                <Chip key={role} label={role} color="primary" variant="outlined" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No roles assigned
              </Typography>
            )}
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Your Current Permissions:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            {permissions.length > 0 ? (
              permissions.map((permission) => (
                <Chip key={permission} label={permission} size="small" variant="outlined" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No permissions assigned
              </Typography>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<HomeIcon />}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
          If you believe this is an error, please contact your administrator.
        </Typography>
      </Paper>
    </Container>
  );
}
