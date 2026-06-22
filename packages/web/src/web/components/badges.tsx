import { cn } from "@/lib/utils";
import type { RegistrationStatus, CertificateStatus, DataFlag, UserRole } from "@/types";

function Dot({ className }: { className: string }) {
  return <span className={cn("size-1.5 rounded-full", className)} />;
}

const baseBadge =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold border";

export function RegBadge({ status }: { status: RegistrationStatus }) {
  const map = {
    Registered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    Absent: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20",
  };
  const dot = { Registered: "bg-emerald-500", Pending: "bg-amber-500", Absent: "bg-slate-400" };
  return <span className={cn(baseBadge, map[status])}><Dot className={dot[status]} />{status}</span>;
}

export function CertBadge({ status }: { status: CertificateStatus }) {
  if (status === "Issued")
    return (
      <span className={cn(baseBadge, "border-[#e3c766] bg-[#fbf3da] text-[#8a6d12] dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20")}>
        <Dot className="bg-gold" />Issued
      </span>
    );
  return <span className={cn(baseBadge, "border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20")}><Dot className="bg-slate-400" />Pending</span>;
}

export function FlagBadge({ flag }: { flag: DataFlag }) {
  if (flag === "ok") return null;
  const map = {
    Duplicate: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
    "Missing Data": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  };
  return <span className={cn(baseBadge, map[flag])}>{flag}</span>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const map = {
    Admin: "bg-navy/8 text-navy border-navy/15 dark:bg-gold/10 dark:text-gold dark:border-gold/20",
    Registration: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    Certificate: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20",
  };
  return <span className={cn(baseBadge, map[role])}>{role}</span>;
}

const CAT_STYLES: Record<string, string> = {
  "Topper Award": "bg-[#fbf3da] text-[#8a6d12] border-[#e3c766]",
  "Gold Merit": "bg-amber-50 text-amber-700 border-amber-200",
  "Silver Merit": "bg-slate-100 text-slate-600 border-slate-200",
  "Bronze Merit": "bg-orange-50 text-orange-700 border-orange-200",
  "Excellence Award": "bg-indigo-50 text-indigo-700 border-indigo-200",
};
export function CategoryBadge({ category }: { category: string }) {
  return <span className={cn(baseBadge, CAT_STYLES[category] ?? "bg-secondary text-foreground border-border", "dark:bg-white/5 dark:text-foreground dark:border-white/10")}>{category}</span>;
}

export function StatusPill({ status }: { status: "Active" | "Invited" | "Suspended" }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    Invited: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    Suspended: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
  };
  return <span className={cn(baseBadge, map[status])}>{status}</span>;
}
