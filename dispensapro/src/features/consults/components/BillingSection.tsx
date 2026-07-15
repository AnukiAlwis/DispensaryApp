import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";

interface BillingSectionProps {
  billId: string;
  hasPrescriptionItems: boolean;
  disabled?: boolean;
  onCalculate?: () => Promise<{
    doctorFee: number;
    medicineTotal: number;
    totalAmount: number;
  } | null>;
  doctorDiscountPct: number;
  pharmacyDiscountPct: number;
  onDiscountsChange: (doctorPct: number, pharmacyPct: number) => void;
}

export default function BillingSection({
  hasPrescriptionItems,
  disabled = false,
  onCalculate,
  doctorDiscountPct,
  pharmacyDiscountPct,
  onDiscountsChange,
}: BillingSectionProps) {
  const [calculated, setCalculated] = useState(false);
  const [doctorFee, setDoctorFee] = useState(0);
  const [medicineTotal, setMedicineTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!calculated) return;
    const doctorNet = doctorFee * (1 - doctorDiscountPct / 100);
    const medicineNet = medicineTotal * (1 - pharmacyDiscountPct / 100);
    setTotalAmount(parseFloat((doctorNet + medicineNet).toFixed(2)));
  }, [doctorFee, medicineTotal, doctorDiscountPct, pharmacyDiscountPct, calculated]);

  const handleCalculate = async () => {
    if (!onCalculate) return;
    setIsCalculating(true);
    const result = await onCalculate();
    setIsCalculating(false);
    if (result) {
      setDoctorFee(result.doctorFee);
      setMedicineTotal(result.medicineTotal);
      setTotalAmount(result.totalAmount);
      setCalculated(true);
    }
  };

  const handleDoctorDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    onDiscountsChange(value, pharmacyDiscountPct);
  };

  const handlePharmacyDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    onDiscountsChange(doctorDiscountPct, value);
  };

  const reset = () => {
    setCalculated(false);
    setDoctorFee(0);
    setMedicineTotal(0);
    onDiscountsChange(0, 0);
    setTotalAmount(0);
  };

  return (
    <>
      {!calculated ? (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Please add prescription items and click &quot;Confirm Prescription &
            Calculate Bill&quot; to review billing & discounts section
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculate}
            disabled={disabled || isCalculating || !hasPrescriptionItems}
            sx={{
              px: 3,
              py: 1.2,
              fontSize: "0.95rem",
              fontWeight: 500,
              textTransform: "none",
              boxShadow: 1,
              "&:hover": {
                boxShadow: 2,
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                boxShadow: 0,
              },
            }}
          >
            {isCalculating ? "Calculating..." : "Confirm Prescription & Calculate Bill"}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Doctor Fee (LKR)"
              value={(doctorFee ?? 0).toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Doctor Discount %"
              value={doctorDiscountPct}
              onChange={handleDoctorDiscountChange}
              inputProps={{ min: 0, max: 100 }}
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Medicine Cost (LKR)"
              value={(medicineTotal ?? 0).toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Pharmacy Discount %"
              value={pharmacyDiscountPct}
              onChange={handlePharmacyDiscountChange}
              inputProps={{ min: 0, max: 100 }}
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Total Bill Amount (LKR)"
              value={(totalAmount ?? 0).toFixed(2)}
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiInputBase-input": {
                  fontWeight: 700,
                  fontSize: "1.2rem",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="outlined"
              onClick={reset}
              disabled={disabled}
              size="small"
              sx={{
                px: 2.5,
                py: 1,
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "primary.50",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  borderColor: "action.disabled",
                  color: "action.disabled",
                },
              }}
            >
              Recalculate
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
}
