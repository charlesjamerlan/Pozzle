"use client";

import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useToast } from "@/components/ui/toast-provider";

interface CopyButtonProps {
  text: string;
  className?: string;
}

function CopyButton({ text, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const { toast } = useToast();

  const handleCopy = async () => {
    await copy(text);
    toast("Copied to clipboard");
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-text-secondary transition-colors duration-200 hover:text-text-primary hover:bg-surface-elevated cursor-pointer",
        copied && "text-accent-green hover:text-accent-green",
        className,
      )}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

export { CopyButton };
export type { CopyButtonProps };
