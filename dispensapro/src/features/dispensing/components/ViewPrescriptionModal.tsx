import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { dispensingService } from "../services/dispensingService";
import { DispensingMedicine } from "../types";

interface ViewPrescriptionModalProps {
  open: boolean;
  prescriptionId: string;
  onClose: () => void;
}

export default function ViewPrescriptionModal({
  open,
  prescriptionId,
  onClose,
}: ViewPrescriptionModalProps) {
  const [medicines, setMedicines] = useState<DispensingMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setMedicines(fetchedMedicines);
    } catch (err: any) {
      setError("Failed to load prescription details. Please try again.");
      console.error("Error loading medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Prescription Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prescription ID: {prescriptionId}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Strength</TableCell>
                  <TableCell>Dose</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Quantity</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
