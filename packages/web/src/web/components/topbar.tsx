import * as React from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, Bell, Sun, Moon, ChevronRight, Settings, UserCircle, LogOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { getCurrentUser } from "@/lib/session";
import { NAV_ITEMS, EVENT } from "@/lib/constants";
import { Avatar } from "./ui/primitives";
import { timeAgo } from "@/lib/format";
import type { NotificationItem } from "@/types";

const notifications: NotificationItem[] = [];

function useOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const notifRef = useOutside<HTMLDivElement>(() => setNotifOpen(false));
  const profileRef = useOutside<HTMLDivElement>(() => setProfileOpen(false));

  const current = NAV_ITEMS.find((n) => location.startsWith(n.path));
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
  const unread = notifications.filter((n) => !n.read).length;
  const currentUser = getCurrentUser();

  return (
    <header className="glass sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-border px-4 lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary lg:hidden">
        <Menu className="size-5" />
      </button>

      {/* breadcrumb */}
      <div className="hidden items-center gap-1.5 text-sm md:flex">
        <Link href="/dashboard"><span className="text-muted-foreground transition hover:text-foreground">Home</span></Link>
        <ChevronRight className="size-3.5 text-muted-foreground/50" />
        <span className="font-semibold">{current?.label ?? "Dashboard"}</span>
      </div>

      {/* search trigger */}
      <button
        onClick={onSearch}
        className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground transition hover:bg-secondary md:ml-6 md:w-64 md:justify-between"
      >
        <span className="flex items-center gap-2"><Search className="size-4" /><span className="hidden md:inline">Search…</span></span>
        <kbd className="hidden rounded-md border border-border bg-secondary px-1.5 text-[11px] md:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1 md:ml-0 md:gap-1.5">
        <span className="mr-1 hidden rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground xl:inline">{today}</span>

        <button onClick={toggle} className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary">
          {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        {/* notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((o) => !o)} className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary">
            <Bell className="size-4.5" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy-900">{unread}</span>}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 top-12 z-50 w-[330px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="font-display text-sm font-semibold">Notifications</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{unread} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn("flex gap-3 border-b border-border/60 px-4 py-3 transition hover:bg-secondary/50", !n.read && "bg-secondary/30")}>
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.type === "success" && "bg-emerald-500", n.type === "alert" && "bg-red-500", n.type === "warning" && "bg-amber-500", n.type === "info" && "bg-blue-500")} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold">{n.title}</p>
                        <p className="text-[12px] text-muted-foreground">{n.description}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No notifications yet</div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button className="flex w-full items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium text-navy transition hover:bg-secondary dark:text-gold">
                    <Check className="size-3.5" /> Mark all read
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 rounded-xl border border-border bg-card py-1 pl-1 pr-2 transition hover:bg-secondary">
            <Avatar name={currentUser.name} seed={currentUser.avatarSeed} size={30} />
            <span className="hidden text-[13px] font-semibold sm:inline">{currentUser.name.split(" ")[0]}</span>
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-3 border-b border-border p-3.5">
                  <Avatar name={currentUser.name} seed={currentUser.avatarSeed} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link href="/profile"><div onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"><UserCircle className="size-4 text-muted-foreground" />Profile</div></Link>
                  <Link href="/settings"><div onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"><Settings className="size-4 text-muted-foreground" />Settings</div></Link>
                  <Link href="/login"><div onClick={() => localStorage.removeItem("crm.currentUser")} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut className="size-4" />Logout</div></Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export { EVENT };
