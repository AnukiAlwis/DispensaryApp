import { useState, useEffect } from "react";
import { billingService } from "../services/billingService";
import { BillCalculateResponseDto } from "../types";

interface UseBillingResult {
  doctorFee: number;
  medicineTotal: number;
  doctorDiscountPct: number;
  pharmacyDiscountPct: number;
  totalAmount: number;
  isCalculating: boolean;
  error: string | null;
  calculate: (billId: string) => Promise<BillCalculateResponseDto | null>;
  updateDiscounts: (doctorPct: number, pharmacyPct: number) => void;
  calculateTotal: () => number;
}

export const useBilling = (): UseBillingResult => {
  const [doctorFee, setDoctorFee] = useState(0);
  const [medicineTotal, setMedicineTotal] = useState(0);
  const [doctorDiscountPct, setDoctorDiscountPct] = useState(0);
  const [pharmacyDiscountPct, setPharmacyDiscountPct] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (): number => {
    const doctorNet = doctorFee * (1 - doctorDiscountPct / 100);
    const medicineNet = medicineTotal * (1 - pharmacyDiscountPct / 100);
    return parseFloat((doctorNet + medicineNet).toFixed(2));
  };

  useEffect(() => {
    setTotalAmount(calculateTotal());
  }, [doctorFee, medicineTotal, doctorDiscountPct, pharmacyDiscountPct]);

  const calculate = async (
    billId: string
  ): Promise<BillCalculateResponseDto | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const result = await billingService.calculate(billId);
      setDoctorFee(result.doctorFee ?? 0);
      setMedicineTotal(result.medicineTotal ?? 0);
      setTotalAmount(result.grandTotal ?? result.totalAmount ?? 0);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to calculate bill");
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const updateDiscounts = (doctorPct: number, pharmacyPct: number): void => {
    setDoctorDiscountPct(doctorPct);
    setPharmacyDiscountPct(pharmacyPct);
  };

  return {
    doctorFee,
    medicineTotal,
    doctorDiscountPct,
    pharmacyDiscountPct,
    totalAmount,
    isCalculating,
    error,
    calculate,
    updateDiscounts,
    calculateTotal,
  };
};
