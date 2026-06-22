import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={cn(
              "relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl",
              className,
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary">
                  <X className="size-5" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-border p-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
