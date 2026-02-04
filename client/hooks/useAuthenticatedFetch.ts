import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Hook for making authenticated API calls
 * Automatically includes Authorization header with access token
 */
export function useAuthenticatedFetch() {
  const { accessToken, refreshToken } = useAuth();

  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      const { skipAuth = false, ...fetchOptions } = options;

      // Prepare headers
      const headers = new Headers(fetchOptions.headers);

      // Add authorization header if token exists and not skipped
      if (accessToken && !skipAuth) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Make request
      let response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // If unauthorized and we have refresh token, try to refresh and retry
      if (response.status === 401 && refreshToken && !skipAuth) {
        try {
          // Try to refresh token
          const refreshResponse = await fetch("/api/auth/refresh-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { accessToken: newAccessToken } = await refreshResponse.json();
            localStorage.setItem("accessToken", newAccessToken);

            // Retry original request with new token
            headers.set("Authorization", `Bearer ${newAccessToken}`);
            response = await fetch(url, {
              ...fetchOptions,
              headers,
            });
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      return response;
    },
    [accessToken, refreshToken]
  );

  return authenticatedFetch;
}
