import * as React from "react";
import * as XLSX from "xlsx";
import { ClipboardCheck, Award, CalendarCheck, FileBarChart, FileSpreadsheet, FileText, Eye, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader, BackendPendingModal } from "@/components/shared";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { computeStats } from "@/lib/derive";
import { awardeeService } from "@/services/awardeeService";
import type { Awardee } from "@/types";

const REPORTS = [
  { key: "registered-only", title: "Registered Candidates Only", desc: "Strict Excel export of registered candidates with full details and family count.", icon: ClipboardCheck, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10" },
  { key: "reg", title: "Registration Report", desc: "Complete check-in log with parent & guest counts.", icon: ClipboardCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  { key: "cert", title: "Certificate Report", desc: "All issued certificates by category & operator.", icon: Award, color: "text-[#a8851a] bg-[#fbf3da] dark:bg-gold/10" },
  { key: "att", title: "Attendance Report", desc: "Awardee attendance & total people present.", icon: CalendarCheck, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
  { key: "final", title: "Final Event Report", desc: "Consolidated ceremony summary & analytics.", icon: FileBarChart, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" },
];

export default function Reports() {
  const [awardees, setAwardees] = React.useState<Awardee[]>([]);
  React.useEffect(() => {
    awardeeService.list().then(setAwardees).catch(() => setAwardees([]));
  }, []);
  const stats = React.useMemo(() => computeStats(awardees), [awardees]);
  const [pending, setPending] = React.useState<null | string>(null);
  const [preview, setPreview] = React.useState<null | (typeof REPORTS)[number]>(null);

  const summary = stats.filter((s) => ["total", "registered", "issued", "people"].includes(s.key));
  const registeredAwardees = React.useMemo(() => awardees.filter((a) => a.registrationStatus === "Registered"), [awardees]);

  function dateTime(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }

  function candidateDetails(a: Awardee, index: number) {
    return {
      "S.No": index + 1,
      "Awardee ID": a.id,
      "Awardee Name": a.name,
      "Phone Number": a.phone,
      "Email ID": a.email,
      District: a.district,
      Address: a.address,
      College: a.college,
      Course: a.course,
      Percentage: a.percentage,
      "Award Category": a.awardCategory,
      "Registration Status": a.registrationStatus,
      "Student Attended": a.studentAttended ? "Yes" : "No",
      "Parent Name": a.parentName,
      "Parent Phone": a.parentPhone,
      "Parents Count": a.parentsCount,
      "Guests Count": a.guestsCount,
      "Family Members Came": a.parentsCount + a.guestsCount,
      "Total People Came": (a.studentAttended ? 1 : 0) + a.parentsCount + a.guestsCount,
      "Check-in Time": dateTime(a.checkedInAt),
      "Checked-in By": a.checkedInBy ?? "",
      "Certificate Status": a.certificateStatus,
      "Certificate Issue Time": dateTime(a.certificateIssuedAt),
      "Certificate Issued By": a.certificateIssuedBy ?? "",
      Remarks: a.remarks,
      "Data Flag": a.dataFlag,
      "Created At": dateTime(a.createdAt),
    };
  }

  function reportRows(key: string) {
    if (key === "registered-only") {
      return registeredAwardees.map(candidateDetails);
    }
    if (key === "cert") {
      return awardees.map((a) => ({
        "Awardee ID": a.id,
        "Awardee Name": a.name,
        "Phone Number": a.phone,
        "Email ID": a.email,
        "Award Category": a.awardCategory,
        "Certificate Issued Status": a.certificateStatus,
        "Certificate Issue Time": dateTime(a.certificateIssuedAt),
        "Issued By": a.certificateIssuedBy ?? "",
        Remarks: a.remarks,
      }));
    }
    if (key === "final") {
      return summary.map((s) => ({ Metric: s.label, Value: s.value }));
    }
    return awardees.map((a, index) => ({
      "S.No": index + 1,
      "Awardee ID": a.id,
      "Awardee Name": a.name,
      "Phone Number": a.phone,
      "Email ID": a.email,
      District: a.district,
      Address: a.address,
      College: a.college,
      Course: a.course,
      Percentage: a.percentage,
      "Award Category": a.awardCategory,
      "Registered Status": a.registrationStatus,
      "Student Attended": a.studentAttended ? "Yes" : "No",
      "Parent Name": a.parentName,
      "Parent Phone": a.parentPhone,
      "Parents Count": a.parentsCount,
      "Guests Count": a.guestsCount,
      "Family Members Came": a.parentsCount + a.guestsCount,
      "Total People Count": (a.studentAttended ? 1 : 0) + a.parentsCount + a.guestsCount,
      "Check-in Time": dateTime(a.checkedInAt),
      "Checked-in By": a.checkedInBy ?? "",
      "Certificate Status": a.certificateStatus,
      Remarks: a.remarks,
    }));
  }

  function downloadExcel(report: (typeof REPORTS)[number]) {
    const rows = reportRows(report.key);
    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Message: "No registered candidates found." }]);
    formatWorksheet(worksheet, rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, report.title.slice(0, 31));
    XLSX.writeFile(workbook, `hari-udaan-${report.key}-report.xlsx`);
  }

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export ceremony reports." />

      <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.key} className="p-4">
            <p className="text-[12px] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value.toLocaleString("en-IN")}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((r, i) => (
          <motion.div key={r.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="flex h-full flex-col p-5">
              <div className="flex items-start gap-3">
                <span className={`flex size-12 items-center justify-center rounded-xl ${r.color}`}><r.icon className="size-6" /></span>
                <div className="flex-1"><h3 className="font-display text-base font-semibold">{r.title}</h3><p className="mt-0.5 text-[13px] text-muted-foreground">{r.desc}</p></div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(r)}><Eye className="size-4" />Preview</Button>
                <Button variant="outline" size="sm" onClick={() => downloadExcel(r)}><FileSpreadsheet className="size-4" />Excel</Button>
                <Button variant="outline" size="sm" onClick={() => setPending(`Downloading ${r.title} (PDF)`)}><FileText className="size-4" />PDF</Button>
                <Button variant="ghost" size="sm" onClick={() => setPending(`Exporting ${r.title}`)} className="text-muted-foreground"><Share2 className="size-4" />Export</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title} description="Report preview (sample)" className="max-w-2xl">
        <div className="rounded-xl border border-border">
          <div className="bg-navy-rich flex items-center justify-between rounded-t-xl px-4 py-3 text-white">
            <div className="flex items-center gap-2"><img src="/hari-udaan-mark.png" className="size-8 rounded-lg" alt="" /><span className="font-display text-sm font-semibold">HARI UDAAN 2026</span></div>
            <span className="text-[12px] text-white/60">{preview?.title}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {summary.map((s) => <div key={s.key} className="rounded-lg bg-secondary/50 p-3"><p className="text-[11px] text-muted-foreground">{s.label}</p><p className="font-display text-lg font-bold">{s.value}</p></div>)}
          </div>
          <div className="space-y-2 px-4 pb-4">
            {[1, 2, 3, 4].map((n) => <div key={n} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[13px]"><span className="font-medium">HU-2026-{1000 + n} · Awardee {n}</span><span className="text-muted-foreground">Sample row</span></div>)}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
          <Button variant="gold" onClick={() => { setPreview(null); setPending(`Downloading ${preview?.title}`); }}>Download</Button>
        </div>
      </Modal>

      <BackendPendingModal open={!!pending} onClose={() => setPending(null)} action={pending ?? "This action"} />
    </>
  );
}

function formatWorksheet(worksheet: XLSX.WorkSheet, rows: Array<Record<string, unknown>>) {
  const headers = rows.length ? Object.keys(rows[0]) : ["Message"];
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(rows.length, 1), c: headers.length - 1 } }) };
  worksheet["!cols"] = headers.map((header) => {
    const max = Math.max(
      header.length,
      ...rows.slice(0, 200).map((row) => String(row[header] ?? "").length),
    );
    return { wch: Math.min(Math.max(max + 2, 12), header.toLowerCase().includes("address") || header.toLowerCase().includes("remarks") ? 45 : 28) };
  });
}
