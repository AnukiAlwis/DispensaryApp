import { TextField, Box, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { Patient } from "../types";

interface PatientFormProps {
  initialValues?: Partial<Patient>;
  onSubmit: (values: Omit<Patient, "id">) => void;
  createdById?: string; // can pass from parent
}

export default function PatientForm({
  initialValues,
  onSubmit,
  createdById,
}: PatientFormProps) {
  const [form, setForm] = useState<Omit<Patient, "id">>({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    dob: initialValues?.dob || "",
    age: undefined,
    gender: initialValues?.gender || null,
    contact: initialValues?.contact || "",
    address: initialValues?.address || "",
    createdById: createdById || initialValues?.createdById || "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <TextField
        label="First Name"
        value={form.firstName}
        onChange={handleChange("firstName")}
        fullWidth
      />
      <TextField
        label="Last Name"
        value={form.lastName}
        onChange={handleChange("lastName")}
        fullWidth
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
      <TextField
        label="Contact Number"
        value={form.contact}
        onChange={handleChange("contact")}
        fullWidth
      />
      <TextField
        label="Address"
        value={form.address}
        onChange={handleChange("address")}
        fullWidth
      />

      <Box textAlign="right" mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSubmit(form)}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
