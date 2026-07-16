import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { billingService } from "../../consults/services/billingService";
import { Bill } from "../../consults/types";
import { visitService } from "../../visits/services/visitService";
import { Visit } from "../../visits/types";

interface BillingModalProps {
  open: boolean;
  prescriptionId: string;
  patientName: string;
  patientPhone: string;
  onClose: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const formatCurrency = (amount: number | undefined | null): string => {
  const value = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function BillingModal({
  open,
  prescriptionId,
  patientName,
  patientPhone,
  onClose,
  onBack,
  onComplete,
}: BillingModalProps) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (open && prescriptionId) {
      loadBillingData();
    }
  }, [open, prescriptionId]);

  const loadBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const billData = await billingService.getByPrescriptionId(prescriptionId);
      setBill(billData);

      if (billData.patientId) {
        try {
          const visits = await visitService.getAllByPatientId(billData.patientId);
          if (visits && visits.length > 0) {
            setVisit(visits[0]);
          }
        } catch (visitErr) {
          console.error("Error loading visits:", visitErr);
        }
      }
    } catch (err: any) {
      setError("Failed to load billing data. Please try again.");
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleComplete = async () => {
    if (!bill) return;

    setIsCompleting(true);
    setError(null);

    try {
      await billingService.updateStatus(bill.id, "PAID");
      onComplete();
    } catch (err: any) {
      setError("Failed to complete payment. Please try again.");
      console.error("Error completing payment:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const change = bill
    ? parseFloat(amountReceived || "0") - (bill.grandTotal ?? 0)
    : 0;

  const isChangeNegative = change < 0;

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #bill-print-section, #bill-print-section * {
              visibility: visible;
            }
            #bill-print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Billing & Payment
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
          ) : bill ? (
            <Box>
              {/* Section 1: Patient Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Patient Information
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{patientName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{patientPhone}</Typography>
                  </Box>
                </Box>

                {visit && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                      Visit Information
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Visit Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(visit.visitTime || visit.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Visit ID
                        </Typography>
                        <Typography variant="body1">{visit.id}</Typography>
                      </Box>
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Doctor Notes
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                  No notes available
                </Typography>
              </Box>

              {/* Section 2: Printable Bill */}
              <Box id="bill-print-section" sx={{ mb: 3, p: 2, border: "1px solid #ddd", bgcolor: "#fff" }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
                  INVOICE
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Bill ID
                    </Typography>
                    <Typography variant="body1">{bill.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Patient: {patientName}
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Strength</TableCell>
                        <TableCell>Dose</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bill.lineItems && bill.lineItems.length > 0 ? (
                        bill.lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.medicineName}</TableCell>
                            <TableCell>{item.strength}</TableCell>
                            <TableCell>{item.dose}</TableCell>
                            <TableCell>{item.frequency}</TableCell>
                            <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell align="right">{item.qty}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No medicine items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Doctor Fee:</Typography>
                    <Typography>{formatCurrency(bill.doctorFee)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Medicine Total:</Typography>
                    <Typography>{formatCurrency(bill.medicineTotal)}</Typography>
                  </Box>
                  {(bill.doctorDiscountPct ?? 0) > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Doctor Discount ({bill.doctorDiscountPct}%):</Typography>
                      <Typography>
                        -{formatCurrency((bill.doctorFee * (bill.doctorDiscountPct ?? 0)) / 100)}
                      </Typography>
                    </Box>
                  )}
                  {(bill.pharmacyDiscountPct ?? 0) > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Pharmacy Discount ({bill.pharmacyDiscountPct}%):</Typography>
                      <Typography>
                        -{formatCurrency((bill.medicineTotal * (bill.pharmacyDiscountPct ?? 0)) / 100)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <Typography variant="h6">Grand Total:</Typography>
                    <Typography variant="h6">
                      {formatCurrency(bill.grandTotal)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Section 3: Receive Payment */}
              <Box className="no-print" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Receive Payment
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount Due
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(bill.grandTotal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Amount Received
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Change
                    </Typography>
                    <Typography
                      variant="h6"
                      color={isChangeNegative ? "error" : "success.main"}
                    >
                      {formatCurrency(change)}
                    </Typography>
                  </Box>
                </Box>
                {isChangeNegative && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Amount received is less than the total due.
                  </Alert>
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions className="no-print" sx={{ p: 2 }}>
          <Button
            onClick={onBack}
            variant="outlined"
            disabled={isCompleting}
          >
            BACK
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            sx={{ bgcolor: "#ff9800", "&:hover": { bgcolor: "#f57c00" } }}
            disabled={isCompleting}
          >
            PRINT
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            color="primary"
            disabled={isCompleting || isChangeNegative || !amountReceived}
            sx={{ minWidth: 120 }}
          >
            {isCompleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "DONE"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
