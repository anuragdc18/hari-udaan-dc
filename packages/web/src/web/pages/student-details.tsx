import * as React from "react";
import { useRoute, Link, useLocation } from "wouter";
import {
  ArrowLeft, Phone, Mail, MapPin, GraduationCap, Building2, Percent, Users,
  Calendar, Clock, UserCheck, Pencil, Award,
} from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Card, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RegBadge, CertBadge, CategoryBadge, FlagBadge } from "@/components/badges";
import { Timeline } from "@/components/feeds";
import { awardeeService } from "@/services/awardeeService";
import { fmtDate, fmtTime, fmtDateTime } from "@/lib/format";
import type { Awardee } from "@/types";

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0"><p className="text-[12px] text-muted-foreground">{label}</p><p className="truncate text-sm font-medium">{value}</p></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 font-display text-base font-semibold">{title}</h3>
      {children}
    </Card>
  );
}

export default function StudentDetails() {
  const [, params] = useRoute("/awardees/:id");
  const [, navigate] = useLocation();
  const [awardee, setAwardee] = React.useState<Awardee | null | undefined>(undefined);

  React.useEffect(() => {
    if (!params?.id) return;
    awardeeService.getById(params.id).then(setAwardee).catch(() => setAwardee(null));
  }, [params?.id]);

  if (awardee === undefined)
    return (
      <Card className="p-8"><EmptyState icon="Loader" title="Loading awardee" /></Card>
    );

  if (!awardee)
    return (
      <Card className="p-8"><EmptyState icon="UserX" title="Awardee not found" description="This record doesn't exist." /></Card>
    );

  const a = awardee;
  const steps = [
    { title: "Awardee onboarded", description: `Record created · ${a.id}`, time: fmtDate(a.createdAt), done: true },
    { title: "Invitation sent", description: "Ceremony invite delivered", time: fmtDate(a.createdAt), done: true },
    { title: "Registration desk", description: a.registrationStatus === "Registered" ? `Checked in by ${a.checkedInBy}` : "Awaiting check-in", time: a.checkedInAt ? fmtDateTime(a.checkedInAt) : "—", done: a.registrationStatus === "Registered" },
    { title: "Certificate issued", description: a.certificateStatus === "Issued" ? `Issued by ${a.certificateIssuedBy}` : "Pending registration", time: a.certificateIssuedAt ? fmtDateTime(a.certificateIssuedAt) : "—", done: a.certificateStatus === "Issued" },
  ];

  return (
    <>
      <button onClick={() => navigate("/awardees")} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Awardees
      </button>

      {/* hero */}
      <Card className="mb-4 overflow-hidden">
        <div className="bg-navy-rich relative h-24">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl" />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-2xl border-4 border-card"><Avatar name={a.name} seed={a.avatarSeed} size={80} className="rounded-xl" /></div>
              <div className="pb-1">
                <div className="flex items-center gap-2"><h1 className="font-display text-xl font-bold">{a.name}</h1><FlagBadge flag={a.dataFlag} /></div>
                <p className="text-sm text-muted-foreground">{a.id} · {a.district}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={a.awardCategory} />
              <RegBadge status={a.registrationStatus} />
              <CertBadge status={a.certificateStatus} />
              <Link href="/registration"><Button variant="gold" size="sm"><Pencil className="size-3.5" />Manage</Button></Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Personal Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info icon={Phone} label="Phone" value={a.phone} />
              <Info icon={Mail} label="Email" value={a.email} />
              <Info icon={MapPin} label="Address" value={a.address} />
              <Info icon={Building2} label="District" value={a.district} />
            </div>
          </Section>

          <Section title="Academic Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info icon={GraduationCap} label="College" value={a.college} />
              <Info icon={GraduationCap} label="Course" value={a.course} />
              <Info icon={Percent} label="Percentage" value={`${a.percentage}%`} />
              <Info icon={Award} label="Award Category" value={a.awardCategory} />
            </div>
          </Section>

          <Section title="Registration Status">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info icon={UserCheck} label="Student Attended" value={a.studentAttended ? "Yes" : "No"} />
              <Info icon={Users} label="Parents / Guests" value={`${a.parentsCount} parents · ${a.guestsCount} guests`} />
              <Info icon={UserCheck} label="Checked In By" value={a.checkedInBy ?? "—"} />
              <Info icon={Clock} label="Check-in Time" value={a.checkedInAt ? `${fmtDate(a.checkedInAt)} · ${fmtTime(a.checkedInAt)}` : "—"} />
              <Info icon={Users} label="Parent Name" value={a.parentName} />
              <Info icon={Phone} label="Parent Phone" value={a.parentPhone} />
            </div>
          </Section>

          <Section title="Certificate Status">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info icon={Award} label="Status" value={<CertBadge status={a.certificateStatus} />} />
              <Info icon={UserCheck} label="Issued By" value={a.certificateIssuedBy ?? "—"} />
              <Info icon={Calendar} label="Issued On" value={a.certificateIssuedAt ? fmtDate(a.certificateIssuedAt) : "—"} />
              <Info icon={Clock} label="Issued At" value={a.certificateIssuedAt ? fmtTime(a.certificateIssuedAt) : "—"} />
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Timeline">
            <Timeline steps={steps} />
          </Section>
          <Section title="Remarks">
            <p className="text-sm text-muted-foreground">{a.remarks || "No remarks recorded for this awardee."}</p>
          </Section>
        </div>
      </div>
    </>
  );
}
