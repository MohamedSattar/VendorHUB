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

const ODATA_BASE_URL =
  process.env.DATAVERSE_RESOURCE?.replace(/\/$/, "")
    .replace(/\/\.default$/, "") || "https://ecavendorhubspa.crm15.dynamics.com";
const API_ENDPOINT = `${ODATA_BASE_URL}/api/data/v9.2`;

/**
 * Login with email and password
 * POST /api/auth/login
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    console.log("[Auth] Login attempt for email:", email);

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
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const data = await response.json();

    if (!data.value || data.value.length === 0) {
      console.warn("[Auth] No user found for email:", email);
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user: CrmUser = data.value[0];

    // In production, verify password hash stored in CRM
    // For now, we'll accept any password and store it securely in CRM
    console.log("[Auth] User found:", user.prmtk_email);

    // Generate access token (in production, use JWT)
    const accessToken = Buffer.from(
      JSON.stringify({
        sub: user.prmtk_contactid,
        email: user.prmtk_email,
        iat: Date.now(),
      })
    ).toString("base64");

    res.json({
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
 */
export const handleVerifyInvitation: RequestHandler = async (req, res) => {
  try {
    const { invitationCode } = req.body;

    if (!invitationCode) {
      return res.status(400).json({
        error: "Invitation code is required",
      });
    }

    console.log("[Auth] Verifying invitation code:", invitationCode);

    // Query CRM for invitation
    const authHeaders = await getAuthHeaders();
    const queryUrl = `${API_ENDPOINT}/prmtk_invitations?$filter=prmtk_invitationcode%20eq%20'${encodeURIComponent(
      invitationCode
    )}'&$select=prmtk_invitationid,prmtk_email,prmtk_organizationname,prmtk_invitedby,createdon,prmtk_expiresat,prmtk_status`;

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
      console.warn("[Auth] Invitation not found:", invitationCode);
      return res.status(400).json({
        error: "Invitation not found",
      });
    }

    const invitation: InvitationRecord = data.value[0];

    // Check if invitation is expired
    const expiryDate = new Date(invitation.prmtk_expiresat);
    if (expiryDate < new Date()) {
      console.warn("[Auth] Invitation expired:", invitationCode);
      return res.status(400).json({
        error: "Invitation has expired",
      });
    }

    // Check if invitation is already accepted
    if (invitation.prmtk_status === 2) {
      console.warn("[Auth] Invitation already accepted:", invitationCode);
      return res.status(400).json({
        error: "Invitation already accepted",
      });
    }

    console.log("[Auth] Invitation verified successfully");

    res.json({
      id: invitation.prmtk_invitationid,
      email: invitation.prmtk_email,
      organizationName: invitation.prmtk_organizationname,
      invitedBy: invitation.prmtk_invitedby || "Administrator",
      invitedAt: invitation.createdon,
      status: invitation.prmtk_status === 1 ? "pending" : "expired",
      expiresAt: invitation.prmtk_expiresat,
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
 */
export const handleGetInvitation: RequestHandler = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        error: "Invitation code is required",
      });
    }

    console.log("[Auth] Fetching invitation details for code:", code);

    // Query CRM for invitation
    const authHeaders = await getAuthHeaders();
    const queryUrl = `${API_ENDPOINT}/prmtk_invitations?$filter=prmtk_invitationcode%20eq%20'${encodeURIComponent(
      code
    )}'&$select=prmtk_invitationid,prmtk_email,prmtk_organizationname,prmtk_invitedby,createdon,prmtk_expiresat,prmtk_status`;

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
      console.warn("[Auth] Invitation not found:", code);
      return res.status(400).json({
        error: "Invitation not found",
      });
    }

    const invitation: InvitationRecord = data.value[0];

    // Check if invitation is expired
    const expiryDate = new Date(invitation.prmtk_expiresat);
    if (expiryDate < new Date()) {
      console.warn("[Auth] Invitation expired:", code);
      return res.status(400).json({
        error: "Invitation has expired",
      });
    }

    // Check if invitation is already accepted
    if (invitation.prmtk_status === 2) {
      console.warn("[Auth] Invitation already accepted:", code);
      return res.status(400).json({
        error: "Invitation already accepted",
      });
    }

    res.json({
      id: invitation.prmtk_invitationid,
      email: invitation.prmtk_email,
      organizationName: invitation.prmtk_organizationname,
      invitedBy: invitation.prmtk_invitedby || "Administrator",
      invitedAt: invitation.createdon,
      status: invitation.prmtk_status === 1 ? "pending" : "expired",
      expiresAt: invitation.prmtk_expiresat,
    });
  } catch (error) {
    console.error("[Auth] Get invitation error:", error);
    res.status(500).json({
      error: "Failed to fetch invitation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
