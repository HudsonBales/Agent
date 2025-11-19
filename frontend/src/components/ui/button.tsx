"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

const baseStyles =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-sm";

const variants = {
  primary: "bg-brand text-brand-foreground hover:bg-brand/90",
  secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
  ghost: "bg-transparent text-neutral-200 hover:bg-neutral-800"
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], className, loading && "opacity-70")}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Please wait..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
