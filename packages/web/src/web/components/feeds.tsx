import { motion } from "motion/react";
import { ClipboardCheck, Award, AlertTriangle, Settings2, UserPlus } from "lucide-react";
import { timeAgo } from "@/lib/format";
import type { ActivityItem } from "@/types";

const TYPE_META = {
  registration: { icon: ClipboardCheck, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" },
  certificate: { icon: Award, color: "bg-[#fbf3da] text-[#a8851a] dark:bg-gold/10 dark:text-gold" },
  alert: { icon: AlertTriangle, color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" },
  system: { icon: Settings2, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" },
  user: { icon: UserPlus, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative space-y-1">
      {items.map((item, i) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex gap-3 rounded-xl p-2.5 transition hover:bg-secondary/50"
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
              <Icon className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
              </div>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{item.description}</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/80">by {item.actor}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export interface TimelineStep {
  title: string;
  description?: string;
  time?: string;
  done: boolean;
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-border">
      {steps.map((s, i) => (
        <li key={i} className="relative ml-6 pb-6 last:pb-0">
          <span
            className={`absolute -left-[31px] flex size-5 items-center justify-center rounded-full ring-4 ring-card ${
              s.done ? "bg-gold" : "bg-muted-foreground/30"
            }`}
          >
            {s.done && <span className="size-2 rounded-full bg-white" />}
          </span>
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${s.done ? "" : "text-muted-foreground"}`}>{s.title}</p>
            {s.time && <span className="text-[11px] text-muted-foreground">{s.time}</span>}
          </div>
          {s.description && <p className="mt-0.5 text-[13px] text-muted-foreground">{s.description}</p>}
        </li>
      ))}
    </ol>
  );
}
