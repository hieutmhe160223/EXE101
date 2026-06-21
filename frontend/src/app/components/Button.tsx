import { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg":
            variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/90":
            variant === "secondary",
          "bg-accent text-accent-foreground hover:bg-accent/90":
            variant === "accent",
          "border-2 border-primary text-primary hover:bg-primary hover:text-white":
            variant === "outline",
          "hover:bg-muted": variant === "ghost",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-6 py-3": size === "md",
          "px-8 py-4 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
