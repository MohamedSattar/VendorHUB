/**
 * Authentication Service
 * Handles email/password login, registration, and invitation flow
 */

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends UserCredentials {
  firstName: string;
  lastName: string;
  organizationName: string;
  invitationCode?: string; // Used when registering via invitation
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  };
  accessToken: string;
  message?: string;
}

export interface InvitationInfo {
  id: string;
  email: string;
  organizationName: string;
  invitedBy: string;
  invitedAt: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
}

/**
 * Login with email and password
 */
export async function loginWithEmailPassword(
  credentials: UserCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();

    // Store authentication data locally
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  data: RegistrationData
): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const responseData = await response.json();

    // Store authentication data locally
    if (responseData.accessToken) {
      localStorage.setItem("accessToken", responseData.accessToken);
      localStorage.setItem("user", JSON.stringify(responseData.user));
    }

    return responseData;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Verify an invitation code
 * Used to check if an invitation is valid before registration
 */
export async function verifyInvitation(
  invitationCode: string
): Promise<InvitationInfo> {
  try {
    const response = await fetch(`/api/auth/invitations/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invitationCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Invalid invitation");
    }

    return await response.json();
  } catch (error) {
    console.error("Invitation verification error:", error);
    throw error;
  }
}

/**
 * Get invitation details from query parameter
 * Used when user clicks invitation link
 */
export async function getInvitationDetails(
  invitationCode: string
): Promise<InvitationInfo> {
  try {
    const response = await fetch(
      `/api/auth/invitations/${invitationCode}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Invitation not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching invitation details:", error);
    throw error;
  }
}

/**
 * Logout current user
 */
export function logout(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): any | null {
  try {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("accessToken");
}
