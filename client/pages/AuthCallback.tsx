import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuthCodeFromUrl,
  getAuthErrorFromUrl,
  exchangeCodeForToken,
  getUserInfo,
} from "@/services/oauth";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for errors from OAuth provider
        const authError = getAuthErrorFromUrl();
        if (authError) {
          setError(`Authentication failed: ${authError}`);
          setIsProcessing(false);
          return;
        }

        // Get authorization code from URL
        const code = getAuthCodeFromUrl();
        if (!code) {
          setError("No authorization code received");
          setIsProcessing(false);
          return;
        }

        // Exchange code for access token
        const { accessToken, refreshToken, expiresIn } =
          await exchangeCodeForToken(code);

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        localStorage.setItem("tokenExpiresAt", (Date.now() + expiresIn * 1000).toString());

        // Fetch user information from Azure B2C
        let user = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email: "user@example.com",
          name: "User",
        };

        try {
          const userInfo = await getUserInfo(accessToken);
          user = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name || `${userInfo.givenName || ""} ${userInfo.familyName || ""}`.trim() || "User",
          };
        } catch (err) {
          console.warn("Failed to fetch user info, using defaults:", err);
          // Continue with default user object if fetch fails
        }

        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("Callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {isProcessing ? "Signing you in..." : "Processing..."}
          </h1>
          <p className="text-gray-600 text-center">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
