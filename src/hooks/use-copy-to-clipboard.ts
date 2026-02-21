"use client";

import { useState, useCallback, useRef } from "react";

interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopied(false);
    }
  }, []);

  return { copied, copy };
}
