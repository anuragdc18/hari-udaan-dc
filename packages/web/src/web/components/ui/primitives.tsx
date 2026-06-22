import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-card",
        className,
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-3 p-5 pb-0", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-base font-semibold tracking-tight", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

/* ---------------- Input ---------------- */
export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition focus-gold disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/* ---------------- Label ---------------- */
export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-foreground/80", className)} {...props} />;
}

/* ---------------- Textarea ---------------- */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition focus-gold resize-y",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/* ---------------- Select (native, styled) ---------------- */
export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-xl border border-input bg-card px-3.5 pr-9 text-sm text-foreground transition focus-gold disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ---------------- Switch ---------------- */
export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-gold" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

/* ---------------- Avatar ---------------- */
import { avatarGrad, initials } from "@/lib/format";
export function Avatar({ name, seed, size = 40, className }: { name: string; seed?: string; size?: number; className?: string }) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white", avatarGrad(seed ?? name), className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}
