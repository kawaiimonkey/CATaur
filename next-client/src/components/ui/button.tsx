import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "link" | "success" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] active:bg-[#1E3A8A]",
  secondary:
    "bg-[#374151] text-white hover:bg-[#1F2937] active:bg-[#111827]",
  ghost:
    "bg-transparent text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-100)]",
  outline:
    "border border-[#D1D5DB] bg-[#F9FAFB] text-[#374151] cursor-pointer hover:bg-white hover:border-[#1D4ED8] hover:text-[#1D4ED8]",
  link:
    "text-[var(--accent)] underline-offset-4 hover:underline",
  success:
    "bg-[#166534] text-white hover:bg-[#14532D] active:bg-[#052e16]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 rounded px-3 text-sm font-medium",
  md: "h-9 rounded px-4 text-sm font-medium",
  lg: "h-11 rounded px-6 text-base font-semibold",
  icon: "h-9 w-9 rounded",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref,
  ) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
