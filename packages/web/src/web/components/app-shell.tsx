import * as React from "react";
import { motion } from "motion/react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandSearch } from "./command-search";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}
