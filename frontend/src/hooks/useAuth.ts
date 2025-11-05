import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Custom hook to access auth context with basic error handling
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
