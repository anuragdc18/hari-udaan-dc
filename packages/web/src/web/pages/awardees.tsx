import * as React from "react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import { Search, SlidersHorizontal, Download, Upload, Eye, MoreVertical } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { Card, Input, Select, Avatar, Label, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/data-table";
import { RegBadge, CertBadge, CategoryBadge, FlagBadge } from "@/components/badges";
import { DISTRICTS, AWARD_CATEGORIES } from "@/lib/constants";
import { awardeeService } from "@/services/awardeeService";
import type { Awardee } from "@/types";

export default function Awardees() {
  const [, navigate] = useLocation();
  const { push } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [reg, setReg] = React.useState("");
  const [awardees, setAwardees] = React.useState<Awardee[]>([]);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [selectedAwardee, setSelectedAwardee] = React.useState<Awardee | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    college: "",
    course: "",
    percentage: "",
    awardCategory: "Excellence Award",
    district: "",
    registrationStatus: "Pending",
    certificateStatus: "Pending",
    remarks: "",
  });

  React.useEffect(() => {
    awardeeService.list().then(setAwardees).catch(() => setAwardees([]));
  }, []);

  async function importFile(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const result = await awardeeService.importRows(rows);
      setAwardees((current) => [...result.imported, ...current]);
      push({ type: "success", title: "Import complete", description: `${result.imported.length} imported, ${result.duplicates.length} duplicates skipped.` });
    } catch {
      push({ type: "error", title: "Import failed", description: "Please upload a valid Excel or CSV file." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function exportAwardees() {
    const rows = filtered.map((a, index) => ({
      "S.No": index + 1,
      "Awardee ID": a.id,
      "Awardee Name": a.name,
      "Phone Number": a.phone,
      "Email ID": a.email,
      District: a.district,
      Address: a.address,
      "College Name": a.college,
      "Course / Stream": a.course,
      Percentage: a.percentage,
      "Award Category": a.awardCategory,
      "Registration Status": a.registrationStatus,
      "Student Attended": a.studentAttended ? "Yes" : "No",
      "Parent Name": a.parentName,
      "Parent Phone Number": a.parentPhone,
      "Number of Parents": a.parentsCount,
      "Number of Guests": a.guestsCount,
      "Family Members Came": a.parentsCount + a.guestsCount,
      "Total People Came": (a.studentAttended ? 1 : 0) + a.parentsCount + a.guestsCount,
      "Registered By": a.checkedInBy ?? "",
      "Registration Time": formatDateTime(a.checkedInAt),
      "Certificate Issued Status": a.certificateStatus,
      "Certificate Issued By": a.certificateIssuedBy ?? "",
      "Certificate Issued Time": formatDateTime(a.certificateIssuedAt),
      Remarks: a.remarks,
      "Data Flag": a.dataFlag,
      "Created At": formatDateTime(a.createdAt),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    formatWorksheet(worksheet, rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Awardees");
    XLSX.writeFile(workbook, "hari-udaan-awardees.xlsx");
  }

  function openManageAwardee(awardee: Awardee) {
    setSelectedAwardee(awardee);
    setEditForm({
      name: awardee.name,
      phone: awardee.phone,
      email: awardee.email,
      college: awardee.college,
      course: awardee.course,
      percentage: String(awardee.percentage),
      awardCategory: awardee.awardCategory,
      district: awardee.district,
      registrationStatus: awardee.registrationStatus,
      certificateStatus: awardee.certificateStatus,
      remarks: awardee.remarks,
    });
    setManageOpen(true);
  }

  async function updateAwardee() {
    if (!selectedAwardee) return;
    try {
      const updated = await awardeeService.update(selectedAwardee.id, {
        ...editForm,
        percentage: Number(editForm.percentage) || 0,
        awardCategory: editForm.awardCategory as Awardee["awardCategory"],
        registrationStatus: editForm.registrationStatus as Awardee["registrationStatus"],
        certificateStatus: editForm.certificateStatus as Awardee["certificateStatus"],
      });
      setAwardees((items) => items.map((awardee) => awardee.id === updated.id ? updated : awardee));
      setManageOpen(false);
      push({ type: "success", title: "Awardee updated", description: `${updated.name} was updated.` });
    } catch (error) {
      push({ type: "error", title: "Update failed", description: error instanceof Error ? error.message : "Could not update awardee." });
    }
  }

  async function removeAwardee() {
    if (!selectedAwardee) return;
    try {
      await awardeeService.remove(selectedAwardee.id);
      setAwardees((items) => items.filter((awardee) => awardee.id !== selectedAwardee.id));
      setManageOpen(false);
      push({ type: "success", title: "Awardee removed", description: `${selectedAwardee.name} was removed.` });
    } catch (error) {
      push({ type: "error", title: "Remove failed", description: error instanceof Error ? error.message : "Could not remove awardee." });
    }
  }

  const filtered = React.useMemo(() => {
    const ql = q.toLowerCase().trim();
    return awardees.filter((a) => {
      if (ql && !(a.name.toLowerCase().includes(ql) || a.id.toLowerCase().includes(ql) || a.phone.includes(ql) || a.email.toLowerCase().includes(ql) || a.college.toLowerCase().includes(ql))) return false;
      if (district && a.district !== district) return false;
      if (category && a.awardCategory !== category) return false;
      if (reg && a.registrationStatus !== reg) return false;
      return true;
    });
  }, [awardees, q, district, category, reg]);

  const columns: Column<Awardee>[] = [
    {
      key: "name", header: "Awardee", sortable: true, sortValue: (a) => a.name,
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.name} seed={a.avatarSeed} size={36} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5"><p className="truncate text-sm font-semibold">{a.name}</p><FlagBadge flag={a.dataFlag} /></div>
            <p className="truncate text-[12px] text-muted-foreground">{a.id}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Contact", className: "hidden xl:table-cell", render: (a) => <div><p className="text-[13px]">{a.phone}</p><p className="text-[12px] text-muted-foreground">{a.email}</p></div> },
    { key: "college", header: "College", className: "hidden lg:table-cell", render: (a) => <div><p className="truncate text-[13px] font-medium">{a.college}</p><p className="text-[12px] text-muted-foreground">{a.course}</p></div> },
    { key: "percentage", header: "%", sortable: true, sortValue: (a) => a.percentage, render: (a) => <span className="font-display font-semibold tabular-nums">{a.percentage}</span> },
    { key: "category", header: "Award", className: "hidden sm:table-cell", render: (a) => <CategoryBadge category={a.awardCategory} /> },
    { key: "district", header: "District", className: "hidden xl:table-cell", sortable: true, sortValue: (a) => a.district, render: (a) => <span className="text-[13px]">{a.district}</span> },
    { key: "reg", header: "Status", render: (a) => <div className="flex flex-col gap-1"><RegBadge status={a.registrationStatus} /><CertBadge status={a.certificateStatus} /></div> },
    {
      key: "actions", header: "", className: "w-10",
      render: (a) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/awardees/${a.id}`); }} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Eye className="size-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); openManageAwardee(a); }} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><MoreVertical className="size-4" /></button>
        </div>
      ),
    },
  ];

  const hasFilters = q || district || category || reg;

  return (
    <>
      <PageHeader
        title="Awardees"
        subtitle={`${awardees.length} merit awardees - ${filtered.length} shown`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" />Import</Button>
            <Button variant="outline" onClick={exportAwardees}><Download className="size-4" />Export</Button>
          </>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, phone, email, college…" className="pl-10" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:flex">
            <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="lg:w-40"><option value="">All Districts</option>{DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}</Select>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="lg:w-40"><option value="">All Awards</option>{AWARD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
            <Select value={reg} onChange={(e) => setReg(e.target.value)} className="lg:w-36"><option value="">All Status</option><option value="Registered">Registered</option><option value="Pending">Pending</option><option value="Absent">Absent</option></Select>
            {hasFilters && <Button variant="ghost" onClick={() => { setQ(""); setDistrict(""); setCategory(""); setReg(""); }} className="text-muted-foreground"><SlidersHorizontal className="size-4" />Clear</Button>}
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={12}
          onRowClick={(a) => navigate(`/awardees/${a.id}`)}
          emptyState={<EmptyState title="No awardees found" description="Try adjusting your search or filters." />}
        />
      </Card>

      <Modal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title="Manage awardee"
        description="Edit details, statuses or remove this awardee."
        className="max-w-3xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setManageOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={removeAwardee} className="text-red-600">Remove</Button>
            <Button variant="gold" onClick={updateAwardee}>Save changes</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
          <div><Label>District</Label><Input value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} /></div>
          <div><Label>College</Label><Input value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} /></div>
          <div><Label>Course</Label><Input value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} /></div>
          <div><Label>Percentage</Label><Input type="number" value={editForm.percentage} onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })} /></div>
          <div><Label>Award Category</Label><Select value={editForm.awardCategory} onChange={(e) => setEditForm({ ...editForm, awardCategory: e.target.value })}>
            {AWARD_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </Select></div>
          <div><Label>Registration Status</Label><Select value={editForm.registrationStatus} onChange={(e) => setEditForm({ ...editForm, registrationStatus: e.target.value })}>
            <option value="Registered">Registered</option>
            <option value="Pending">Pending</option>
            <option value="Absent">Absent</option>
          </Select></div>
          <div><Label>Certificate Status</Label><Select value={editForm.certificateStatus} onChange={(e) => setEditForm({ ...editForm, certificateStatus: e.target.value })}>
            <option value="Issued">Issued</option>
            <option value="Pending">Pending</option>
          </Select></div>
          <div className="sm:col-span-2"><Label>Remarks</Label><Textarea value={editForm.remarks} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
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
