"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User, AuthState } from "@/lib/types/auth";

interface AuthContextValue extends AuthState {
  collectEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const collectEmail = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user: User = { email, createdAt: new Date().toISOString() };
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, collectEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
