import * as React from "react";
import { Link } from "wouter";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { ClipboardCheck, Award, UserPlus, Download, ArrowRight, Plus } from "lucide-react";
import { PageHeader, StatCard, ChartCard } from "@/components/shared";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/primitives";
import { ActivityFeed } from "@/components/feeds";
import { RegBadge, CertBadge, CategoryBadge } from "@/components/badges";
import { BackendPendingModal } from "@/components/shared";
import {
  computeStats, registrationProgress, certificateProgress,
  categoryDistribution, districtDistribution, recentRegistrations, recentCertificates,
} from "@/lib/derive";
import { EVENT } from "@/lib/constants";
import { fmtTime } from "@/lib/format";
import { awardeeService } from "@/services/awardeeService";
import type { ActivityItem, Awardee } from "@/types";

const activity: ActivityItem[] = [];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export default function Dashboard() {
  const [awardees, setAwardees] = React.useState<Awardee[]>([]);
  React.useEffect(() => {
    awardeeService.list().then(setAwardees).catch(() => setAwardees([]));
  }, []);

  const stats = React.useMemo(() => computeStats(awardees), [awardees]);
  const regProg = React.useMemo(() => registrationProgress(awardees), [awardees]);
  const certProg = React.useMemo(() => certificateProgress(awardees), [awardees]);
  const catDist = React.useMemo(() => categoryDistribution(awardees), [awardees]);
  const distDist = React.useMemo(() => districtDistribution(awardees), [awardees]);
  const recentReg = React.useMemo(() => recentRegistrations(awardees, 5), [awardees]);
  const recentCert = React.useMemo(() => recentCertificates(awardees, 5), [awardees]);
  const [pending, setPending] = React.useState(false);

  const certTotal = certProg.reduce((s, x) => s + x.value, 0);
  const pct = certTotal ? Math.round((certProg[0].value / certTotal) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${EVENT.name} · ${EVENT.date} · live ceremony overview`}
        actions={
          <>
            <Button variant="outline" onClick={() => setPending(true)}><Download className="size-4" />Export</Button>
            <Link href="/registration"><Button variant="gold"><Plus className="size-4" />New Registration</Button></Link>
          </>
        }
      />

      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
        {stats.slice(0, 5).map((s, i) => <StatCard key={s.key} stat={s} index={i} />)}
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {stats.slice(5).map((s, i) => <StatCard key={s.key} stat={s} index={i + 5} />)}
      </div>

      {/* charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Registration Progress" subtitle="Check-ins through the day" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={regProg} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b1f4d" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0b1f4d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="registered" stroke="#0b1f4d" strokeWidth={2.5} fill="url(#gReg)" />
              <Area type="monotone" dataKey="target" stroke="#d4af37" strokeWidth={2} strokeDasharray="5 4" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Certificate Progress" subtitle={`${pct}% issued`}>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={certProg} dataKey="value" innerRadius={62} outerRadius={88} startAngle={90} endAngle={-270} paddingAngle={2}>
                  {certProg.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold">{pct}%</span>
              <span className="text-[12px] text-muted-foreground">Issued</span>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-5">
            {certProg.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[12px]">
                <span className="size-2.5 rounded-full" style={{ background: c.fill }} />
                <span className="text-muted-foreground">{c.name}</span>
                <b>{c.value}</b>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Award Categories" subtitle="Distribution by merit tier">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catDist} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#d4af37" barSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="District Distribution" subtitle="Top districts represented">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={distDist} margin={{ left: 20, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="district" width={70} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#0b1f4d" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* tables + activity */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <RecentTable
            title="Recent Registrations" icon={<ClipboardCheck className="size-4 text-emerald-600" />}
            rows={recentReg.map((a) => ({ a, status: <RegBadge status={a.registrationStatus} />, time: fmtTime(a.checkedInAt), by: a.checkedInBy }))}
          />
          <RecentTable
            title="Recent Certificates" icon={<Award className="size-4 text-gold" />}
            rows={recentCert.map((a) => ({ a, status: <CertBadge status={a.certificateStatus} />, time: fmtTime(a.certificateIssuedAt), by: a.certificateIssuedBy }))}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 font-display text-base font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Register", icon: ClipboardCheck, to: "/registration", c: "text-emerald-600" },
                { label: "Issue Cert", icon: Award, to: "/certificate", c: "text-gold" },
                { label: "Add User", icon: UserPlus, to: "/users", c: "text-blue-600" },
                { label: "Reports", icon: Download, to: "/reports", c: "text-indigo-600" },
              ].map((q) => (
                <Link key={q.label} href={q.to}>
                  <div className="group flex flex-col items-center gap-2 rounded-xl border border-border p-3.5 text-center transition hover:border-gold/40 hover:bg-secondary/50">
                    <q.icon className={`size-5 ${q.c}`} />
                    <span className="text-[13px] font-medium">{q.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Recent Activity</h3>
              <span className="text-[11px] text-muted-foreground">live</span>
            </div>
            <ActivityFeed items={activity} />
          </Card>
        </div>
      </div>
      <BackendPendingModal open={pending} onClose={() => setPending(false)} action="Exporting the dashboard" />
    </>
  );
}

function RecentTable({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: { a: { id: string; name: string; avatarSeed: string; awardCategory: string }; status: React.ReactNode; time: string; by?: string }[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-secondary">{icon}</span><h3 className="font-display text-base font-semibold">{title}</h3></div>
        <Link href="/awardees"><button className="flex items-center gap-1 text-[13px] font-medium text-navy hover:underline dark:text-gold">View all <ArrowRight className="size-3.5" /></button></Link>
      </div>
      <div className="divide-y divide-border/60">
        {rows.map(({ a, status, time, by }) => (
          <Link key={a.id} href={`/awardees/${a.id}`}>
            <div className="flex items-center gap-3 px-5 py-3 transition hover:bg-secondary/50">
              <Avatar name={a.name} seed={a.avatarSeed} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">{a.id} · {by ?? "—"}</p>
              </div>
              <div className="hidden sm:block"><CategoryBadge category={a.awardCategory} /></div>
              {status}
              <span className="hidden w-12 text-right text-[12px] text-muted-foreground md:block">{time}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
