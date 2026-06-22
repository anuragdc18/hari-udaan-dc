import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

type ToastType = "success" | "info" | "warning" | "error";
interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

const ToastCtx = React.createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });
export const useToast = () => React.useContext(ToastCtx);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};
const COLORS = {
  success: "text-emerald-500",
  info: "text-blue-500",
  warning: "text-amber-500",
  error: "text-red-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[200] flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2.5">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.type];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-card"
                >
                  <Icon className={`mt-0.5 size-5 shrink-0 ${COLORS[t.type]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-[13px] text-muted-foreground">{t.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}
