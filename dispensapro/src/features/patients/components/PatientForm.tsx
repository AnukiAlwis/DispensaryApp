import { TextField, Box, MenuItem, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { Patient } from "../types";

interface PatientFormProps {
  initialValues?: Partial<Patient>;
  onSubmit: (values: Omit<Patient, "id">) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function PatientForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Patient",
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
    };

  const isFormValid =
    form.firstName.trim() && form.lastName.trim() && form.contact.trim();

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
            InputLabelProps={{ shrink: true }}
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
          disabled={!isFormValid}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
