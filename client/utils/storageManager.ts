/**
 * Storage Manager Utility
 * Centralized access to contact and vendor information in localStorage
 */

export interface StoredContactData {
  contactId: string;
  email: string;
  firstName: string;
  lastName: string;
  vendorId?: string;
  vendorName?: string;
  accountStatus?: string;
  memberSince?: string;
  userRole?: string;
  mobileNumber?: string;
  preferredContactMethod?: string;
}

/**
 * Get the stored contact data from localStorage
 */
export function getStoredContact(): StoredContactData | null {
  try {
    const stored = localStorage.getItem("loggedInContact");
    if (stored) {
      const contact = JSON.parse(stored);
      console.log("[StorageManager] Retrieved contact from localStorage:", {
        contactId: contact.contactId,
        vendorId: contact.vendorId,
        email: contact.email,
      });
      return contact;
    }
  } catch (error) {
    console.error("[StorageManager] Error retrieving contact from localStorage:", error);
  }
  return null;
}

/**
 * Get the stored contact ID
 */
export function getStoredContactId(): string | null {
  const contact = getStoredContact();
  return contact?.contactId || null;
}

/**
 * Get the stored vendor ID
 */
export function getStoredVendorId(): string | null {
  const contact = getStoredContact();
  return contact?.vendorId || null;
}

/**
 * Get the stored email
 */
export function getStoredEmail(): string | null {
  const contact = getStoredContact();
  return contact?.email || null;
}

/**
 * Check if contact data is available
 */
export function isContactDataAvailable(): boolean {
  const contact = getStoredContact();
  return !!(contact?.contactId && contact?.email);
}

/**
 * Log all stored contact data (for debugging)
 */
export function logStoredContactData(): void {
  const contact = getStoredContact();
  if (contact) {
    console.group("[StorageManager] Stored Contact Data");
    console.log("Contact ID:", contact.contactId);
    console.log("Vendor ID:", contact.vendorId);
    console.log("Email:", contact.email);
    console.log("First Name:", contact.firstName);
    console.log("Last Name:", contact.lastName);
    console.log("Vendor Name:", contact.vendorName);
    console.log("Account Status:", contact.accountStatus);
    console.log("User Role:", contact.userRole);
    console.groupEnd();
  } else {
    console.warn("[StorageManager] No contact data found in localStorage");
  }
}
