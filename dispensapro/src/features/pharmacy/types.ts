export interface Medicine {
  id?: string;             
  name: string;
  form: string;            // e.g., Tablet, Capsule, Syrup
  strength: string;        // e.g., 500mg, 25mg/mL
  unitOfMeasurement: string | null;      // Unit of Measure (e.g., mg, mL, unit)
  sellPrice: number;
  reorderLevel: number;    // Stock level that triggers a reorder alert
  quantity: number;        // Current stock quantity
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}


export interface MedicineFormValues {
  name: string;
  form: string;
  strength: number | "";
  unitOfMeasurement: string;
  sellPrice: number;
  quantity: number;
  reorderLevel: number;
}


export interface Distributor {
  id?: string;
  name: string;
  contact: string;
  address: string;
  createdAt?: string;
}

export interface DistributorFormValues {
  name: string;
  contact: string;
  address: string;
}