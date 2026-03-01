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
    "bg-gradient-primary text-white shadow-md hover:shadow-lg active:scale-95",
  secondary:
    "bg-gradient-secondary text-white shadow-md hover:shadow-lg active:scale-95",
  ghost:
    "bg-transparent text-foreground cursor-pointer hover:bg-slate-100",
  outline:
    "border-2 border-slate-300 bg-white text-slate-700 cursor-pointer hover:border-primary cursor-pointer hover:bg-primary/5",
  link:
    "text-primary underline-offset-4 hover:underline",
  success:
    "bg-gradient-success text-white shadow-md hover:shadow-lg active:scale-95",
  danger:
    "bg-danger text-white shadow-md hover:shadow-lg active:scale-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 rounded-lg px-4 text-sm font-semibold",
  md: "h-11 rounded-lg px-6 text-sm font-semibold",
  lg: "h-13 rounded-xl px-8 text-base font-bold",
  icon: "h-10 w-10 rounded-lg",
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
