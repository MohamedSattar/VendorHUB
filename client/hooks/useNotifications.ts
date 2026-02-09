import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Notification, fetchNotifications } from "@/services/notifications";

/**
 * React Query hook for fetching notifications
 * Handles loading, error, and caching states
 */
export function useNotifications(): UseQueryResult<Notification[], Error> {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => {
      console.log("[useNotifications] Fetching notifications");
      return fetchNotifications();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return query;
}
