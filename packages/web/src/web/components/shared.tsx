import * as React from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/primitives";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import type { DashboardStat } from "@/types";

/* ---------- Logo ---------- */
export function Logo({ collapsed = false, light = false }: { collapsed?: boolean; light?: boolean }) {
  if (collapsed) return <img src="/hari-udaan-mark.png" alt="HARI UDAAN" className="size-10 rounded-xl" />;
  return (
    <div className="flex items-center gap-2.5">
      <img src="/hari-udaan-mark.png" alt="HARI UDAAN" className="size-10 shrink-0 rounded-xl" />
      <div className="leading-tight">
        <div className={cn("font-display text-[15px] font-extrabold tracking-tight", light ? "text-white" : "text-navy dark:text-white")}>
          HARI <span className="text-gold-gradient">UDAAN</span>
        </div>
        <div className={cn("text-[10px] font-medium uppercase tracking-[0.14em]", light ? "text-white/55" : "text-muted-foreground")}>
          2026 Awards CRM
        </div>
      </div>
    </div>
  );
}

/* ---------- PageHeader ---------- */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Icon helper ---------- */
export function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

/* ---------- StatCard ---------- */
const ACCENTS: Record<string, { bg: string; fg: string; ring: string }> = {
  navy: { bg: "bg-navy/8 dark:bg-white/5", fg: "text-navy dark:text-white", ring: "from-navy/15" },
  gold: { bg: "bg-[#fbf3da] dark:bg-gold/10", fg: "text-[#a8851a] dark:text-gold", ring: "from-gold/20" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-300", ring: "from-emerald-500/15" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/10", fg: "text-amber-600 dark:text-amber-300", ring: "from-amber-500/15" },
  blue: { bg: "bg-blue-50 dark:bg-blue-500/10", fg: "text-blue-600 dark:text-blue-300", ring: "from-blue-500/15" },
  teal: { bg: "bg-teal-50 dark:bg-teal-500/10", fg: "text-teal-600 dark:text-teal-300", ring: "from-teal-500/15" },
  red: { bg: "bg-red-50 dark:bg-red-500/10", fg: "text-red-600 dark:text-red-300", ring: "from-red-500/15" },
};

export function StatCard({ stat, index = 0 }: { stat: DashboardStat; index?: number }) {
  const a = ACCENTS[stat.accent] ?? ACCENTS.navy;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      <Card className="relative overflow-hidden p-5">
        <div className={cn("pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br to-transparent blur-2xl", a.ring)} />
        <div className="flex items-start justify-between">
          <div className={cn("flex size-11 items-center justify-center rounded-xl", a.bg, a.fg)}>
            <Icon name={stat.icon} className="size-5" />
          </div>
          {stat.trend && (
            <span className={cn("flex items-center gap-0.5 text-[12px] font-semibold", stat.trend.direction === "up" ? "text-emerald-600" : "text-red-500")}>
              {stat.trend.direction === "up" ? <Icons.TrendingUp className="size-3.5" /> : <Icons.TrendingDown className="size-3.5" />}
              {stat.trend.value}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="font-display text-[28px] font-bold leading-none tracking-tight">
            {stat.value.toLocaleString("en-IN")}
            {stat.suffix && <span className="ml-0.5 text-lg text-muted-foreground">{stat.suffix}</span>}
          </div>
          <div className="mt-1.5 text-[13px] font-medium text-muted-foreground">{stat.label}</div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------- ChartCard ---------- */
export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({ icon = "SearchX", title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon name={icon} className="size-7" />
      </div>
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/* ---------- BackendPendingModal ---------- */
export function BackendPendingModal({ open, onClose, action = "This action" }: { open: boolean; onClose: () => void; action?: string }) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col items-center px-2 py-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#fbf3da] text-[#a8851a] dark:bg-gold/10 dark:text-gold">
          <Icons.PlugZap className="size-7" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold">Backend Integration Pending</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {action} requires the backend service which isn’t connected in this preview. All flows are wired and ready for API integration.
        </p>
        <Button variant="gold" className="mt-5 w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}
