import { RequestHandler } from "express";

const OAUTH_CONFIG = {
  clientId: process.env.VITE_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  tokenUrl: process.env.VITE_OAUTH_TOKEN_URL,
  redirectUri: process.env.VITE_OAUTH_REDIRECT_URI,
};

// Azure B2C userinfo endpoint - derive from token URL
// Example: https://ecab2cdev.b2clogin.com/20204571-3776-41c1-8358-b82ae0114e6e/b2c_1a_rg_dev_susi/oauth2/v2.0/userinfo
const getUserInfoEndpoint = (tokenUrl: string): string => {
  return tokenUrl.replace("/token", "/userinfo");
};

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  [key: string]: unknown;
}

interface ExchangeTokenRequest {
  code: string;
}

/**
 * Exchange authorization code for access token
 */
export const handleExchangeToken: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body as ExchangeTokenRequest;

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    if (
      !OAUTH_CONFIG.clientId ||
      !OAUTH_CONFIG.clientSecret ||
      !OAUTH_CONFIG.tokenUrl
    ) {
      console.error("OAuth configuration is incomplete");
      res.status(500).json({ error: "OAuth service is not configured" });
      return;
    }

    // Exchange code for token with Azure B2C
    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        code,
        redirect_uri: OAUTH_CONFIG.redirectUri || "",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      res.status(tokenResponse.status).json({
        error: "Failed to exchange token",
        details: errorData,
      });
      return;
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    // Return tokens to client
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    res.status(500).json({
      error: "Internal server error during token exchange",
    });
  }
};

interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh access token using refresh token
 */
export const handleRefreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequest;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    if (
      !OAUTH_CONFIG.clientId ||
      !OAUTH_CONFIG.clientSecret ||
      !OAUTH_CONFIG.tokenUrl
    ) {
      console.error("OAuth configuration is incomplete");
      res.status(500).json({ error: "OAuth service is not configured" });
      return;
    }

    const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token refresh error:", errorData);
      res.status(tokenResponse.status).json({
        error: "Failed to refresh token",
        details: errorData,
      });
      return;
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    res.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      error: "Internal server error during token refresh",
    });
  }
};

interface GetUserInfoRequest {
  accessToken: string;
}

/**
 * Fetch user information from Azure B2C using access token
 */
export const handleGetUserInfo: RequestHandler = async (req, res) => {
  try {
    const { accessToken } = req.body as GetUserInfoRequest;

    if (!accessToken) {
      res.status(400).json({ error: "Access token is required" });
      return;
    }

    if (!OAUTH_CONFIG.tokenUrl) {
      console.error("OAuth token URL is not configured");
      res.status(500).json({ error: "OAuth service is not configured" });
      return;
    }

    const userInfoUrl = getUserInfoEndpoint(OAUTH_CONFIG.tokenUrl);

    // Fetch user information from Azure B2C
    const userInfoResponse = await fetch(userInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error("User info fetch error:", errorData);
      res.status(userInfoResponse.status).json({
        error: "Failed to fetch user information",
        details: errorData,
      });
      return;
    }

    const userInfo = await userInfoResponse.json();

    // Return user information
    res.json({
      id: userInfo.sub || userInfo.oid || "unknown",
      email: userInfo.email || userInfo.emails?.[0] || "unknown",
      name: userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim(),
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
      raw: userInfo,
    });
  } catch (error) {
    console.error("User info fetch error:", error);
    res.status(500).json({
      error: "Internal server error during user info fetch",
    });
  }
};
