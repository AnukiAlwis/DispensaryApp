import { useState } from "react";
import { prescriptionService } from "../services/prescriptionService";
import { PrescriptionItem, PrescriptionItemRequestDto } from "../types";

interface UsePrescriptionResult {
  items: PrescriptionItem[];
  isAdding: boolean;
  error: string | null;
  addItem: (
    prescriptionId: string,
    item: PrescriptionItemRequestDto
  ) => Promise<PrescriptionItem | null>;
  getItems: (prescriptionId: string) => Promise<void>;
  calculateQuantity: (
    dosage: string,
    frequency: string,
    duration: number
  ) => number;
}

const parseFrequency = (freq: string): number => {
  const lower = freq.toLowerCase();
  if (lower.includes("after meals") || lower.includes("before meals"))
    return 3;
  if (lower.includes("twice daily") || lower.includes("2 times")) return 2;
  return 1;
};

export const usePrescription = (): UsePrescriptionResult => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (
    prescriptionId: string,
    item: PrescriptionItemRequestDto
  ): Promise<PrescriptionItem | null> => {
    setIsAdding(true);
    setError(null);

    try {
      const newItem = await prescriptionService.addItem(prescriptionId, item);
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message || "Failed to add prescription item");
      return null;
    } finally {
      setIsAdding(false);
    }
  };

  const getItems = async (prescriptionId: string): Promise<void> => {
    setError(null);

    try {
      const fetchedItems = await prescriptionService.getItems(prescriptionId);
      setItems(fetchedItems);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prescription items");
    }
  };

  const calculateQuantity = (
    dosage: string,
    frequency: string,
    duration: number
  ): number => {
    const units = parseInt(dosage.match(/\d+/)?.[0] || "1");
    const timesPerDay = parseFrequency(frequency);
    return units * timesPerDay * duration;
  };

  return {
    items,
    isAdding,
    error,
    addItem,
    getItems,
    calculateQuantity,
  };
};
