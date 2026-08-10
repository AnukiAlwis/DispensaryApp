import { TextField, Box, MenuItem, Button, Typography, Stack, Alert } from "@mui/material";
import { useState } from "react";
import { Patient } from "../types";

interface PatientFormProps {
  initialValues?: Partial<Patient>;
  onSubmit: (values: Omit<Patient, "id">) => void;
  onCancel?: () => void;
  submitLabel?: string;
  submitError?: string | null;
  onClearError?: () => void;
}

export default function PatientForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Patient",
  submitError,
  onClearError,
}: PatientFormProps) {
  const [form, setForm] = useState<Omit<Patient, "id">>({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    dob: initialValues?.dob || "",
    age: undefined,
    gender: initialValues?.gender || null,
    contact: initialValues?.contact || "",
    address: initialValues?.address || "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      // Clear error when user changes name or contact fields
      if ((field === 'firstName' || field === 'lastName' || field === 'contact') && onClearError) {
        onClearError();
      }
    };

  const getMaxDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const isFormValid =
    form.firstName.trim() && form.lastName.trim() && form.contact.trim() && form.dob;

  const isButtonDisabled = !isFormValid || !!submitError;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Basic Information */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontSize: "0.95rem" }}>
          Basic Information
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
          gap={2}
        >
          <TextField
            label="First Name"
            value={form.firstName}
            onChange={handleChange("firstName")}
            fullWidth
            required
          />
          <TextField
            label="Last Name"
            value={form.lastName}
            onChange={handleChange("lastName")}
            fullWidth
            required
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={handleChange("dob")}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: getMaxDate()
            }}
          />
          <TextField
            label="Gender"
            select
            value={form.gender}
            onChange={handleChange("gender")}
            fullWidth
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Contact Information */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontSize: "0.95rem" }}>
          Contact Information
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
          gap={2}
        >
          <TextField
            label="Contact Number"
            value={form.contact}
            onChange={handleChange("contact")}
            fullWidth
            required
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={handleChange("address")}
            fullWidth
          />
        </Box>
      </Box>

      {/* Error Display */}
      {submitError && (
        <Alert 
          severity="error" 
          onClose={onClearError ? onClearError : undefined}
        >
          {submitError}
        </Alert>
      )}

      {/* Footer Actions */}
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" mt={1}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSubmit(form)}
          disabled={isButtonDisabled}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
