import { useEffect, useState } from "react";
import { medicineService } from "../services/medicineService";
import { Medicine } from "../types";

export default function useMedicine() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all medicines and updates the state.
   */
  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicineService.getAll();
      setMedicines(data);
    } catch (err) {
      setError("Failed to fetch medicines.");
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new medicine.
   */
  const addMedicine = async (medicine: Omit<Medicine, "id">) => {
    return await medicineService.create(medicine);
  };


  useEffect(() => {
    fetchMedicines();
  }, []);

  return {
    medicines,
    loading,
    error,
    fetchMedicines,
    addMedicine,
  };
}