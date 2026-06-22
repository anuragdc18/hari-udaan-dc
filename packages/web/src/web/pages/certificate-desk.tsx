import * as React from "react";
import { Search, Award, AlertTriangle, Check, X, UserCheck, Clock, Percent } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { Card, Input, Label, Select, Textarea, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RegBadge, CertBadge, CategoryBadge } from "@/components/badges";
import { useToast } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/session";
import { awardeeService } from "@/services/awardeeService";
import { certificateService } from "@/services/certificateService";
import { fmtDate, fmtTime } from "@/lib/format";
import type { Awardee } from "@/types";

const awardCategories: Awardee["awardCategory"][] = ["Topper Award", "Gold Merit", "Silver Merit", "Bronze Merit", "Excellence Award"];

export default function CertificateDesk() {
  const { push } = useToast();
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<Awardee | null>(null);
  const [remarks, setRemarks] = React.useState("");
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
    parentName: "",
    parentPhone: "",
    parentsCount: "0",
    guestsCount: "0",
    address: "",
  });
  const [awardees, setAwardees] = React.useState<Awardee[]>([]);
  const currentUser = getCurrentUser();

  React.useEffect(() => {
    awardeeService.list().then(setAwardees).catch(() => setAwardees([]));
  }, []);

  const results = React.useMemo(() => {
    const ql = q.toLowerCase().trim();
    if (!ql) return awardees.filter((a) => a.registrationStatus === "Registered").slice(0, 6);
    return awardees.filter((a) => a.name.toLowerCase().includes(ql) || a.id.toLowerCase().includes(ql) || a.phone.includes(ql) || a.email.toLowerCase().includes(ql)).slice(0, 8);
  }, [awardees, q]);

  const notRegistered = selected && editForm.registrationStatus !== "Registered";

  function selectAwardee(awardee: Awardee) {
    setSelected(awardee);
    setRemarks(awardee.remarks || "");
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
      parentName: awardee.parentName,
      parentPhone: awardee.parentPhone,
      parentsCount: String(awardee.parentsCount ?? 0),
      guestsCount: String(awardee.guestsCount ?? 0),
      address: awardee.address,
    });
  }

  async function saveEdits() {
    if (!selected) return null;
    const updated = await awardeeService.update(selected.id, {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      college: editForm.college,
      course: editForm.course,
      percentage: Number(editForm.percentage) || 0,
      awardCategory: editForm.awardCategory as Awardee["awardCategory"],
      district: editForm.district,
      registrationStatus: editForm.registrationStatus as Awardee["registrationStatus"],
      parentName: editForm.parentName,
      parentPhone: editForm.parentPhone,
      parentsCount: Number(editForm.parentsCount) || 0,
      guestsCount: Number(editForm.guestsCount) || 0,
      address: editForm.address,
      remarks,
    });
    setAwardees((items) => items.map((item) => item.id === updated.id ? updated : item));
    setSelected(updated);
    return updated;
  }

  async function saveOnly() {
    try {
      const updated = await saveEdits();
      if (updated) push({ type: "success", title: "Awardee updated", description: `${updated.name} details saved.` });
    } catch (error) {
      push({ type: "error", title: "Save failed", description: error instanceof Error ? error.message : "Could not save awardee details." });
    }
  }

  async function issue() {
    if (!selected) return;
    try {
      const saved = await saveEdits();
      if (!saved) return;
      const updated = await certificateService.issue(saved.id, { issuedBy: currentUser.name, remarks });
      setAwardees((items) => items.map((item) => item.id === updated.id ? updated : item));
      push({ type: "success", title: "Certificate issued", description: `${updated.awardCategory} certificate issued to ${updated.name}.` });
      setSelected(null);
      setRemarks("");
      setQ("");
    } catch (error) {
      push({ type: "error", title: "Issue failed", description: error instanceof Error ? error.message : "Certificate can only be issued after registration." });
    }
  }

  return (
    <>
      <PageHeader title="Certificate Desk" subtitle="Issue merit certificates to registered awardees." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search awardee..." className="pl-10" autoFocus />
          </div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{q ? `${results.length} matches` : "Registered awardees"}</p>
          <div className="space-y-1.5">
            {results.map((a) => (
              <button key={a.id} onClick={() => selectAwardee(a)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${selected?.id === a.id ? "border-gold bg-[#fbf3da]/40 dark:bg-gold/10" : "border-border hover:bg-secondary/50"}`}>
                <Avatar name={a.name} seed={a.avatarSeed} size={38} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.name}</p><p className="truncate text-[12px] text-muted-foreground">{a.id}</p></div>
                <CertBadge status={a.certificateStatus} />
              </button>
            ))}
            {results.length === 0 && <div className="py-10"><EmptyState title="No match" /></div>}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="flex h-full min-h-[400px] items-center justify-center p-8">
              <EmptyState icon="Award" title="Select an awardee" description="Pick an awardee to issue their certificate." />
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={editForm.name} seed={selected.avatarSeed} size={52} />
                  <div><h3 className="font-display text-lg font-semibold">{editForm.name}</h3><p className="text-[13px] text-muted-foreground">{selected.id}</p></div>
                </div>
                <CategoryBadge category={editForm.awardCategory as Awardee["awardCategory"]} />
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
                <Stat icon={Percent} label="Percentage" value={`${Number(editForm.percentage) || 0}%`} />
                <Stat icon={Award} label="Category" value={editForm.awardCategory.replace(" Award", "").replace(" Merit", "")} />
                <div className="flex flex-col gap-1"><span className="text-[11px] text-muted-foreground">Registration</span><RegBadge status={editForm.registrationStatus as Awardee["registrationStatus"]} /></div>
                <div className="flex flex-col gap-1"><span className="text-[11px] text-muted-foreground">Certificate</span><CertBadge status={selected.certificateStatus} /></div>
              </div>

              {notRegistered && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div><p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Registration incomplete</p><p className="text-[13px] text-amber-700 dark:text-amber-400/90">Set registration status to Registered before issuing.</p></div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Award className="size-4 text-gold" />Certificate Form</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                  <div><Label>District</Label><Input value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} /></div>
                  <div><Label>College</Label><Input value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} /></div>
                  <div><Label>Course</Label><Input value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} /></div>
                  <div><Label>Percentage</Label><Input type="number" value={editForm.percentage} onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })} /></div>
                  <div><Label>Award Category</Label><Select value={editForm.awardCategory} onChange={(e) => setEditForm({ ...editForm, awardCategory: e.target.value })}>
                    {awardCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </Select></div>
                  <div><Label>Registration Status</Label><Select value={editForm.registrationStatus} onChange={(e) => setEditForm({ ...editForm, registrationStatus: e.target.value })}>
                    <option value="Registered">Registered</option>
                    <option value="Pending">Pending</option>
                    <option value="Absent">Absent</option>
                  </Select></div>
                  <div><Label>Certificate Status</Label><Input value={selected.certificateStatus} readOnly className="bg-secondary" /></div>
                  <div><Label>Issued By</Label><Input value={currentUser.name} readOnly className="bg-secondary" /></div>
                  <div><Label>Issue Date & Time</Label><Input value={`${fmtDate(new Date().toISOString())} ${fmtTime(new Date().toISOString())}`} readOnly className="bg-secondary" /></div>
                  <div><Label>Parent Name</Label><Input value={editForm.parentName} onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })} /></div>
                  <div><Label>Parent Phone</Label><Input value={editForm.parentPhone} onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })} /></div>
                  <div><Label>Parents Count</Label><Input type="number" value={editForm.parentsCount} onChange={(e) => setEditForm({ ...editForm, parentsCount: e.target.value })} /></div>
                  <div><Label>Guests Count</Label><Input type="number" value={editForm.guestsCount} onChange={(e) => setEditForm({ ...editForm, guestsCount: e.target.value })} /></div>
                </div>
                <div className="mt-3"><Label>Address</Label><Textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
                <div className="mt-3"><Label>Remarks</Label><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes..." /></div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={saveOnly}>Save Details</Button>
                  <Button variant="gold" onClick={issue} disabled={!!notRegistered}><Check className="size-4" />Issue Certificate</Button>
                  <Button variant="ghost" onClick={() => setSelected(null)} className="text-muted-foreground"><X className="size-4" />Cancel</Button>
                </div>
              </div>

              {selected.certificateIssuedAt && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><UserCheck className="size-3.5" />Issued by <b className="text-foreground">{selected.certificateIssuedBy}</b></span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{fmtDate(selected.certificateIssuedAt)} - {fmtTime(selected.certificateIssuedAt)}</span>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0"><p className="text-[11px] text-muted-foreground">{label}</p><p className="truncate text-[13px] font-semibold">{value}</p></div>
    </div>
  );
}
