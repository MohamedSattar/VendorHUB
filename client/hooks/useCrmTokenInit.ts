import { useEffect, useRef } from "react";

/**
 * Hook to initialize the CRM access token on component mount
 * This should be called once per session (typically in the header component)
 * Ensures the token is cached and ready before making CRM API calls
 */
export function useCrmTokenInit() {
  const initializeRef = useRef(false);

  useEffect(() => {
    // Only initialize once per session
    if (initializeRef.current) {
      return;
    }

    const initializeCrmToken = async () => {
      try {
        console.log("[CRM Token Init] Initializing CRM access token...");

        const response = await fetch("/api/auth/init-crm-token", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[CRM Token Init] CRM token initialized successfully", {
            timestamp: data.timestamp,
          });
          initializeRef.current = true;
        } else {
          console.warn(
            "[CRM Token Init] Failed to initialize CRM token",
            response.status
          );
        }
      } catch (error) {
        console.error("[CRM Token Init] Error initializing CRM token:", error);
        // Don't mark as initialized if there's an error
        // This allows retry on next mount
      }
    };

    initializeCrmToken();
  }, []);
}
