import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Notification, fetchNotifications } from "@/services/notifications";

/**
 * React Query hook for fetching notifications
 * Handles loading, error, and caching states
 * @param contactId - The contact ID to fetch notifications for
 */
export function useNotifications(contactId?: string): UseQueryResult<Notification[], Error> {
  const query = useQuery({
    queryKey: ["notifications", contactId],
    queryFn: () => {
      if (!contactId) {
        throw new Error("Contact ID is required to fetch notifications");
      }
      console.log("[useNotifications] Fetching notifications for contact:", contactId);
      return fetchNotifications(contactId);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!contactId, // Only run query if contactId is available
  });

  return query;
}
