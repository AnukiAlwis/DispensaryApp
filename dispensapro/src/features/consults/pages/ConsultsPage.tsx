import { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, Backdrop, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import { startSession, setClinicalNotes, setDiscounts, clearSession } from "../../../store/consultationSlice";
import { queueService } from "../../Queues/services/QueueService";
import { patientService } from "../../patients/services/patientService";
import { visitService } from "../../visits/services/visitService";
import { prescriptionService, normalizePrescriptionStatus } from "../services/prescriptionService";
import { billingService } from "../services/billingService";
import { Queue } from "../../Queues/types";
import { Patient } from "../../patients/types";
import SectionCard from "../../../components/SectionCard";
import PageHeader from "../../../components/PageHeader";
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
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.consultationSession);
  const user = useSelector((state: RootState) => state.user.userDetails);
  const doctorId = "3c2c95c5-db0d-42e9-86de-b02cfecddbda";

  const [status, setStatus] = useState<"idle" | "active" | "completed">("idle");
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [clinicalNotesError, setClinicalNotesError] = useState<string | null>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [billingResetKey, setBillingResetKey] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

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

  const resumeFromSession = async () => {
    if (!session.queueId) {
      await resumeFromBackendQueue();
      return;
    }

    const minutesElapsed = (Date.now() - new Date(session.startedAt as string).getTime()) / 60000;
    if (minutesElapsed > 90) {
      dispatch(clearSession());
      await resumeFromBackendQueue();
      return;
    }

    setIsResuming(true);
    setResumeError(null);
    try {
      const queue = await queueService.getById(session.queueId);
      if (queue.status !== "IN_PROGRESS") {
        dispatch(clearSession());
        await resumeFromBackendQueue();
        return;
      }

      const [patient, visits, prescription, items, bill] = await Promise.all([
        patientService.getById(session.patientId!),
        visitService.getAllByPatientId(session.patientId!),
        prescriptionService.getById(session.prescriptionId!),
        prescriptionService.getItems(session.prescriptionId!),
        billingService.getById(session.billId!),
      ]);

      prescription.status = normalizePrescriptionStatus(prescription.status);

      setCurrentQueue(queue);
      setCurrentPatient(patient);
      setVisitHistory(visits);
      setCurrentPrescription(prescription);
      setPrescriptionItems(items);
      setCurrentBill(bill);
      setStatus("active");
    } catch (err: any) {
      console.error("Resume from session failed:", err);
      // If queue not found (404), clear session and try backend recovery
      if (err.response?.status === 404 || err.message?.includes('not found')) {
        dispatch(clearSession());
        await resumeFromBackendQueue();
      } else {
        setResumeError("Failed to resume consultation. Please try again.");
      }
    } finally {
      setIsResuming(false);
    }
  };

  const resumeFromBackendQueue = async () => {
    setIsResuming(true);
    setResumeError(null);
    try {
      const queues = await queueService.getAll(doctorId);
      const inProgressQueue = queues.find((q) => q.status === "IN_PROGRESS");
      
      if (!inProgressQueue) {
        setIsResuming(false);
        return;
      }

      const visits = await visitService.getAllByPatientId(inProgressQueue.patientId);
      if (!visits || visits.length === 0) {
        console.error("No visits found for patient during resume");
        setIsResuming(false);
        return;
      }

      const latestVisit = visits[0];
      const prescription = await prescriptionService.getByVisitId(latestVisit.id);
      const bill = await billingService.getByPrescriptionId(prescription.id);
      const items = await prescriptionService.getItems(prescription.id);
      const patient = await patientService.getById(inProgressQueue.patientId);

      prescription.status = normalizePrescriptionStatus(prescription.status);

      setCurrentQueue(inProgressQueue);
      setCurrentPatient(patient);
      setVisitHistory(visits);
      setCurrentPrescription(prescription);
      setPrescriptionItems(items);
      setCurrentBill(bill);
      setStatus("active");

      dispatch(startSession({
        queueId: inProgressQueue.id,
        patientId: inProgressQueue.patientId,
        visitId: latestVisit.id,
        prescriptionId: prescription.id,
        billId: bill.id,
        startedAt: inProgressQueue.inProgressAt ?? new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error("Resume from backend queue failed:", err);
      setResumeError("Failed to resume consultation. Please try again.");
    } finally {
      setIsResuming(false);
    }
  };

  useEffect(() => {
    if (status === "idle") {
      resumeFromSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      dispatch(startSession({
        queueId: result.queue.id,
        patientId: result.queue.patientId,
        visitId: result.prescription.visitId,
        prescriptionId: result.prescription.id,
        billId: result.bill.id,
        startedAt: new Date().toISOString(),
      }));
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

    if (!session.clinicalNotes.trim()) {
      setClinicalNotesError("Clinical notes are required before completing the consultation.");
      document.getElementById("clinical-notes")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const result = await finalizeConsultation(
      currentQueue.id,
      currentPrescription.visitId,
      currentPrescription.id,
      currentBill.id,
      session.clinicalNotes,
      session.doctorDiscountPct,
      session.pharmacyDiscountPct
    );

    if (result?.success) {
      dispatch(clearSession());
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
    dispatch(clearSession());
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
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Doctor Consultation Workspace"
        subtitle="Review the patient queue, manage prescriptions, and complete consultations."
      />

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
              value={session.clinicalNotes}
              onChange={(value) => {
                dispatch(setClinicalNotes(value));
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
            <SectionCard title="Billing & Discounts">
              <BillingSection
                key={billingResetKey}
                billId={currentBill.id}
                hasPrescriptionItems={prescriptionItems.length > 0}
                disabled={isCascadeRunning}
                onCalculate={handleCalculate}
                doctorDiscountPct={session.doctorDiscountPct}
                pharmacyDiscountPct={session.pharmacyDiscountPct}
                onDiscountsChange={(d, p) => dispatch(setDiscounts({ doctorDiscountPct: d, pharmacyDiscountPct: p }))}
              />
            </SectionCard>
          )}

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              color="success"
              startIcon={<SendIcon />}
              onClick={handleComplete}
              disabled={isCascadeRunning || !currentPrescription || !currentBill}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  boxShadow: 0,
                },
              }}
            >
              Complete Consultation & Send Prescription
            </Button>
          </Box>
        </>
      )}

      {showCompletionModal && currentQueue && currentPatient && (
        <CompletionModal
          open={showCompletionModal}
          queueNumber={currentQueue.queueNumber}
          patientName={`${currentPatient.firstName} ${currentPatient.lastName}`}
          onClose={handleCloseCompletion}
        />
      )}

      <Backdrop open={isCascadeRunning || isResuming || !!error} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ textAlign: "center", color: "white", maxWidth: 500, px: 3 }}>
          <CircularProgress color="inherit" sx={{ mb: 2 }} />
          <Typography variant="h6">
            {isResuming ? "Resuming consultation..." : isInitiating ? "Starting consultation..." : "Completing consultation..."}
          </Typography>
          {cascadeStep > 0 && !isResuming && (
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
          {resumeError && (
            <>
              <Typography color="error" sx={{ mt: 2 }}>
                {resumeError}
              </Typography>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => session.queueId ? resumeFromSession() : resumeFromBackendQueue()}
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
