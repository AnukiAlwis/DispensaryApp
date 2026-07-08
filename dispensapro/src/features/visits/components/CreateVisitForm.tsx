import {
  TextField,
  Box,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { Patient } from "../../patients/types";
import { useDoctors } from "../../users/hooks/useDoctors";
import { useCreateVisit } from "../hooks/useVisit";
import { useQueue } from "../../Queues/hooks/useQueue";
import { Queue } from "../../Queues/types";

interface VisitFormValues {
  doctorId: string;
}

interface CreateVisitFormProps {
  patient: Patient | null;
  onClose: (queue?: Queue) => void;
  onSubmit?: (patientId: string, values: VisitFormValues) => void;
}

export default function CreateVisitForm({
  patient,
  onClose,
}: CreateVisitFormProps) {
  const { doctors, loading: loadingDoctors } = useDoctors();
  const { addQueue } = useQueue();
  const { isCreating, createVisit } = useCreateVisit();

  const [form, setForm] = useState<VisitFormValues>({
    doctorId: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
      setSubmitError(null);
    };

  const handleCreate = async () => {
    if (!patient?.id || !isFormValid || isCreating) return;
    setSubmitError(null);
    try {
      const queue = await addQueue({ patientId: patient.id, doctorId: form.doctorId });
      await createVisit({ patientId: patient.id, doctorId: form.doctorId });
      onClose(queue);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create visit. Please try again.";
      setSubmitError(message);
    }
  };

  const isFormValid = !!form.doctorId;

  if (!patient) return <Typography>No patient selected.</Typography>;

  const menuItems = loadingDoctors ? (
    <MenuItem key="loading" disabled>
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="textSecondary">
          Loading Doctors...
        </Typography>
      </Box>
    </MenuItem>
  ) : (
    [
      <MenuItem key="placeholder" value="">
        <em>Select Doctor</em>
      </MenuItem>,
      ...doctors.map((doctor) => (
        <MenuItem key={doctor.id} value={doctor.id}>
          {doctor.fullName} ({doctor.username})
        </MenuItem>
      )),
    ]
  );

  const disabledInputSx = {
    "& .MuiInputBase-input.Mui-disabled": {
      opacity: 1,
      color: "text.primary",
      WebkitTextFillColor: "text.primary",
      fontWeight: 500,
    },
    "& .MuiInputLabel-root.Mui-disabled": {
      color: "text.secondary",
    },
  };

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Patient Name"
            value={`${patient.firstName} ${patient.lastName}`}
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
            sx={disabledInputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Contact"
            value={patient.contact}
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
            sx={disabledInputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Age"
            value={patient.age || "—"}
            fullWidth
            disabled
            InputProps={{ readOnly: true }}
            sx={disabledInputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Doctor"
            select
            value={form.doctorId}
            onChange={handleChange("doctorId")}
            fullWidth
            required
            disabled={loadingDoctors || isCreating}
            error={!form.doctorId && !loadingDoctors}
            helperText={
              !form.doctorId && !loadingDoctors ? "Doctor is required" : ""
            }
          >
            {menuItems}
          </TextField>
        </Grid>
      </Grid>

      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
        <Button variant="outlined" onClick={() => onClose()} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={!isFormValid || loadingDoctors || isCreating}
          endIcon={
            isCreating ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {isCreating ? "Creating..." : "Create Visit & Get Queue"}
        </Button>
      </Box>
    </Box>
  );
}
