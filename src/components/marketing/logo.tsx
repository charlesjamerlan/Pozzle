import Image from "next/image";
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
      <Image
        src="/pozzle-icon.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="font-sans text-lg font-bold text-text-primary tracking-tight">
        pozzle
      </span>
    </Link>
  );
}

export { Logo };
