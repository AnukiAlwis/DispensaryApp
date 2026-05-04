import { useEffect, useState } from "react";
import { distributorService } from "../services/distributorService";
import { Distributor } from "../types";

export default function useDistributor() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await distributorService.getAll();
      setDistributors(data);
    } catch (err) {
      setError("Failed to fetch distributors.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addDistributor = async (distributor: Omit<Distributor, "id">) => {
    await distributorService.create(distributor);
    await fetchDistributors(); // Refresh table after add
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  return { distributors, loading, error, fetchDistributors, addDistributor };
}
