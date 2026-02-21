import { Logo } from "@/components/marketing/logo";

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Logo />
        <span className="text-sm text-text-tertiary">
          &copy; 2026 Pozzle
        </span>
      </div>
    </footer>
  );
}

export { Footer };
