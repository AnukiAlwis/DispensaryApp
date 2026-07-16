import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Chip,
  useTheme,
} from "@mui/material";
import PageHeader from "../../../components/PageHeader";
import { dispensingService } from "../services/dispensingService";
import { billingService } from "../../consults/services/billingService";
import {
  CurrentServingPrescription,
  UpNextPrescription,
} from "../types";
import { hasActiveSession, clearState } from "../utils/preparationStorage";
import MedicinePreparationModal from "../components/MedicinePreparationModal";
import BillingModal from "../components/BillingModal";
import ViewPrescriptionModal from "../components/ViewPrescriptionModal";

type WorkflowState = "idle" | "preparing" | "billing";

export default function PrescriptionDispensingPage() {
  const theme = useTheme();
  const [currentServing, setCurrentServing] =
    useState<CurrentServingPrescription | null>(null);
  const [upNext, setUpNext] = useState<UpNextPrescription[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [viewPrescriptionId, setViewPrescriptionId] = useState<string | null>(
    null
  );
  const [hasActiveSessionState, setHasActiveSessionState] =
    useState(false);
  const [isDispensed, setIsDispensed] = useState(false);

  const fetchData = async () => {
    try {
      const [serving, next] = await Promise.all([
        dispensingService.getCurrentServing(),
        dispensingService.getUpNext(),
      ]);
      setCurrentServing(serving);
      setUpNext(next);
      setHasActiveSessionState(hasActiveSession());
    } catch (error) {
      console.error("Failed to fetch dispensing data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateWaitingTime = (issuedAt: string): string => {
    const now = new Date();
    const issued = new Date(issuedAt);
    const diffMs = now.getTime() - issued.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hr ${mins} min`;
    }
  };

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  const handleStartPreparing = () => {
    if (currentServing) {
      setSelectedPrescriptionId(currentServing.id);
      setWorkflowState("preparing");
    }
  };

  const handleContinueDispense = () => {
    if (currentServing) {
      setSelectedPrescriptionId(currentServing.id);
      setWorkflowState("preparing");
    }
  };

  const handleViewPrescription = (prescriptionId: string) => {
    setViewPrescriptionId(prescriptionId);
  };

  const handleDispenseNow = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setWorkflowState("preparing");
  };

  const handleWorkflowComplete = () => {
    setWorkflowState("idle");
    setSelectedPrescriptionId(null);
    setIsDispensed(false);
    setHasActiveSessionState(hasActiveSession());
    fetchData();
  };

  const handleBackToPreparation = () => {
    setWorkflowState("preparing");
  };

  const handleDispenseComplete = async (billId: string) => {
    // Calculate bill to refresh totals from dispense records
    if (selectedPrescriptionId) {
      try {
        const bill = await billingService.getByPrescriptionId(selectedPrescriptionId);
        await billingService.calculate(bill.id);
        setIsDispensed(true);
        setWorkflowState("billing");
      } catch (error) {
        console.error("Error calculating bill:", error);
      }
    }
  };

  const handleGoToBilling = () => {
    setWorkflowState("billing");
  };

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Prescription Dispensing"
        subtitle="Manage medicine preparation and billing for prescriptions."
      />

      {/* Currently Serving Card */}
      {currentServing ? (
        <Card
          sx={{
            mb: 3,
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: 3,
            bgcolor: theme.palette.primary.light,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              Currently Serving
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="h6">{currentServing.patientName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="h6">{currentServing.patientPhone}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Doctor
                </Typography>
                <Typography variant="h6">{currentServing.doctorName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Issued Date & Time
                </Typography>
                <Typography variant="h6">
                  {formatDateTime(currentServing.issuedAt)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={`Waiting: ${calculateWaitingTime(currentServing.issuedAt)}`}
                sx={{
                  bgcolor: theme.palette.warning.light,
                  color: theme.palette.warning.contrastText,
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={
                  hasActiveSessionState
                    ? handleContinueDispense
                    : handleStartPreparing
                }
                sx={{ ml: "auto" }}
              >
                {hasActiveSessionState ? "Continue Dispense" : "Start Preparing 💊"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3, bgcolor: "grey.100" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No prescriptions currently serving
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Up Next Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Up Next
          </Typography>
          {upNext.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Issued Date & Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upNext.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>{prescription.patientName}</TableCell>
                      <TableCell>{prescription.patientPhone}</TableCell>
                      <TableCell>{prescription.doctorName}</TableCell>
                      <TableCell>{formatDateTime(prescription.issuedAt)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewPrescription(prescription.id)}
                          >
                            View Prescription
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleDispenseNow(prescription.id)}
                            disabled={hasActiveSessionState}
                          >
                            Dispense Now
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              No prescriptions waiting
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Modal placeholders - to be implemented in subsequent tasks */}
      {/* MedicinePreparationModal - task 2.3 */}
      {/* BillingModal - task 2.4 */}
      {/* ViewPrescriptionModal - task 2.12 */}

      {/* Medicine Preparation Modal */}
      {selectedPrescriptionId && currentServing && (
        <MedicinePreparationModal
          open={workflowState === "preparing"}
          prescriptionId={selectedPrescriptionId}
          patientName={currentServing.patientName}
          isDispensed={isDispensed}
          onClose={() => {
            setWorkflowState("idle");
            setSelectedPrescriptionId(null);
            setIsDispensed(false);
          }}
          onDispenseComplete={handleDispenseComplete}
          onGoToBilling={handleGoToBilling}
        />
      )}

      {/* Billing Modal */}
      {selectedPrescriptionId && currentServing && (
        <BillingModal
          open={workflowState === "billing"}
          prescriptionId={selectedPrescriptionId}
          patientName={currentServing.patientName}
          patientPhone={currentServing.patientPhone}
          onClose={() => {
            setWorkflowState("idle");
            setSelectedPrescriptionId(null);
            setIsDispensed(false);
          }}
          onBack={handleBackToPreparation}
          onComplete={handleWorkflowComplete}
        />
      )}

      {/* View Prescription Modal */}
      {viewPrescriptionId && (
        <ViewPrescriptionModal
          open={!!viewPrescriptionId}
          prescriptionId={viewPrescriptionId}
          onClose={() => setViewPrescriptionId(null)}
        />
      )}
    </Box>
  );
}
