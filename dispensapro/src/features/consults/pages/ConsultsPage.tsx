import { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, Backdrop, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { queueService } from "../../Queues/services/QueueService";
import { patientService } from "../../patients/services/patientService";
import { Queue } from "../../Queues/types";
import { Patient } from "../../patients/types";
import SectionCard from "../../../components/SectionCard";
import { Prescription, Bill, PrescriptionItem } from "../types";
import { Visit } from "../../visits/types";
import { useConsultation } from "../hooks/useConsultation";
import { useBilling } from "../hooks/useBilling";
import IdleQueueCard from "../components/IdleQueueCard";
import ActivePatientHeader from "../components/ActivePatientHeader";
import PastVisitsAccordion from "../components/PastVisitsAccordion";
import ClinicalNotesSection from "../components/ClinicalNotesSection";
import PrescriptionBuilder from "../components/PrescriptionBuilder";
import BillingSection from "../components/BillingSection";
import CompletionModal from "../components/CompletionModal";

// const SESSION_TIMEOUT_MINUTES = 90; // Disabled: no session recovery under current assumptions.

export default function ConsultsPage() {
  const user = useSelector((state: RootState) => state.user.userDetails);
  const doctorId = "7c67c4a6-2ca6-4909-8c90-95e86a0bd797";

  const [status, setStatus] = useState<"idle" | "active" | "completed">("idle");
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [clinicalNotesError, setClinicalNotesError] = useState<string | null>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [billingResetKey, setBillingResetKey] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const {
    isInitiating,
    isFinalizing,
    cascadeStep,
    error,
    initiateConsultation,
    finalizeConsultation,
    // resumeConsultation disabled: no session recovery needed.
  } = useConsultation();

  const {
    doctorFee,
    medicineTotal,
    doctorDiscountPct,
    pharmacyDiscountPct,
    updateDiscounts,
    calculate,
  } = useBilling();

  const fetchPatient = useCallback(async (patientId: string) => {
    try {
      const patient = await patientService.getById(patientId);
      setCurrentPatient(patient);
    } catch (err: any) {
      console.error("Failed to fetch patient:", err);
      setCurrentPatient({
        id: patientId,
        firstName: currentQueue?.patientName || "Patient",
        lastName: "",
        dob: "",
        gender: null,
        contact: "",
        address: "",
      } as Patient);
    }
  }, [currentQueue?.patientName]);

  // Session auto-recovery disabled: doctor is assumed not to navigate away or refresh.
  // useEffect(() => {
  //   const checkInterruptedSession = async () => {
  //     if (!doctorId) return;
  //     try {
  //       const queues = await queueService.getAll(doctorId);
  //       const inProgress = queues.find(
  //         (q) => q.status === "IN_PROGRESS" || q.status === "CALLED"
  //       );
  //       if (inProgress && inProgress.inProgressAt) {
  //         const minutes =
  //           (Date.now() - new Date(inProgress.inProgressAt).getTime()) / 1000 / 60;
  //         if (minutes <= SESSION_TIMEOUT_MINUTES) {
  //           await handleResumeConsultation(inProgress);
  //         }
  //       }
  //     } catch (err: any) {
  //       console.error("Session check failed:", err);
  //     }
  //   };
  //
  //   checkInterruptedSession();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [doctorId]);

  const loadConsultationData = async (
    queue: Queue,
    visits: Visit[],
    prescription: Prescription,
    bill: Bill
  ) => {
    setCurrentQueue(queue);
    setVisitHistory(visits);
    setCurrentPrescription(prescription);
    setCurrentBill(bill);
    await fetchPatient(queue.patientId);
    setStatus("active");
  };

  const handleStartConsultation = async (queue: Queue) => {
    const result = await initiateConsultation(queue.id, queue.patientId);
    if (result) {
      await loadConsultationData(result.queue, result.visits, result.prescription, result.bill);
    }
  };

  // Resume handler disabled: no session recovery needed when the doctor stays in the same session.
  // const handleResumeConsultation = async (queue: Queue) => {
  //   const result = await resumeConsultation(queue.id, queue.patientId);
  //   if (result) {
  //     await loadConsultationData(result.queue, result.visits, result.prescription, result.bill);
  //   }
  // };

  const handleItemAdded = (item: PrescriptionItem) => {
    setPrescriptionItems((prev) => [...prev, item]);
    setBillingResetKey((prev) => prev + 1);
  };

  const handlePrescriptionChanged = () => {
    setBillingResetKey((prev) => prev + 1);
  };

  const handleCalculate = async () => {
    if (!currentBill) return null;
    return await calculate(currentBill.id);
  };

  const handleComplete = async () => {
    if (!currentQueue || !currentPrescription || !currentBill) return;

    if (!clinicalNotes.trim()) {
      setClinicalNotesError("Clinical notes are required before completing the consultation.");
      document.getElementById("clinical-notes")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const result = await finalizeConsultation(
      currentQueue.id,
      currentPrescription.visitId,
      currentPrescription.id,
      currentBill.id,
      clinicalNotes,
      doctorDiscountPct,
      pharmacyDiscountPct
    );

    if (result?.success) {
      setShowCompletionModal(true);
    }
  };

  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
    setStatus("idle");
    setCurrentQueue(null);
    setCurrentPatient(null);
    setVisitHistory([]);
    setCurrentPrescription(null);
    setCurrentBill(null);
    setClinicalNotes("");
    setClinicalNotesError(null);
    setPrescriptionItems([]);
    setBillingResetKey((prev) => prev + 1);
  };

  const getLastVisitDate = () => {
    if (visitHistory.length > 1) {
      const previousVisit = visitHistory[1];
      return previousVisit.visitTime || previousVisit.createdAt;
    }
    return null;
  };

  const isCascadeRunning = isInitiating || isFinalizing;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Doctor Consultation Workspace
      </Typography>

      {status === "idle" && (
        <IdleQueueCard
          doctorId={doctorId}
          onStartConsultation={handleStartConsultation}
          // onResumeConsultation={handleResumeConsultation} // Disabled: no resume flow.
        />
      )}

      {status === "active" && currentQueue && currentPatient && (
        <>
          <ActivePatientHeader
            queue={currentQueue}
            patient={currentPatient}
            bookingDateTime={currentQueue.createdAt}
          />

          <SectionCard title="Past Visits" noPadding>
            <PastVisitsAccordion visits={visitHistory} />
          </SectionCard>

          <SectionCard title="Clinical Notes">
            <ClinicalNotesSection
              id="clinical-notes"
              value={clinicalNotes}
              onChange={(value) => {
                setClinicalNotes(value);
                if (value.trim()) setClinicalNotesError(null);
              }}
              disabled={isCascadeRunning}
              error={clinicalNotesError || undefined}
            />
          </SectionCard>

          {currentPrescription && (
            <SectionCard title="Prescription Builder">
              <PrescriptionBuilder
                prescriptionId={currentPrescription.id}
                committedItems={prescriptionItems}
                disabled={isCascadeRunning}
                onItemAdded={handleItemAdded}
                onPrescriptionChanged={handlePrescriptionChanged}
              />
            </SectionCard>
          )}

          {currentBill && (
            <BillingSection
              key={billingResetKey}
              billId={currentBill.id}
              hasPrescriptionItems={prescriptionItems.length > 0}
              disabled={isCascadeRunning}
              onCalculate={handleCalculate}
            />
          )}

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              color="success"
              onClick={handleComplete}
              disabled={isCascadeRunning || !currentPrescription || !currentBill}
            >
              Complete Consultation & Send Prescription
            </Button>
          </Box>
        </>
      )}

      {showCompletionModal && currentQueue && (
        <CompletionModal
          open={showCompletionModal}
          queueNumber={currentQueue.queueNumber}
          onClose={handleCloseCompletion}
        />
      )}

      <Backdrop open={isCascadeRunning || !!error} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ textAlign: "center", color: "white", maxWidth: 500, px: 3 }}>
          <CircularProgress color="inherit" sx={{ mb: 2 }} />
          <Typography variant="h6">
            {isInitiating ? "Starting consultation..." : "Completing consultation..."}
          </Typography>
          {cascadeStep > 0 && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              Step {cascadeStep} of {isInitiating ? 3 : 5}
            </Typography>
          )}
          {error && (
            <>
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => {
                  if (isInitiating) {
                    // Retry handled by hook
                  } else if (currentQueue && currentPrescription && currentBill) {
                    handleComplete();
                  }
                }}
              >
                Retry
              </Button>
            </>
          )}
        </Box>
      </Backdrop>
    </Box>
  );
}
