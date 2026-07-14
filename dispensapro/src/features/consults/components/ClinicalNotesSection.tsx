import { TextField } from "@mui/material";

interface ClinicalNotesSectionProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function ClinicalNotesSection({
  id,
  value,
  onChange,
  disabled = false,
  error,
}: ClinicalNotesSectionProps) {
  return (
    <TextField
      id={id}
      fullWidth
      multiline
      minRows={4}
      label="Clinical Notes"
      placeholder="Enter signs, symptoms, diagnosis, and observations..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      error={!!error}
      helperText={error}
      sx={{ mb: 3 }}
    />
  );
}
