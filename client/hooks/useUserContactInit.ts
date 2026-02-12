import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContact } from "@/contexts/UserContactContext";

/**
 * Hook to automatically load the user contact profile from CRM on mount
 * This should be called once per session (typically in the header component)
 * Ensures the user contact data (contactId, email, etc.) is available before pages that need it
 */
export function useUserContactInit() {
  const { loggedInEmail, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { loggedInContact, setLoggedInContact } = useUserContact();
  const initializeRef = useRef(false);

  useEffect(() => {
    // Only initialize once per session
    if (initializeRef.current || !isAuthenticated || isAuthLoading) {
      return;
    }

    // If contact is already loaded, no need to fetch again
    if (loggedInContact?.contactId) {
      console.log("[User Contact Init] Contact already loaded from localStorage");
      initializeRef.current = true;
      return;
    }

    const loadUserContact = async () => {
      try {
        if (!loggedInEmail) {
          console.warn("[User Contact Init] No logged-in email available");
          return;
        }

        console.log("[User Contact Init] Loading user contact profile for email:", loggedInEmail);

        const response = await fetch("/api/auth/contact-by-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: loggedInEmail }),
        });

        if (!response.ok) {
          console.warn("[User Contact Init] Failed to load contact profile:", response.status);
          return;
        }

        const contact = await response.json();
        console.log("[User Contact Init] Contact profile loaded successfully");

        // Map CRM response to LoggedInContactData
        const contactDataToStore = {
          contactId: contact.prmtk_contactid,
          email: contact.prmtk_email || loggedInEmail || "",
          firstName: contact.prmtk_firstname || "",
          lastName: contact.prmtk_lastname || "",
          mobileNumber: contact.prmtk_mobilenumber,
          preferredContactMethod:
            contact.preferredcontactmethodcode === 2
              ? "phone"
              : contact.preferredcontactmethodcode === 3
                ? "sms"
                : "email",
          accountStatus: contact.statuscode === 1 ? "Active" : "Inactive",
          memberSince: contact.createdon,
          userRole: "User" as const,
          vendorId: contact.prmtk_vendor_id,
          vendorName: contact.prmtk_vendor_name,
        };

        setLoggedInContact(contactDataToStore);
        initializeRef.current = true;
      } catch (error) {
        console.error("[User Contact Init] Error loading user contact:", error);
        // Don't mark as initialized if there's an error
        // This allows retry on next mount
      }
    };

    loadUserContact();
  }, [isAuthenticated, isAuthLoading, loggedInEmail, loggedInContact?.contactId, setLoggedInContact]);
}
