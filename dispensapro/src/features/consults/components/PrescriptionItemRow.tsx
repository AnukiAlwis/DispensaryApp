import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Medicine } from "../../pharmacy/types";
import { calculateQuantity } from "../utils/frequency";

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
    return calculateQuantity(dosage, frequency, duration);
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

  const handleDosageChange = (value: string) => {
    // Reject input if any number in the dosage has more than 2 decimal places
    if (/\d+\.\d{3,}/.test(value)) return;
    setDosage(value);
  };

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
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ flex: "2 1 200px", minWidth: 160 }}>
          <TextField
            fullWidth
            label="Medicine"
            value={`${medicine.name} ${medicine.strength || ""}`.trim()}
            InputProps={{ readOnly: true }}
            disabled={disabled || isCommitted}
          />
        </Box>
        <Box sx={{ flex: "1 1 140px", minWidth: 120 }}>
          <TextField
            fullWidth
            label="Dosage"
            value={dosage}
            onChange={(e) => handleDosageChange(e.target.value)}
            placeholder="e.g. 2 tablets"
            disabled={disabled || isCommitted}
          />
        </Box>
        <Box sx={{ flex: "1 1 160px", minWidth: 140 }}>
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
        </Box>
        <Box sx={{ flex: "0 1 90px", minWidth: 80 }}>
          <TextField
            fullWidth
            type="number"
            label="Days"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
            disabled={disabled || isCommitted}
          />
        </Box>
        <Typography
          variant="body1"
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
            minWidth: 16,
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          =
        </Typography>
        <Box sx={{ flex: "0 1 90px", minWidth: 80 }}>
          <TextField
            fullWidth
            label="Qty"
            value={quantity}
            InputProps={{ readOnly: true }}
            disabled
          />
        </Box>
        <Box sx={{ flex: "1 1 120px", minWidth: 100, display: "flex", alignItems: "center", gap: 1 }}>
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
      </Box>

      {!isStockSufficient && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Stock unavailable. Current Available qty: {medicine.quantity || 0}
        </Typography>
      )}
    </Box>
  );
}
