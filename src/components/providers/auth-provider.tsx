"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, AuthState } from "@/lib/types/auth";

// We detect Supabase availability at runtime in the browser via the public env var.
const SUPABASE_ENABLED =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface AuthContextValue extends AuthState {
  collectEmail: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: SUPABASE_ENABLED, // start loading if Supabase is active
  });

  // ------ Supabase session listener ------
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;

    let ignore = false;

    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Get initial session
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

    if (SUPABASE_ENABLED) {
      // Send magic link
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        console.error("[Auth] Supabase OTP error:", error.message);
      }

      // Even with Supabase, allow the flow to continue immediately (email-gated, not session-gated)
      // The user enters their email → proceeds to URL step. Session established later via magic link.
    }

    // Always set local state so the extraction flow progresses
    const user: User = { email, createdAt: new Date().toISOString() };
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  // ------ logout ------
  const logout = useCallback(async () => {
    if (SUPABASE_ENABLED) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
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
