import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "wouter";
import { Search, CornerDownLeft, GraduationCap } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { awardeeService } from "@/services/awardeeService";
import type { Awardee } from "@/types";
import { Icon } from "./shared";
import { Avatar } from "./ui/primitives";

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<Awardee[]>([]);
  const [, navigate] = useLocation();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) awardeeService.list().then(setItems).catch(() => setItems([]));
  }, [open]);

  const ql = q.toLowerCase().trim();
  const pages = NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(ql));
  const awardees = ql
    ? items.filter(
        (a) =>
          a.name.toLowerCase().includes(ql) ||
          a.id.toLowerCase().includes(ql) ||
          a.phone.includes(ql) ||
          a.district.toLowerCase().includes(ql),
      ).slice(0, 6)
    : [];

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-900/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search awardees, pages, IDs…"
                className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
              {pages.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pages</p>
                  {pages.map((p) => (
                    <button key={p.key} onClick={() => go(p.path)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary">
                      <Icon name={p.icon} className="size-4 text-muted-foreground" />
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
              {awardees.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Awardees</p>
                  {awardees.map((a) => (
                    <button key={a.id} onClick={() => go(`/awardees/${a.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-secondary">
                      <Avatar name={a.name} seed={a.avatarSeed} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{a.id} · {a.district}</p>
                      </div>
                      <CornerDownLeft className="size-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
              {ql && pages.length === 0 && awardees.length === 0 && (
                <div className="flex flex-col items-center px-4 py-10 text-center text-muted-foreground">
                  <GraduationCap className="size-8 opacity-40" />
                  <p className="mt-2 text-sm">No results for “{q}”</p>
                </div>
              )}
              {!ql && (
                <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                  Type to search awardees and pages
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
