"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/marketing/logo";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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
        <Link
          href="/extract"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-coral to-coral-light px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-coral/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Try Free
        </Link>
      </nav>
    </header>
  );
}

export { Navbar };
