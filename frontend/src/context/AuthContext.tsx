import React, { createContext, useEffect, useState } from "react";
import type { User, AuthResponse } from "../types/auth";
import { loginUser, logoutUser } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // rehydrate from localStorage
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthResponse;
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      setToken(data.token);
      // persist minimal auth info
      localStorage.setItem("auth", JSON.stringify(data));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser(token || undefined);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
