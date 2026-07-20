import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });
}
