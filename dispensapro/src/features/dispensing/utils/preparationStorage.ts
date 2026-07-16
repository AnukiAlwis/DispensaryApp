import { MedicineStatus } from "../types";

export interface PreparationState {
  prescriptionId: string;
  medicineStatuses: Record<string, MedicineStatus>;
}

const STORAGE_KEY = "dispensing_preparation_state";

export const loadState = (): PreparationState | undefined => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return undefined;
    }
    return JSON.parse(stored) as PreparationState;
  } catch (error) {
    return undefined;
  }
};

export const saveState = (state: PreparationState): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore quota errors
  }
};

export const clearState = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore errors
  }
};

export const hasActiveSession = (): boolean => {
  const state = loadState();
  return state !== undefined;
};
