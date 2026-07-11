import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors disabled:opacity-50 px-4 py-2";

const variants: Record<Variant, string> = {
  primary: "bg-emerald text-black hover:bg-emerald/90",
  ghost:
    "border border-border text-foreground hover:border-white/20 hover:bg-white/[0.03]",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
