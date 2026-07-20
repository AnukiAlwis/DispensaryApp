import { useQuery } from "@tanstack/react-query";
import { summaryService, DailySummary } from "../services/summaryService";

export function useSummary() {
  return useQuery<DailySummary>({
    queryKey: ["summary", "today"],
    queryFn: summaryService.getTodaySummary,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
