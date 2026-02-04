import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  error: string | null;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
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

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    error,
    login,
    logout,
    refreshToken,
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
