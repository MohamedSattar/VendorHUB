import { RequestHandler } from "express";

const OAUTH_CONFIG = {
  clientId: process.env.VITE_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  tokenUrl: process.env.VITE_OAUTH_TOKEN_URL,
  redirectUri: process.env.VITE_OAUTH_REDIRECT_URI,
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
