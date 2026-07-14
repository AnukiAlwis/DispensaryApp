import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Medicine } from "../../pharmacy/types";

const FREQUENCY_OPTIONS = [
  "After meals",
  "Before meals",
  "Twice daily",
  "At bedtime",
  "Every 6 hours",
];

interface PrescriptionItemRowProps {
  medicine: Medicine;
  disabled?: boolean;
  onConfirm: (item: {
    medicineId: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
    qtyPrescribed: number;
  }) => void;
}

const parseFrequency = (freq: string): number => {
  const lower = freq.toLowerCase();
  if (lower.includes("after meals") || lower.includes("before meals")) return 3;
  if (lower.includes("twice daily") || lower.includes("2 times")) return 2;
  return 1;
};

export default function PrescriptionItemRow({
  medicine,
  disabled = false,
  onConfirm,
}: PrescriptionItemRowProps) {
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string | null>("After meals");
  const [duration, setDuration] = useState<number>(1);
  const [isCommitted, setIsCommitted] = useState(false);

  const quantity = useMemo(() => {
    if (!dosage || !frequency) return 0;
    const units = parseInt(dosage.match(/\d+/)?.[0] || "1");
    const timesPerDay = parseFrequency(frequency);
    return units * timesPerDay * duration;
  }, [dosage, frequency, duration]);

  const isStockSufficient = quantity <= (medicine.quantity || 0);

  useEffect(() => {
    if (isCommitted) {
      setIsCommitted(false);
      setDosage("");
      setFrequency("After meals");
      setDuration(1);
    }
  }, [medicine.id]);

  const handleConfirm = () => {
    if (!dosage || !frequency || quantity <= 0 || !medicine.id) return;
    onConfirm({
      medicineId: medicine.id,
      dosage,
      frequency,
      durationDays: duration,
      instructions: frequency,
      qtyPrescribed: quantity,
    });
    setIsCommitted(true);
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: isCommitted ? "action.hover" : "background.paper",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            label="Medicine"
            value={`${medicine.name} ${medicine.strength || ""}`.trim()}
            InputProps={{ readOnly: true }}
            disabled={disabled || isCommitted}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            fullWidth
            label="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g. 2 tablets"
            disabled={disabled || isCommitted}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Autocomplete
            freeSolo
            options={FREQUENCY_OPTIONS}
            value={frequency}
            onChange={(_, value) => setFrequency(value)}
            onInputChange={(_, value) => setFrequency(value)}
            disabled={disabled || isCommitted}
            renderInput={(params) => (
              <TextField {...params} label="Frequency" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 1 }}>
          <TextField
            fullWidth
            type="number"
            label="Days"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
            disabled={disabled || isCommitted}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Typography
            variant="body1"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minWidth: 24,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            =
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 1 }}>
          <TextField
            fullWidth
            label="Qty"
            value={quantity}
            InputProps={{ readOnly: true }}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckIcon />}
              onClick={handleConfirm}
              disabled={disabled || !dosage || !frequency || !isStockSufficient}
            >
              Confirm
            </Button>
          </Box>
        </Grid>
      </Grid>

      {!isStockSufficient && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Stock unavailable. Current Available qty: {medicine.quantity || 0}
        </Typography>
      )}
    </Box>
  );
}
