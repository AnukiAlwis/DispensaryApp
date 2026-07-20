import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "../../Queues/services/QueueService";
import { visitService } from "../../visits/services/visitService";
import { prescriptionService } from "../services/prescriptionService";
import { billingService } from "../services/billingService";
import { InitiationCascadeResult, FinalizationCascadeResult } from "../types";

interface UseConsultationResult {
  isInitiating: boolean;
  isFinalizing: boolean;
  cascadeStep: number;
  error: string | null;
  initiateConsultation: (
    queueId: string,
    patientId: string
  ) => Promise<InitiationCascadeResult | null>;
  finalizeConsultation: (
    queueId: string,
    visitId: string,
    prescriptionId: string,
    billId: string,
    clinicalNotes: string,
    doctorDiscountPct: number,
    pharmacyDiscountPct: number
  ) => Promise<FinalizationCascadeResult | null>;
  // resumeConsultation disabled: doctor is assumed to remain in the same session after starting a consultation.
  retryInitiation: () => Promise<void>;
  retryFinalization: () => Promise<void>;
}

export const useConsultation = (): UseConsultationResult => {
  const [isInitiating, setIsInitiating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [cascadeStep, setCascadeStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [lastInitiationParams, setLastInitiationParams] = useState<{
    queueId: string;
    patientId: string;
  } | null>(null);

  const [lastFinalizationParams, setLastFinalizationParams] = useState<{
    queueId: string;
    visitId: string;
    prescriptionId: string;
    billId: string;
    clinicalNotes: string;
    doctorDiscountPct: number;
    pharmacyDiscountPct: number;
  } | null>(null);

  const startMutation = useMutation({
    mutationFn: (queueId: string) => queueService.start(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary", "today"] });
    }
  });

  const serveMutation = useMutation({
    mutationFn: (queueId: string) => queueService.serve(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary", "today"] });
    }
  });

  const updateDiscountsMutation = useMutation({
    mutationFn: ({ billId, discounts }: { billId: string, discounts: { doctorDiscountPct: number, pharmacyDiscountPct: number } }) => 
      billingService.updateDiscounts(billId, discounts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary", "today"] });
    }
  });

  const initiateConsultation = async (
    queueId: string,
    patientId: string
  ): Promise<InitiationCascadeResult | null> => {
    setIsInitiating(true);
    setError(null);
    setLastInitiationParams({ queueId, patientId });

    const steps = [
      "Starting consultation",
      "Loading patient history",
      "Creating prescription",
    ];

    try {
      setCascadeStep(1);
      const queue = await startMutation.mutateAsync(queueId);

      setCascadeStep(2);
      const visits = await visitService.getAllByPatientId(patientId);

      const latestVisit = visits && visits.length > 0 ? visits[0] : null;
      if (!latestVisit) {
        throw new Error("No visit found for patient");
      }

      setCascadeStep(3);
      const prescription = await prescriptionService.create({
        visitId: latestVisit.id,
        patientId,
      });

      setCascadeStep(3); // bill is created as part of step 3
      const bill = await billingService.create({
        visitId: latestVisit.id,
        patientId,
      });

      setCascadeStep(0);
      setIsInitiating(false);
      return { queue, visits, prescription, bill };
    } catch (err: any) {
      const errorMessage = `Failed at step ${cascadeStep}: ${
        steps[cascadeStep - 1]
      }. ${err.message || "Unknown error"}`;
      setError(errorMessage);
      setIsInitiating(false);
      return null;
    }
  };

  const finalizeConsultation = async (
    queueId: string,
    visitId: string,
    prescriptionId: string,
    billId: string,
    clinicalNotes: string,
    doctorDiscountPct: number,
    pharmacyDiscountPct: number
  ): Promise<FinalizationCascadeResult | null> => {
    setIsFinalizing(true);
    setError(null);
    setLastFinalizationParams({
      queueId,
      visitId,
      prescriptionId,
      billId,
      clinicalNotes,
      doctorDiscountPct,
      pharmacyDiscountPct,
    });

    const steps = [
      "Saving notes",
      "Saving discounts",
      "Calculating bill",
      "Locking prescription",
      "Completing consultation",
    ];

    try {
      setCascadeStep(1);
      await visitService.createNote(visitId, { note: clinicalNotes || "" });

      setCascadeStep(2);
      await updateDiscountsMutation.mutateAsync({
        billId,
        discounts: {
          doctorDiscountPct,
          pharmacyDiscountPct,
        }
      });

      setCascadeStep(3);
      await billingService.calculate(billId);

      setCascadeStep(4);
      await prescriptionService.updateStatus(prescriptionId, "ISSUED");

      setCascadeStep(5);
      await serveMutation.mutateAsync(queueId);

      setCascadeStep(0);
      setIsFinalizing(false);
      return { success: true, queueId };
    } catch (err: any) {
      const errorMessage = `Failed at step ${cascadeStep}: ${
        steps[cascadeStep - 1]
      }. ${err.message || "Unknown error"}`;
      setError(errorMessage);
      setIsFinalizing(false);
      return null;
    }
  };

  // resumeConsultation disabled: no session recovery needed because the doctor does not navigate away or refresh.
  // const resumeConsultation = async (
  //   queueId: string,
  //   patientId: string
  // ): Promise<InitiationCascadeResult | null> => {
  //   setIsInitiating(true);
  //   setError(null);
  //
  //   try {
  //     const queue = await queueService.getById(queueId);
  //     const visits = await visitService.getAllByPatientId(patientId);
  //
  //     const latestVisit = visits && visits.length > 0 ? visits[0] : null;
  //     if (!latestVisit) {
  //       throw new Error("No visit found for patient");
  //     }
  //
  //     const prescription = await prescriptionService.getById(
  //       latestVisit.id
  //     );
  //
  //     const bill = await billingService.getById(latestVisit.id);
  //
  //     setIsInitiating(false);
  //     return { queue, visits, prescription, bill };
  //   } catch (err: any) {
  //     const errorMessage = `Failed to resume consultation: ${
  //       err.message || "Unknown error"
  //     }`;
  //     setError(errorMessage);
  //     setIsInitiating(false);
  //     return null;
  //   }
  // };

  const retryInitiation = async (): Promise<void> => {
    if (lastInitiationParams) {
      await initiateConsultation(
        lastInitiationParams.queueId,
        lastInitiationParams.patientId
      );
    }
  };

  const retryFinalization = async (): Promise<void> => {
    if (lastFinalizationParams) {
      await finalizeConsultation(
        lastFinalizationParams.queueId,
        lastFinalizationParams.visitId,
        lastFinalizationParams.prescriptionId,
        lastFinalizationParams.billId,
        lastFinalizationParams.clinicalNotes,
        lastFinalizationParams.doctorDiscountPct,
        lastFinalizationParams.pharmacyDiscountPct
      );
    }
  };

  return {
    isInitiating,
    isFinalizing,
    cascadeStep,
    error,
    initiateConsultation,
    finalizeConsultation,
    // resumeConsultation disabled: no session recovery needed.
    retryInitiation,
    retryFinalization,
  };
};
