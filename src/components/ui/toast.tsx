"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils/cn";

const ToastViewport = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const Toast = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-lg border border-border bg-surface-elevated p-4 shadow-lg transition-all",
      "data-[state=open]:animate-slide-in-from-right data-[state=closed]:animate-fade-out",
      "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
      className,
    )}
    {...props}
  />
));
Toast.displayName = "Toast";

const ToastTitle = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-medium text-text-primary", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastTitle, ToastDescription, ToastViewport };
