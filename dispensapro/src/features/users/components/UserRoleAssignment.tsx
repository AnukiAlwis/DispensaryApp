import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { listRoles, assignRoleToUser, unassignRoleFromUser, RoleDto } from '../../../services/roleApiService';
import { UserResponseDto } from '../types';
import { Can } from '../../../components/Can';

interface UserRoleAssignmentProps {
  user: UserResponseDto;
  onRefresh: () => void;
}

export default function UserRoleAssignment({ user, onRefresh }: UserRoleAssignmentProps) {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await listRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRoleId('');
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      await assignRoleToUser(user.id, selectedRoleId);
      handleCloseDialog();
      onRefresh();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleUnassignRole = async (roleId: string) => {
    try {
      await unassignRoleFromUser(user.id, roleId);
      onRefresh();
    } catch (error) {
      console.error('Failed to unassign role:', error);
    }
  };

  const availableRoles = roles.filter(
    role => !user.roles.includes(role.name)
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">User Roles</Typography>
        <Can permission="ROLE_MANAGE">
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={availableRoles.length === 0}
          >
            Assign Role
          </Button>
        </Can>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1}>
        {user.roles.map((roleName) => {
          const role = roles.find(r => r.name === roleName);
          const isSystem = role?.isSystem || false;
          
          return (
            <Chip
              key={roleName}
              label={`${roleName}${isSystem ? ' (System)' : ''}`}
              color="primary"
              variant="outlined"
              deleteIcon={<Can permission="ROLE_MANAGE"><RemoveIcon /></Can>}
              onDelete={!isSystem ? () => handleUnassignRole(role?.id || '') : undefined}
            />
          );
        })}
        {user.roles.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No roles assigned
          </Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to {user.fullName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRoleId}
              label="Select Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name} {role.isSystem && '(System)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained" disabled={!selectedRoleId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
