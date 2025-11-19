import React, { createContext, useEffect, useState } from "react";
import type { User, AuthResponse } from "../types/auth";
import { loginUser, logoutUser } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // rehydrate from localStorage
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthResponse["response"];
        setUser(parsed.user || null);
        setAccessToken(parsed.session.access_token || null);
        setRefreshToken(parsed.session.refresh_token || null);
        setExpiresAt(parsed.session.expires_at || null);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { response } = await loginUser({ email, password });
      const { session, user } = response;

      setUser(user);
      setAccessToken(session.access_token);
      setRefreshToken(session.refresh_token);
      setExpiresAt(session.expires_at);

      // persist minimal auth info
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          },
        })
      );
      localStorage.setItem("authToken", session.access_token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setExpiresAt(null);
      localStorage.removeItem("auth");
      localStorage.removeItem("authToken");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        expiresAt,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
