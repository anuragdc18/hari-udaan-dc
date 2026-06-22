import * as React from "react";
import { Search, UserCheck, Phone, Mail, MapPin, GraduationCap, Save, X, Check, Clock, Plus } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { Card, Input, Label, Textarea, Select, Switch, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RegBadge, CategoryBadge } from "@/components/badges";
import { useToast } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/session";
import { awardeeService } from "@/services/awardeeService";
import { registrationService } from "@/services/registrationService";
import { fmtDate, fmtTime } from "@/lib/format";
import type { Awardee } from "@/types";

export default function RegistrationDesk() {
  const { push } = useToast();
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<Awardee | null>(null);
  const [attended, setAttended] = React.useState(true);
  const [parents, setParents] = React.useState(2);
  const [guests, setGuests] = React.useState(0);
  const [parentName, setParentName] = React.useState("");
  const [parentPhone, setParentPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [awardees, setAwardees] = React.useState<Awardee[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newAwardee, setNewAwardee] = React.useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    college: "",
    course: "",
    percentage: "",
    awardCategory: "Excellence Award",
    district: "",
    parentName: "",
    parentPhone: "",
    address: "",
    remarks: "",
  });
  const [creating, setCreating] = React.useState(false);
  const currentUser = getCurrentUser();
  const familyMembers = parents + guests;
  const totalEntered = (attended ? 1 : 0) + familyMembers;

  React.useEffect(() => {
    awardeeService.list().then(setAwardees).catch(() => setAwardees([]));
  }, []);

  const results = React.useMemo(() => {
    const ql = q.toLowerCase().trim();
    if (!ql) return awardees.slice(0, 6);
    return awardees.filter((a) => a.name.toLowerCase().includes(ql) || a.id.toLowerCase().includes(ql) || a.phone.includes(ql) || a.email.toLowerCase().includes(ql)).slice(0, 8);
  }, [awardees, q]);

  function selectAwardee(a: Awardee) {
    setSelected(a);
    setAttended(a.studentAttended || true);
    setParents(a.parentsCount || 2);
    setGuests(a.guestsCount || 0);
    setParentName(a.parentName);
    setParentPhone(a.parentPhone);
    setAddress(a.address);
    setRemarks(a.remarks);
  }

  async function markRegistered() {
    if (!selected) return;
    try {
      const updated = await registrationService.markRegistered(selected.id, {
        studentAttended: attended,
        parentsCount: parents,
        guestsCount: guests,
        parentName,
        parentPhone,
        address,
        remarks,
        checkedInBy: currentUser.name,
      });
      setAwardees((items) => items.map((item) => item.id === updated.id ? updated : item));
      push({ type: "success", title: "Awardee registered", description: `${selected.name} checked in successfully.` });
      setSelected(null); setQ("");
    } catch {
      push({ type: "error", title: "Check-in failed", description: "Could not save registration. Please try again." });
    }
  }

  async function addAwardee() {
    if (!newAwardee.name.trim() || !newAwardee.phone.trim()) {
      push({ type: "warning", title: "Missing details", description: "Student name and phone are required." });
      return;
    }

    setCreating(true);
    try {
      const created = await awardeeService.create({
        ...newAwardee,
        percentage: Number(newAwardee.percentage) || 0,
        registrationStatus: "Pending",
        certificateStatus: "Pending",
        dataFlag: newAwardee.email ? "ok" : "Missing Data",
      } as Partial<Awardee>);
      setAwardees((items) => [created, ...items]);
      selectAwardee(created);
      setAddOpen(false);
      setQ(created.name);
      setNewAwardee({ id: "", name: "", phone: "", email: "", college: "", course: "", percentage: "", awardCategory: "Excellence Award", district: "", parentName: "", parentPhone: "", address: "", remarks: "" });
      push({ type: "success", title: "Awardee added", description: `${created.name} is ready for registration.` });
    } catch (error) {
      push({ type: "error", title: "Could not add awardee", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Registration Desk"
        subtitle="Fast check-in for awardees at the ceremony."
        actions={<Button variant="gold" onClick={() => setAddOpen(true)}><Plus className="size-4" />Add Awardee</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* search panel */}
        <Card className="p-4 lg:col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, email, ID, card…" className="pl-10" autoFocus />
          </div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{q ? `${results.length} matches` : "Recent awardees"}</p>
          <div className="space-y-1.5">
            {results.map((a) => (
              <button key={a.id} onClick={() => selectAwardee(a)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${selected?.id === a.id ? "border-gold bg-[#fbf3da]/40 dark:bg-gold/10" : "border-border hover:bg-secondary/50"}`}>
                <Avatar name={a.name} seed={a.avatarSeed} size={38} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.name}</p><p className="truncate text-[12px] text-muted-foreground">{a.id} · {a.district}</p></div>
                <RegBadge status={a.registrationStatus} />
              </button>
            ))}
            {results.length === 0 && <div className="py-10"><EmptyState title="No match" description="Search by name, phone or ID." /></div>}
          </div>
        </Card>

        {/* detail + form */}
        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="flex h-full min-h-[400px] items-center justify-center p-8">
              <EmptyState icon="ClipboardList" title="Select an awardee" description="Search and pick an awardee to begin registration." />
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} seed={selected.avatarSeed} size={52} />
                  <div>
                    <h3 className="font-display text-lg font-semibold">{selected.name}</h3>
                    <p className="text-[13px] text-muted-foreground">{selected.id} · {selected.percentage}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2"><CategoryBadge category={selected.awardCategory} /><RegBadge status={selected.registrationStatus} /></div>
              </div>

              {/* read-only details */}
              <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2">
                <Mini icon={GraduationCap} label="College" value={selected.college} />
                <Mini icon={Phone} label="Phone" value={selected.phone} />
                <Mini icon={Mail} label="Email" value={selected.email} />
                <Mini icon={MapPin} label="District" value={selected.district} />
              </div>

              {/* form */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold"><UserCheck className="size-4 text-emerald-600" />Registration Form</h4>

                <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <span className="text-sm font-medium">Student Attended</span>
                  <div className="flex items-center gap-2"><span className="text-[13px] text-muted-foreground">{attended ? "Yes" : "No"}</span><Switch checked={attended} onChange={setAttended} /></div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-5">
                  <Count label="Student" value={attended ? 1 : 0} />
                  <Count label="Parents" value={parents} />
                  <Count label="Guests" value={guests} />
                  <Count label="Family Members" value={familyMembers} />
                  <Count label="Total Entered" value={totalEntered} strong />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div><Label>No. of Parents</Label><Select value={String(parents)} onChange={(e) => setParents(+e.target.value)}>{[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</Select></div>
                  <div><Label>No. of Guests</Label><Select value={String(guests)} onChange={(e) => setGuests(+e.target.value)}>{[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</Select></div>
                  <div><Label>Total People</Label><Input value={totalEntered} disabled className="bg-secondary font-semibold" /></div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><Label>Parent Name</Label><Input value={parentName} onChange={(e) => setParentName(e.target.value)} /></div>
                  <div><Label>Parent Phone</Label><Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} /></div>
                </div>
                <div className="mt-3"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                <div className="mt-3"><Label>Remarks</Label><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes…" /></div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="gold" onClick={markRegistered}><Check className="size-4" />Mark Registered</Button>
                  <Button variant="outline" onClick={() => selected && registrationService.saveDraft(selected.id, { parentsCount: parents, guestsCount: guests, parentName, parentPhone, address, remarks }).then((updated) => { setAwardees((items) => items.map((item) => item.id === updated.id ? updated : item)); push({ type: "info", title: "Draft saved", description: "Registration draft saved." }); })}><Save className="size-4" />Save Draft</Button>
                  <Button variant="ghost" onClick={() => setSelected(null)} className="text-muted-foreground"><X className="size-4" />Cancel</Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><UserCheck className="size-3.5" />Checked in by <b className="text-foreground">{selected.checkedInBy ?? currentUser.name}</b></span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{selected.checkedInAt ? `${fmtDate(selected.checkedInAt)} · ${fmtTime(selected.checkedInAt)}` : "Now"}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add awardee"
        description="Create a new awardee record and continue registration."
        className="max-w-3xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={addAwardee} disabled={creating}>{creating ? "Adding..." : "Add awardee"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><Label>Student ID</Label><Input value={newAwardee.id} onChange={(e) => setNewAwardee({ ...newAwardee, id: e.target.value })} placeholder="Optional" /></div>
          <div><Label>Student Name</Label><Input value={newAwardee.name} onChange={(e) => setNewAwardee({ ...newAwardee, name: e.target.value })} placeholder="Required" /></div>
          <div><Label>Phone</Label><Input value={newAwardee.phone} onChange={(e) => setNewAwardee({ ...newAwardee, phone: e.target.value })} placeholder="Required" /></div>
          <div><Label>Email</Label><Input type="email" value={newAwardee.email} onChange={(e) => setNewAwardee({ ...newAwardee, email: e.target.value })} /></div>
          <div><Label>College</Label><Input value={newAwardee.college} onChange={(e) => setNewAwardee({ ...newAwardee, college: e.target.value })} /></div>
          <div><Label>Course</Label><Input value={newAwardee.course} onChange={(e) => setNewAwardee({ ...newAwardee, course: e.target.value })} /></div>
          <div><Label>Percentage</Label><Input type="number" value={newAwardee.percentage} onChange={(e) => setNewAwardee({ ...newAwardee, percentage: e.target.value })} /></div>
          <div><Label>Award Category</Label><Select value={newAwardee.awardCategory} onChange={(e) => setNewAwardee({ ...newAwardee, awardCategory: e.target.value })}>
            <option value="Topper Award">Topper Award</option>
            <option value="Gold Merit">Gold Merit</option>
            <option value="Silver Merit">Silver Merit</option>
            <option value="Bronze Merit">Bronze Merit</option>
            <option value="Excellence Award">Excellence Award</option>
          </Select></div>
          <div><Label>District</Label><Input value={newAwardee.district} onChange={(e) => setNewAwardee({ ...newAwardee, district: e.target.value })} /></div>
          <div><Label>Parent Name</Label><Input value={newAwardee.parentName} onChange={(e) => setNewAwardee({ ...newAwardee, parentName: e.target.value })} /></div>
          <div><Label>Parent Phone</Label><Input value={newAwardee.parentPhone} onChange={(e) => setNewAwardee({ ...newAwardee, parentPhone: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={newAwardee.address} onChange={(e) => setNewAwardee({ ...newAwardee, address: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Remarks</Label><Textarea value={newAwardee.remarks} onChange={(e) => setNewAwardee({ ...newAwardee, remarks: e.target.value })} /></div>
        </div>
      </Modal>
    </>
  );
}

function Mini({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0"><p className="text-[11px] text-muted-foreground">{label}</p><p className="truncate text-[13px] font-medium">{value}</p></div>
    </div>
  );
}

function Count({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-lg border border-border/70 px-3 py-2 ${strong ? "bg-[#fbf3da] text-navy dark:bg-gold/10 dark:text-gold" : "bg-secondary/40"}`}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold leading-none">{value}</p>
    </div>
  );
}
