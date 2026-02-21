"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/marketing/logo";

const SUPABASE_ENABLED =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check Supabase session for dashboard link
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;

    async function checkSession() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch {
        // Supabase not available
      }
    }

    checkSession();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-canvas/80 backdrop-blur-lg"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/extract"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-coral/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Try Free
          </Link>
        </div>
      </nav>
    </header>
  );
}

export { Navbar };
