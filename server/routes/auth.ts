import { RequestHandler } from "express";
import { getAuthHeaders } from "../services/azureAuth";

/**
 * OAuth 2.0 Token Exchange Handler
 * POST /api/auth/exchange-token
 * Exchanges authorization code for access and refresh tokens
 */
export const handleExchangeToken: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // In production, exchange code with Azure B2C for real tokens
    // For now, return mock tokens
    const accessToken = Buffer.from(
      JSON.stringify({
        aud: "your-app-id",
        iss: "https://login.microsoftonline.com/",
        exp: Date.now() + 3600000,
      })
    ).toString("base64");

    const refreshToken = Buffer.from(
      JSON.stringify({ type: "refresh", exp: Date.now() + 86400000 })
    ).toString("base64");

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    res.status(500).json({ error: "Token exchange failed" });
  }
};

/**
 * OAuth 2.0 Token Refresh Handler
 * POST /api/auth/refresh-token
 * Refreshes an access token using a refresh token
 */
export const handleRefreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // In production, validate refresh token with Azure B2C
    const newAccessToken = Buffer.from(
      JSON.stringify({
        aud: "your-app-id",
        iss: "https://login.microsoftonline.com/",
        exp: Date.now() + 3600000,
      })
    ).toString("base64");

    res.json({
      accessToken: newAccessToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
};

/**
 * Get User Info Handler
 * POST /api/auth/user-info
 * Fetches user profile information from Azure B2C
 */
export const handleGetUserInfo: RequestHandler = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    // In production, validate token and fetch user info from Azure B2C
    const userInfo = {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      givenName: "John",
      familyName: "Doe",
    };

    res.json(userInfo);
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

/**
 * Forgot Password Handler
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 */
export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log("[Auth] Forgot password request for email:", email);

    // In production:
    // 1. Find user by email in CRM
    // 2. Generate reset token
    // 3. Save token to CRM with expiration
    // 4. Send reset email with token link
    // For now, just return success

    res.json({
      success: true,
      message: "Password reset link sent to email",
      email: email,
    });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    res.status(500).json({
      error: "Failed to process password reset",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reset Password Handler
 * POST /api/auth/reset-password
 * Completes password reset with token
 */
export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        error: "Token and passwords are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    console.log("[Auth] Reset password request with token");

    // In production:
    // 1. Validate reset token
    // 2. Check token expiration
    // 3. Update user password in CRM
    // 4. Invalidate token
    // For now, just return success

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({
      error: "Failed to reset password",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============================================================
// Email/Password Authentication and Invitation Flow
// ============================================================

interface CrmUser {
  prmtk_contactid: string;
  prmtk_email: string;
  prmtk_firstname: string;
  prmtk_lastname: string;
  prmtk_organizationname?: string;
  statuscode: number;
}

interface InvitationRecord {
  prmtk_invitationid: string;
  prmtk_email: string;
  prmtk_organizationname: string;
  prmtk_invitedby?: string;
  createdon: string;
  prmtk_expiresat: string;
  prmtk_status: number; // 1 = pending, 2 = accepted, 3 = expired
}

interface AdxInvitationRecord {
  adx_invitationid: string;
  adx_invitationemail: string;
  adx_invitationcode: string;
  createdon: string;
  adx_expirationdate: string;
  statecode: number; // 0 = inactive, 1 = active
  statuscode: number;
}

const ODATA_BASE_URL =
  process.env.DATAVERSE_RESOURCE?.replace(/\/$/, "")
    .replace(/\/\.default$/, "") || "https://ecavendorhubspa.crm15.dynamics.com";
const API_ENDPOINT = `${ODATA_BASE_URL}/api/data/v9.2`;

/**
 * Login with email and password
 * POST /api/auth/login
 * DEVELOPMENT MODE: Bypasses password validation, accepts any password
 * Only validates email address (for development/testing purposes)
 * In production, uncomment password validation code below
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Note: Password is not required in development mode for testing
    if (!password) {
      return res.status(400).json({
        error: "Password is required",
      });
    }

    console.log("[Auth] Login attempt for email:", email);
    console.log("[Auth] DEVELOPMENT MODE: Password validation bypassed");

    // Query CRM for user by email
    const authHeaders = await getAuthHeaders();
    const queryUrl = `${API_ENDPOINT}/prmtk_contacts?$filter=prmtk_email%20eq%20'${encodeURIComponent(
      email
    )}'&$select=prmtk_contactid,prmtk_email,prmtk_firstname,prmtk_lastname,prmtk_organizationname,statuscode`;

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: authHeaders,
    });

    if (!response.ok) {
      console.error("[Auth] CRM query failed:", response.status, response.statusText);
      // Fallback: Create a temporary user for development
      console.log("[Auth] Creating temporary test user for development");
      return res.json({
        success: true,
        user: {
          id: `temp-${Date.now()}`,
          email: email,
          firstName: email.split("@")[0].split(".")[0],
          lastName: email.split("@")[0].split(".")[1] || "User",
          organizationName: "Test Organization",
        },
        accessToken: Buffer.from(
          JSON.stringify({
            sub: `temp-${Date.now()}`,
            email: email,
            iat: Date.now(),
            isDevelopment: true,
          })
        ).toString("base64"),
      });
    }

    const data = await response.json();

    // If user found in CRM, use their data
    if (data.value && data.value.length > 0) {
      const user: CrmUser = data.value[0];
      console.log("[Auth] User found in CRM, logging in:", user.prmtk_email);

      // Generate access token (in production, use JWT)
      const accessToken = Buffer.from(
        JSON.stringify({
          sub: user.prmtk_contactid,
          email: user.prmtk_email,
          iat: Date.now(),
        })
      ).toString("base64");

      return res.json({
        success: true,
        user: {
          id: user.prmtk_contactid,
          email: user.prmtk_email,
          firstName: user.prmtk_firstname,
          lastName: user.prmtk_lastname,
          organizationName: user.prmtk_organizationname,
        },
        accessToken,
      });
    }

    // Fallback: Create temporary user if not found (development only)
    console.log("[Auth] User not found in CRM, creating temporary test user for development");
    return res.json({
      success: true,
      user: {
        id: `temp-${Date.now()}`,
        email: email,
        firstName: email.split("@")[0].split(".")[0],
        lastName: email.split("@")[0].split(".")[1] || "User",
        organizationName: "Test Organization",
      },
      accessToken: Buffer.from(
        JSON.stringify({
          sub: `temp-${Date.now()}`,
          email: email,
          iat: Date.now(),
          isDevelopment: true,
        })
      ).toString("base64"),
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName, invitationCode } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !organizationName) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    console.log("[Auth] Registration attempt for email:", email);

    // If invitation code provided, verify it first
    if (invitationCode) {
      console.log("[Auth] Verifying invitation code:", invitationCode);
      // Invitation verification logic would go here
      // For now, we'll accept any invitation code
    }

    // Create user in CRM
    const authHeaders = await getAuthHeaders();
    const contactRecord = {
      prmtk_email: email,
      prmtk_firstname: firstName,
      prmtk_lastname: lastName,
      prmtk_organizationname: organizationName,
      prmtk_passwordhash: Buffer.from(password).toString("base64"), // In production, use bcrypt or similar
      statuscode: 1, // Active
    };

    const createResponse = await fetch(`${API_ENDPOINT}/prmtk_contacts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(contactRecord),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("[Auth] CRM create failed:", createResponse.status, errorText);

      // If email already exists, try to log in instead
      if (createResponse.status === 409 || createResponse.status === 400) {
        return res.status(409).json({
          error: "Email already registered. Please login or use a different email.",
        });
      }

      return res.status(500).json({
        error: "Failed to create account",
      });
    }

    const newUser = await createResponse.json();
    console.log("[Auth] User created successfully:", newUser.prmtk_contactid);

    // If invitation code provided, mark it as accepted
    if (invitationCode) {
      console.log("[Auth] Marking invitation as accepted");
      // Update invitation status in CRM
    }

    // Generate access token
    const accessToken = Buffer.from(
      JSON.stringify({
        sub: newUser.prmtk_contactid,
        email: email,
        iat: Date.now(),
      })
    ).toString("base64");

    res.status(201).json({
      success: true,
      user: {
        id: newUser.prmtk_contactid,
        email: email,
        firstName,
        lastName,
        organizationName,
      },
      accessToken,
    });
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Verify an invitation code
 * POST /api/auth/invitations/verify
 * Uses standard Microsoft CRM adx_invitation table
 */
export const handleVerifyInvitation: RequestHandler = async (req, res) => {
  try {
    const { invitationCode } = req.body;

    if (!invitationCode) {
      return res.status(400).json({
        error: "Invitation code is required",
      });
    }

    console.log("[Auth] Verifying invitation code from adx_invitation:", invitationCode);

    // Query CRM for invitation using standard adx_invitation table
    const authHeaders = await getAuthHeaders();
    const queryUrl = `${API_ENDPOINT}/adx_invitations?$filter=adx_invitationcode%20eq%20'${encodeURIComponent(
      invitationCode
    )}'&$select=adx_invitationid,adx_invitationemail,adx_invitationcode,createdon,adx_expirationdate,statecode,statuscode`;

    console.log("[Auth] Querying adx_invitation table:", queryUrl);

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: authHeaders,
    });

    if (!response.ok) {
      console.error("[Auth] Invitation query failed:", response.status);
      return res.status(400).json({
        error: "Invalid invitation",
      });
    }

    const data = await response.json();

    if (!data.value || data.value.length === 0) {
      console.warn("[Auth] Invitation not found in adx_invitation:", invitationCode);
      return res.status(400).json({
        error: "Invitation not found",
      });
    }

    const invitation: AdxInvitationRecord = data.value[0];

    // Check if invitation is active (statecode = 1)
    if (invitation.statecode !== 1) {
      console.warn("[Auth] Invitation is inactive:", invitationCode);
      return res.status(400).json({
        error: "Invitation is not active",
      });
    }

    // Check if invitation is expired
    if (invitation.adx_expirationdate) {
      const expiryDate = new Date(invitation.adx_expirationdate);
      if (expiryDate < new Date()) {
        console.warn("[Auth] Invitation expired:", invitationCode);
        return res.status(400).json({
          error: "Invitation has expired",
        });
      }
    }

    console.log("[Auth] Invitation verified successfully from adx_invitation");

    res.json({
      id: invitation.adx_invitationid,
      email: invitation.adx_invitationemail,
      organizationName: "Portal User", // Default since adx_invitation doesn't have org field
      invitedBy: "Administrator",
      invitedAt: invitation.createdon,
      status: invitation.statecode === 1 ? "pending" : "inactive",
      expiresAt: invitation.adx_expirationdate,
    });
  } catch (error) {
    console.error("[Auth] Invitation verification error:", error);
    res.status(500).json({
      error: "Failed to verify invitation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get invitation details
 * GET /api/auth/invitations/:code
 * Uses standard Microsoft CRM adx_invitation table
 */
export const handleGetInvitation: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        error: "Invitation code is required",
      });
    }

    console.log("[Auth] Fetching invitation details from adx_invitation for code:", code);

    // Query CRM for invitation using standard adx_invitation table
    const authHeaders = await getAuthHeaders();
    const queryUrl = `${API_ENDPOINT}/adx_invitations?$filter=adx_invitationcode%20eq%20'${encodeURIComponent(
      code
    )}'&$select=adx_invitationid,adx_invitationemail,adx_invitationcode,createdon,adx_expirationdate,statecode,statuscode`;

    console.log("[Auth] Querying adx_invitation table:", queryUrl);

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: authHeaders,
    });

    if (!response.ok) {
      console.error("[Auth] Invitation query failed:", response.status);
      return res.status(400).json({
        error: "Invalid invitation",
      });
    }

    const data = await response.json();

    if (!data.value || data.value.length === 0) {
      console.warn("[Auth] Invitation not found in adx_invitation:", code);
      return res.status(400).json({
        error: "Invitation not found",
      });
    }

    const invitation: AdxInvitationRecord = data.value[0];

    // Check if invitation is active (statecode = 1)
    if (invitation.statecode !== 1) {
      console.warn("[Auth] Invitation is inactive:", code);
      return res.status(400).json({
        error: "Invitation is not active",
      });
    }

    // Check if invitation is expired
    if (invitation.adx_expirationdate) {
      const expiryDate = new Date(invitation.adx_expirationdate);
      if (expiryDate < new Date()) {
        console.warn("[Auth] Invitation expired:", code);
        return res.status(400).json({
          error: "Invitation has expired",
        });
      }
    }

    console.log("[Auth] Invitation retrieved successfully from adx_invitation");

    res.json({
      id: invitation.adx_invitationid,
      email: invitation.adx_invitationemail,
      organizationName: "Portal User", // Default since adx_invitation doesn't have org field
      invitedBy: "Administrator",
      invitedAt: invitation.createdon,
      status: invitation.statecode === 1 ? "pending" : "inactive",
      expiresAt: invitation.adx_expirationdate,
    });
  } catch (error) {
    console.error("[Auth] Get invitation error:", error);
    res.status(500).json({
      error: "Failed to fetch invitation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
