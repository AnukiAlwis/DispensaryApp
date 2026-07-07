import {
  TextField,
  Box,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
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
  onSubmit = () => {},
}: CreateVisitFormProps) {
  const { doctors, loading: loadingDoctors } = useDoctors();

  const { addQueue } = useQueue();
  const { isCreating, createVisit } = useCreateVisit();

  const [form, setForm] = useState<VisitFormValues>({
    doctorId: "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleCreate = async () => {
    if (!patient?.id || !isFormValid || isCreating) return;
    const queue = await addQueue({ patientId: patient.id, doctorId: form.doctorId });
    await createVisit({ patientId: patient.id, doctorId: form.doctorId });
    onClose(queue);
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

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      {/* 1) Patient Name - non editable field */}
      <TextField
        label="Patient Name"
        value={`${patient.firstName} ${patient.lastName}`}
        fullWidth
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiInputBase-input.Mui-disabled": {
            opacity: 0.9,
            color: "black",
            WebkitTextFillColor: "black",
          },
        }}
      />

      {/* 2) Age - non editable field */}
      <TextField
        label="Age"
        value={patient.age}
        fullWidth
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiInputBase-input.Mui-disabled": {
            opacity: 0.9,
            color: "black",
            WebkitTextFillColor: "black",
          },
        }}
      />

      {/* 3) Contact - non editable field */}
      <TextField
        label="Contact"
        value={patient.contact}
        fullWidth
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiInputBase-input.Mui-disabled": {
            opacity: 0.9,
            color: "black",
            WebkitTextFillColor: "black",
          },
        }}
      />

      {/* 4) Doctor - Dropdown with fetched data */}
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

      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Button variant="outlined" onClick={() => onClose()} disabled={isCreating}>
          CANCEL
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={!isFormValid || loadingDoctors || isCreating}
          endIcon={
            isCreating ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isCreating ? "CREATING..." : "CREATE VISIT & GET QUEUE NUMBER"}
        </Button>
      </Box>
    </Box>
  );
}
