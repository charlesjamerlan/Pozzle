"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
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
    isLoading: true,
  });

  // ------ Supabase session listener ------
  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!ignore && session?.user) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email ?? "",
              createdAt: session.user.created_at,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (!ignore) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        if (!ignore) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (ignore) return;
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email ?? "",
              createdAt: session.user.created_at,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    const cleanup = init();
    return () => {
      ignore = true;
      cleanup.then((unsub) => unsub?.());
    };
  }, []);

  // ------ collectEmail ------
  const collectEmail = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        console.error("[Auth] Supabase OTP error:", error.message);
      } else {
        console.log("[Auth] Magic link sent to:", email);
      }
    } catch (err) {
      console.error("[Auth] Failed to send magic link:", err);
    }

    // Always set local state so the extraction flow progresses
    const user: User = { email, createdAt: new Date().toISOString() };
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  // ------ logout ------
  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase not available
    }
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
