/**
 * Azure Authentication Service
 * Implements OAuth 2.0 Client Credentials Flow for service-to-service authentication
 * Used to authenticate with Dataverse/Power Apps APIs
 */

import { getDataverseResource } from "../config/crmEnvironments";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Get an access token using Client Credentials Flow
 * Supports both Azure AD v1.0 and v2.0 endpoints
 * Implements token caching and automatic refresh
 */
export async function getAccessToken(): Promise<string> {
  try {
    const now = Date.now();

    // Return cached token if still valid (with 5 minute buffer for safety)
    if (tokenCache && tokenCache.expiresAt > now + 5 * 60 * 1000) {
      console.log("[Azure Auth] Using cached access token");
      return tokenCache.accessToken;
    }

    // Get credentials from environment variables
    const tokenUrl = process.env.TOKEN_URL;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    // Use dynamic resource from current CRM environment configuration
    const resource = getDataverseResource();
    const tenantId = process.env.AZURE_TENANT_ID;

    // Validate required environment variables
    if (!tokenUrl || !clientId || !clientSecret || !resource) {
      throw new Error(
        "Missing required Azure authentication environment variables: " +
        "TOKEN_URL, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, DATAVERSE_RESOURCE"
      );
    }

    console.log("[Azure Auth] Requesting new access token from:", tokenUrl);

    // Prepare token request body
    const body = new URLSearchParams();
    body.append("client_id", clientId);
    body.append("client_secret", clientSecret);
    body.append("grant_type", "client_credentials");

    // Determine if this is v1.0 or v2.0 endpoint and use appropriate parameter
    // v1.0 uses "resource", v2.0 uses "scope"
    if (tokenUrl.includes("/oauth2/token")) {
      // v1.0 endpoint - use resource parameter
      // For v1.0, resource should be the Dynamics endpoint without /.default
      const resourceUrl = resource.replace(/\/\.default$/, "");
      body.append("resource", resourceUrl);
      console.log("[Azure Auth] Using v1.0 endpoint with resource parameter:", resourceUrl);
    } else if (tokenUrl.includes("/oauth2/v2.0/token")) {
      // v2.0 endpoint - use scope parameter
      body.append("scope", resource);
      console.log("[Azure Auth] Using v2.0 endpoint with scope parameter:", resource);
    } else {
      // Fallback to v1.0 (resource) for unknown endpoints
      const resourceUrl = resource.replace(/\/\.default$/, "");
      body.append("resource", resourceUrl);
      console.log("[Azure Auth] Using resource parameter (fallback):", resourceUrl);
    }

    // Request access token
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: "Unknown error", error_description: errorText };
      }

      console.error("[Azure Auth] Token request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        error_description: errorData.error_description,
        url: tokenUrl,
      });
      throw new Error(
        `Failed to obtain access token: ${errorData.error} - ${errorData.error_description}`
      );
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("No access token in response");
    }

    // Cache the token
    // expires_in is in seconds, convert to milliseconds
    const expiresAt = now + (data.expires_in - 60) * 1000; // Subtract 60 seconds for safety
    tokenCache = {
      accessToken: data.access_token,
      expiresAt: expiresAt,
    };

    console.log("[Azure Auth] Successfully obtained access token", {
      expiresIn: data.expires_in,
      expiresAt: new Date(expiresAt).toISOString(),
      tokenType: data.token_type,
    });

    return data.access_token;
  } catch (error) {
    console.error("[Azure Auth] Error getting access token:", error);
    // Clear cache on error
    tokenCache = null;
    throw error;
  }
}

/**
 * Invalidate the cached token (e.g., if a request returns 401)
 */
export function invalidateTokenCache(): void {
  console.log("[Azure Auth] Invalidating token cache");
  tokenCache = null;
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Check if token is available (for logging/debugging)
 */
export function hasValidToken(): boolean {
  const now = Date.now();
  return tokenCache !== null && tokenCache.expiresAt > now;
}
