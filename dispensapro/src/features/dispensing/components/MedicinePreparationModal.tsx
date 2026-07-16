import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { dispensingService } from "../services/dispensingService";
import { DispensingMedicine, MedicineStatus } from "../types";
import { loadState, saveState, clearState } from "../utils/preparationStorage";

interface MedicinePreparationModalProps {
  open: boolean;
  prescriptionId: string;
  patientName: string;
  isDispensed?: boolean;
  onClose: () => void;
  onDispenseComplete: (billId: string) => void;
  onGoToBilling?: () => void;
}

const STATUS_COLORS: Record<MedicineStatus, string> = {
  NOT_STARTED: "#e0e0e0",
  STARTED: "#ff9800",
  READY_TO_DISPENSE: "#4caf50",
};

const STATUS_LABELS: Record<MedicineStatus, string> = {
  NOT_STARTED: "Not Started",
  STARTED: "Started",
  READY_TO_DISPENSE: "Ready to Dispense",
};

const cycleStatus = (current: MedicineStatus): MedicineStatus => {
  switch (current) {
    case "NOT_STARTED":
      return "STARTED";
    case "STARTED":
      return "READY_TO_DISPENSE";
    case "READY_TO_DISPENSE":
      return "NOT_STARTED";
    default:
      return "NOT_STARTED";
  }
};

export default function MedicinePreparationModal({
  open,
  prescriptionId,
  patientName,
  isDispensed = false,
  onClose,
  onDispenseComplete,
  onGoToBilling,
}: MedicinePreparationModalProps) {
  const [medicines, setMedicines] = useState<DispensingMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);

  useEffect(() => {
    if (open && prescriptionId) {
      loadMedicines();
    }
  }, [open, prescriptionId]);

  const loadMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedMedicines = await dispensingService.getPrescriptionMedicines(
        prescriptionId
      );
      
      // Load existing state from sessionStorage if available
      const savedState = loadState();
      if (savedState && savedState.prescriptionId === prescriptionId) {
        const updatedMedicines = fetchedMedicines.map((med) => ({
          ...med,
          status: savedState.medicineStatuses[med.id] || "NOT_STARTED",
        }));
        setMedicines(updatedMedicines);
      } else {
        setMedicines(fetchedMedicines);
      }
    } catch (err: any) {
      setError("Failed to load medicines. Please try again.");
      console.error("Error loading medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (medicineId: string) => {
    const updatedMedicines = medicines.map((med) => {
      if (med.id === medicineId) {
        const newStatus = cycleStatus(med.status);
        return { ...med, status: newStatus };
      }
      return med;
    });
    setMedicines(updatedMedicines);

    // Save to sessionStorage
    const medicineStatuses: Record<string, MedicineStatus> = {};
    updatedMedicines.forEach((med) => {
      medicineStatuses[med.id] = med.status;
    });
    saveState({
      prescriptionId,
      medicineStatuses,
    });
  };

  const allReady = medicines.every(
    (med) => med.status === "READY_TO_DISPENSE"
  );

  const handleDispense = async () => {
    if (!allReady) return;

    setIsDispensing(true);
    setError(null);

    try {
      // Update prescription status to DISPENSED
      await dispensingService.updatePrescriptionStatus(prescriptionId, "DISPENSED");
      
      // Clear sessionStorage
      clearState();

      // Get bill ID (this will be passed from parent or fetched)
      // For now, we'll use a placeholder - the parent component will handle this
      onDispenseComplete("");
    } catch (err: any) {
      if (err.response?.data?.message?.includes("Insufficient stock")) {
        setError(err.response.data.message);
      } else {
        setError("Failed to complete dispense. Please try again.");
      }
      console.error("Error dispensing:", err);
    } finally {
      setIsDispensing(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Medicine Preparation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Patient: {patientName} | Prescription ID: {prescriptionId}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Medicine</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Strength</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dose</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Frequency</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ color: "text.secondary", opacity: 0.5 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell>{medicine.medicineName}</TableCell>
                    <TableCell>{medicine.strength}</TableCell>
                    <TableCell>{medicine.dose}</TableCell>
                    <TableCell>{medicine.frequency}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          opacity: medicine.currentStock < medicine.quantity ? 1 : 0.5,
                        }}
                        color={medicine.currentStock < medicine.quantity ? "error" : undefined}
                      >
                        {medicine.currentStock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStatusChange(medicine.id)}
                        disabled={isDispensing || isDispensed}
                        sx={{
                          backgroundColor: isDispensed
                            ? "#4caf50"
                            : STATUS_COLORS[medicine.status],
                          color: "white",
                          "&:hover": {
                            backgroundColor: isDispensed
                              ? "#4caf50"
                              : STATUS_COLORS[medicine.status],
                            filter: "brightness(0.9)",
                          },
                        }}
                      >
                        {isDispensed
                          ? "DISPENSED ✓"
                          : STATUS_LABELS[medicine.status]}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isDispensing}>
          Cancel
        </Button>
        {isDispensed ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onGoToBilling}
            sx={{ minWidth: 150 }}
          >
            Go To Billing
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleDispense}
            disabled={!allReady || isDispensing}
            sx={{ minWidth: 150 }}
          >
            {isDispensing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "DISPENSE"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
