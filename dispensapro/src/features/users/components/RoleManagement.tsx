import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { listRoles, listPermissions, createRole, updateRole, deleteRole, RoleDto, PermissionDto, CreateRoleRequest } from '../../../services/roleApiService';
import { Can } from '../../../components/Can';

export default function RoleManagement() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    permissionCodes: [],
  });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await listRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await listPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleOpenDialog = (role?: RoleDto) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        permissionCodes: role.permissions.map(p => p.code),
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        permissionCodes: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      permissionCodes: [],
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
      } else {
        await createRole(formData);
      }
      handleCloseDialog();
      loadRoles();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
        loadRoles();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const handlePermissionToggle = (permissionCode: string) => {
    setFormData(prev => ({
      ...prev,
      permissionCodes: prev.permissionCodes.includes(permissionCode)
        ? prev.permissionCodes.filter(code => code !== permissionCode)
        : [...prev.permissionCodes, permissionCode],
    }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Role Management</Typography>
        <Can permission="ROLE_MANAGE">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Role
          </Button>
        </Can>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  <Chip
                    label={role.isSystem ? 'System' : 'Custom'}
                    color={role.isSystem ? 'default' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {role.permissions.map((permission) => (
                      <Chip
                        key={permission.id}
                        label={permission.code}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Can permission="ROLE_MANAGE">
                    {!role.isSystem && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(role)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(role.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Permissions
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {permissions.map((permission) => (
              <Chip
                key={permission.id}
                label={permission.code}
                onClick={() => handlePermissionToggle(permission.code)}
                color={formData.permissionCodes.includes(permission.code) ? 'primary' : 'default'}
                clickable
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
