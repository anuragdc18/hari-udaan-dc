import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  emptyState,
}: {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}) {
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const arr = [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages - 1);
  const rows = sorted.slice(current * pageSize, current * pageSize + pageSize);

  React.useEffect(() => setPage(0), [data]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (data.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th key={c.key} className={cn("sticky top-0 bg-card px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground", c.className)}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 transition hover:text-foreground">
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                onClick={() => onRowClick?.(row)}
                className={cn("border-b border-border/70 transition-colors hover:bg-secondary/60", onRowClick && "cursor-pointer")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn("rounded-xl border border-border bg-card p-3.5", onRowClick && "cursor-pointer active:scale-[0.99]")}
          >
            {columns.slice(0, 5).map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3 py-1 text-sm">
                <span className="text-[12px] uppercase tracking-wide text-muted-foreground">{c.header}</span>
                <span className="text-right font-medium">{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[13px] text-muted-foreground">
            Showing <b className="text-foreground">{current * pageSize + 1}</b>–
            <b className="text-foreground">{Math.min((current + 1) * pageSize, sorted.length)}</b> of{" "}
            <b className="text-foreground">{sorted.length}</b>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "size-8 rounded-lg border text-[13px] font-medium transition",
                  current === i ? "border-navy bg-navy text-white dark:border-gold dark:bg-gold dark:text-navy-900" : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={current >= totalPages - 1}
              onClick={() => setPage(current + 1)}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
