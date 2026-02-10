import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
  loggedInEmail: string | null; // Global variable for logged-in email
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUserFromLogin: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        const storedEmail = localStorage.getItem("loggedInEmail");

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Restore logged-in email from localStorage
            if (storedEmail) {
              setLoggedInEmail(storedEmail);
            } else if (parsedUser.email) {
              setLoggedInEmail(parsedUser.email);
            }
          } catch (parseErr) {
            console.error("Failed to parse stored user:", parseErr);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        setError("Failed to restore authentication");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = () => {
    try {
      // Import here to avoid circular dependency
      const { getAuthorizationUrl } = require("@/services/oauth");
      const authUrl = getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to initiate login");
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setLoggedInEmail(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loggedInEmail");
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        logout();
        return;
      }

      const { refreshAccessToken } = require("@/services/oauth");
      const { accessToken: newAccessToken } = await refreshAccessToken(
        storedRefreshToken
      );

      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  const setUserFromLogin = (user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
    setLoggedInEmail(user.email);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("loggedInEmail", user.email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    error,
    loggedInEmail,
    login,
    logout,
    refreshToken,
    setUserFromLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
