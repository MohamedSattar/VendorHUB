import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface LoggedInContactData {
  contactId: string;
  email: string;
  firstName: string;
  lastName: string;
  vendorId?: string;
  vendorName?: string;
  accountStatus: "Active" | "Inactive";
  memberSince: string;
  userRole: "Vendor" | "Admin" | "User";
  mobileNumber?: string;
  preferredContactMethod?: "email" | "phone" | "sms";
}

interface UserContactContextType {
  loggedInContact: LoggedInContactData | null;
  isLoading: boolean;
  setLoggedInContact: (contact: LoggedInContactData) => void;
  clearLoggedInContact: () => void;
  getVendorId: () => string | undefined;
  getContactId: () => string | undefined;
  getVendorName: () => string | undefined;
}

const UserContactContext = createContext<UserContactContextType | undefined>(undefined);

interface UserContactProviderProps {
  children: ReactNode;
}

export function UserContactProvider({ children }: UserContactProviderProps) {
  const [loggedInContact, setLoggedInContactState] = useState<LoggedInContactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize contact data from localStorage on mount
  useEffect(() => {
    try {
      const storedContact = localStorage.getItem("loggedInContact");
      if (storedContact) {
        const parsedContact = JSON.parse(storedContact);
        setLoggedInContactState(parsedContact);
        console.log("[UserContactContext] Restored logged-in contact from localStorage:", parsedContact);
      }
    } catch (error) {
      console.error("[UserContactContext] Failed to restore contact from localStorage:", error);
    }
  }, []);

  const setLoggedInContact = (contact: LoggedInContactData) => {
    console.log("[UserContactContext] Setting logged-in contact:", contact);
    setLoggedInContactState(contact);
    // Persist to localStorage for persistence across sessions
    localStorage.setItem("loggedInContact", JSON.stringify(contact));
  };

  const clearLoggedInContact = () => {
    console.log("[UserContactContext] Clearing logged-in contact");
    setLoggedInContactState(null);
    localStorage.removeItem("loggedInContact");
  };

  const getVendorId = (): string | undefined => {
    return loggedInContact?.vendorId;
  };

  const getContactId = (): string | undefined => {
    return loggedInContact?.contactId;
  };

  const getVendorName = (): string | undefined => {
    return loggedInContact?.vendorName;
  };

  const value: UserContactContextType = {
    loggedInContact,
    isLoading,
    setLoggedInContact,
    clearLoggedInContact,
    getVendorId,
    getContactId,
    getVendorName,
  };

  return (
    <UserContactContext.Provider value={value}>
      {children}
    </UserContactContext.Provider>
  );
}

export function useUserContact(): UserContactContextType {
  const context = useContext(UserContactContext);
  if (context === undefined) {
    throw new Error("useUserContact must be used within a UserContactProvider");
  }
  return context;
}
