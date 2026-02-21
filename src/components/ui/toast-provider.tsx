"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Toast, ToastTitle, ToastViewport } from "@/components/ui/toast";

interface ToastMessage {
  id: string;
  message: string;
}

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            open
            onOpenChange={(open) => handleOpenChange(t.id, open)}
          >
            <ToastTitle>{t.message}</ToastTitle>
          </Toast>
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { ToastProvider, useToast };
