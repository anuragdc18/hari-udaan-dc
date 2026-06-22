import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, PanelLeftClose, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, EVENT } from "@/lib/constants";
import { canAccessPath, getCurrentUser } from "@/lib/session";
import { Logo, Icon } from "./shared";

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const [location] = useLocation();
  const isActive = (path: string) => location === path || location.startsWith(path + "/");
  const currentUser = getCurrentUser();
  const navItems = NAV_ITEMS.filter((item) => canAccessPath(currentUser.role, item.path));

  const nav = (
    <>
      <div className={cn("flex items-center px-4 py-5", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <Logo collapsed={collapsed} light />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("hidden rounded-lg p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white lg:block", collapsed && "hidden")}
        >
          <PanelLeftClose className="size-4.5" />
        </button>
        <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden">
          <X className="size-5" />
        </button>
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="mx-auto mb-2 hidden rounded-lg p-1.5 text-white/55 hover:bg-white/10 hover:text-white lg:block">
          <PanelLeft className="size-4.5" />
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.key} href={item.path} onClick={() => setMobileOpen(false)}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  collapsed && "justify-center px-0",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
                title={collapsed ? item.label : undefined}
              >
                {active && <motion.span layoutId="navactive" className="absolute left-0 h-6 w-1 rounded-r-full bg-gold" />}
                <Icon name={item.icon} className={cn("size-5 shrink-0", active && "text-gold")} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold/90">Event</p>
            <p className="mt-1 text-[13px] font-semibold text-white">{EVENT.date}</p>
            <p className="text-[11px] text-white/50">{EVENT.venue}</p>
          </div>
        )}
        <Link href="/login">
          <div onClick={() => localStorage.removeItem("crm.currentUser")} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-red-500/15 hover:text-red-300", collapsed && "justify-center px-0")}>
            <LogOut className="size-5 shrink-0" />
            {!collapsed && "Logout"}
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* desktop */}
      <aside
        className={cn(
          "bg-navy-rich sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/8 transition-all duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        {nav}
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[90] bg-navy-900/60 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="bg-navy-rich fixed inset-y-0 left-0 z-[100] flex w-[264px] flex-col lg:hidden"
            >
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
