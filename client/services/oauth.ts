/**
 * OAuth 2.0 Service for Azure B2C Authentication
 */

const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
  authUrl: import.meta.env.VITE_OAUTH_AUTH_URL,
  tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL,
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  scope: import.meta.env.VITE_OAUTH_SCOPE,
};

/**
 * Generate OAuth authorization URL for login redirect
 */
export function getAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    response_type: "code",
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    state: state || generateRandomState(),
  });

  return `${OAUTH_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * This should be called from the backend to keep client secret safe
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  try {
    const response = await fetch("/api/auth/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Token exchange error:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  try {
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
}

/**
 * Generate random state for OAuth flow
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Get state from URL
 */
export function getStateFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("state");
}

/**
 * Get authorization code from URL
 */
export function getAuthCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

/**
 * Get error from URL (if auth failed)
 */
export function getAuthErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("error");
}

/**
 * Fetch user information using access token
 */
export async function getUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  raw?: Record<string, unknown>;
}> {
  try {
    const response = await fetch("/api/auth/user-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error(`User info fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get user info error:", error);
    throw error;
  }
}
