import { useQuery } from "@tanstack/react-query";
import { fetchEngagementContacts, EngagementContact, fetchEngagements } from "@/services/odata";

export function useEngagementContacts(vendorId?: string) {
  return useQuery<EngagementContact[], Error>({
    queryKey: ["engagementContacts", vendorId],
    queryFn: async () => {
      console.log("[useEngagementContacts] Fetching contacts for vendor:", vendorId || "all");

      // If vendor ID is provided, filter contacts by vendor's engagements
      if (vendorId) {
        try {
          // Fetch all engagements for the vendor
          const engagements = await fetchEngagements(vendorId);
          const vendorEngagementIds = new Set(engagements.map(e => e.id));

          console.log("[useEngagementContacts] Found vendor engagements:", {
            vendorId,
            engagementCount: engagements.length,
            engagementIds: Array.from(vendorEngagementIds),
          });

          // Fetch contacts (passing vendorId for API logging/tracking)
          const allContacts = await fetchEngagementContacts(vendorId);

          console.log("[useEngagementContacts] All fetched contacts:", {
            count: allContacts.length,
            contacts: allContacts.map(c => ({
              id: c.id,
              name: c.name,
              engagementId: c.engagementId,
              status: c.status,
            })),
          });

          // Filter contacts to only those assigned to vendor's engagements
          const filteredContacts = allContacts.filter(contact => {
            // Only include contacts that are assigned to the vendor's engagements
            const isAssignedToVendorEngagement =
              contact.engagementId && vendorEngagementIds.has(contact.engagementId);

            console.log(`[useEngagementContacts] Contact ${contact.name}:`, {
              engagementId: contact.engagementId,
              isInVendorEngagements: isAssignedToVendorEngagement,
              included: isAssignedToVendorEngagement,
            });

            return isAssignedToVendorEngagement;
          });

          console.log("[useEngagementContacts] Filtered contacts:", {
            total: allContacts.length,
            vendorEngagements: engagements.length,
            filtered: filteredContacts.length,
            filteredList: filteredContacts.map(c => c.name),
          });

          return filteredContacts;
        } catch (error) {
          console.error("[useEngagementContacts] Error filtering contacts:", error);
          throw error;
        }
      } else {
        // If no vendor ID, return empty array instead of all contacts
        console.log("[useEngagementContacts] No vendor ID provided, returning empty array");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
