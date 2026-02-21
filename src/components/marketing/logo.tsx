import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
}

function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-coral">
        <span className="font-serif text-xl italic leading-none text-white">
          p
        </span>
      </div>
      <span className="font-sans text-lg font-semibold text-text-primary">
        pozzle
      </span>
    </Link>
  );
}

export { Logo };
