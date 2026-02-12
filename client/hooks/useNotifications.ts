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
        console.log("[useNotifications] Contact ID not available yet, skipping fetch");
        throw new Error("Contact ID is required to fetch notifications");
      }
      console.log("[useNotifications] Fetching notifications for contact:", contactId);
      return fetchNotifications(contactId);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if there's no contact ID
      if (error.message.includes("Contact ID is required")) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    enabled: !!contactId, // Only run query if contactId is available
  });

  // Suppress error logging in the hook since errors are expected (e.g., when contactId is not available)
  if (query.error && query.error.message.includes("Contact ID is required")) {
    return {
      ...query,
      error: null,
      data: [],
    } as any;
  }

  return query;
}
