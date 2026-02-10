import { useQuery } from "@tanstack/react-query";
import { fetchEngagementContacts, EngagementContact, fetchEngagements } from "@/services/odata";

export function useEngagementContacts(vendorId?: string) {
  return useQuery<EngagementContact[], Error>({
    queryKey: ["engagementContacts", vendorId],
    queryFn: async () => {
      console.log("[useEngagementContacts] Fetching contacts for vendor:", vendorId || "all");

      // If vendor ID is provided, filter contacts by vendor's engagements
      if (vendorId) {
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

        // Filter contacts to only those assigned to vendor's engagements
        // Contacts can have status "Assigned" (with engagementId) or "Not Assigned"
        const filteredContacts = allContacts.filter(contact => {
          // Include if contact is assigned to one of the vendor's engagements
          if (contact.engagementId && vendorEngagementIds.has(contact.engagementId)) {
            return true;
          }
          // For now, also include unassigned contacts (status "Not Assigned")
          // as they might be intended for this vendor
          if (contact.status === "Not Assigned") {
            return true;
          }
          return false;
        });

        console.log("[useEngagementContacts] Filtered contacts:", {
          total: allContacts.length,
          vendorEngagements: engagements.length,
          filtered: filteredContacts.length,
        });

        return filteredContacts;
      } else {
        // If no vendor ID, return all contacts (fallback)
        console.log("[useEngagementContacts] No vendor ID provided, returning all contacts");
        return fetchEngagementContacts();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: !!vendorId, // Only run query if vendorId is provided
  });
}
