import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition",
        variant === "primary" && "bg-neutral-950 text-white",
        variant === "secondary" && "border border-neutral-300 bg-white text-neutral-950",
        className
      )}
      {...props}
    />
  );
}
