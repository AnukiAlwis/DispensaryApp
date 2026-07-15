import { TextField, Typography, Box } from "@mui/material";

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
  const maxLength = 2000;
  const currentLength = value.length;
  const isNearLimit = currentLength > maxLength * 0.9;
  const isOverLimit = currentLength > maxLength;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return "error";
    if (isNearLimit) return "warning";
    return "text.secondary";
  };

  return (
    <Box>
      <TextField
        id={id}
        fullWidth
        multiline
        minRows={4}
        label="Clinical Notes"
        placeholder="Enter signs, symptoms, diagnosis, and observations..."
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        error={!!error || isOverLimit}
        helperText={error || (isOverLimit ? "Character limit exceeded" : "")}
        sx={{ mb: 1 }}
      />
      <Typography
        variant="caption"
        color={getCharacterCountColor()}
        sx={{ textAlign: "right", display: "block", mb: 2 }}
      >
        {currentLength} / {maxLength} characters
      </Typography>
    </Box>
  );
}
