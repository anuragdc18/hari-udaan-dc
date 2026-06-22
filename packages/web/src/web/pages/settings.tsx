import * as React from "react";
import { CalendarDays, Palette, Bell, ShieldCheck, SlidersHorizontal, Sun, Moon, Save } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, Input, Label, Textarea, Select, Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/hooks/use-theme";
import { EVENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TabId = "general" | "event" | "branding" | "theme" | "notifications" | "security";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "event", label: "Event Details", icon: CalendarDays },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "theme", label: "Theme", icon: Sun },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleRow({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[13px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={value} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { push } = useToast();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = React.useState<TabId>("general");
  const [notif, setNotif] = React.useState({ email: true, registration: true, certificate: true, duplicate: true, daily: false });

  function save() {
    push({ type: "success", title: "Settings saved", description: "Changes will persist once the backend is connected." });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure your event portal, branding and preferences"
        actions={<Button variant="gold" onClick={save}><Save className="size-4" />Save changes</Button>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_1fr]">
        <Card className="h-fit p-2">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => {
              const TIcon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                    active ? "bg-navy-rich text-white shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <TIcon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="p-6">
          {tab === "general" && (
            <Section title="General" description="Basic portal configuration.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Portal name"><Input defaultValue="HARI UDAAN 2026 Portal" /></Field>
                <Field label="Support email"><Input defaultValue="support@hariudaan.org" /></Field>
                <Field label="Timezone"><Select defaultValue="IST"><option value="IST">India Standard Time (IST)</option><option value="UTC">UTC</option></Select></Field>
                <Field label="Date format"><Select defaultValue="dmy"><option value="dmy">DD MMM YYYY</option><option value="mdy">MMM DD, YYYY</option></Select></Field>
              </div>
              <Field label="Welcome message" hint="Shown on the desk operator dashboards.">
                <Textarea defaultValue="Welcome to the HARI UDAAN 2026 control center. Please verify awardee details carefully before check-in." rows={3} />
              </Field>
            </Section>
          )}

          {tab === "event" && (
            <Section title="Event Details" description="Information about the awards ceremony.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Event name"><Input defaultValue={EVENT.name} /></Field>
                <Field label="Subtitle"><Input defaultValue={EVENT.subtitle} /></Field>
                <Field label="Organising body"><Input defaultValue={EVENT.org} /></Field>
                <Field label="Event date"><Input defaultValue={EVENT.date} /></Field>
                <Field label="Venue"><Input defaultValue={EVENT.venue} /></Field>
                <Field label="Merit threshold"><Input defaultValue="95% and above" /></Field>
              </div>
              <Field label="About the event" hint="Displayed on certificates and reports.">
                <Textarea defaultValue="HARI UDAAN 2026 — State Merit Excellence Awards honour Intermediate toppers scoring 95% and above, celebrating academic excellence across Telangana." rows={3} />
              </Field>
            </Section>
          )}

          {tab === "branding" && (
            <Section title="Branding" description="Logos and brand colours for the portal and certificates.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <img src="/hari-udaan-logo.png" alt="Primary logo" className="mx-auto h-14 object-contain" />
                  <p className="mt-3 text-[13px] font-medium">Primary logo</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => push({ type: "info", title: "Upload disabled", description: "Asset upload needs the backend." })}>Replace</Button>
                </div>
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <img src="/hari-udaan-mark.png" alt="Mark" className="mx-auto size-14 object-contain" />
                  <p className="mt-3 text-[13px] font-medium">App icon / mark</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => push({ type: "info", title: "Upload disabled", description: "Asset upload needs the backend." })}>Replace</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { name: "Navy", v: "#0B1F4D" },
                  { name: "Gold", v: "#D4AF37" },
                  { name: "Cream", v: "#FBF7EC" },
                  { name: "Ink", v: "#0A1124" },
                ].map((c) => (
                  <div key={c.name} className="rounded-xl border border-border p-3">
                    <div className="h-12 w-full rounded-lg" style={{ background: c.v }} />
                    <p className="mt-2 text-[13px] font-semibold">{c.name}</p>
                    <p className="text-[12px] text-muted-foreground">{c.v}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === "theme" && (
            <Section title="Theme" description="Switch between light and dark appearance.">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => theme === "dark" && toggle()} className={cn("rounded-xl border-2 p-5 text-left transition", theme === "light" ? "border-gold shadow-gold" : "border-border")}>
                  <Sun className="size-5 text-amber-500" />
                  <p className="mt-3 text-sm font-semibold">Light</p>
                  <p className="text-[13px] text-muted-foreground">Bright cream surfaces</p>
                </button>
                <button onClick={() => theme === "light" && toggle()} className={cn("rounded-xl border-2 p-5 text-left transition", theme === "dark" ? "border-gold shadow-gold" : "border-border")}>
                  <Moon className="size-5 text-indigo-400" />
                  <p className="mt-3 text-sm font-semibold">Dark</p>
                  <p className="text-[13px] text-muted-foreground">Deep navy surfaces</p>
                </button>
              </div>
              <ToggleRow title="Use dark mode" desc="Toggle the portal's overall appearance." value={theme === "dark"} onChange={toggle} />
            </Section>
          )}

          {tab === "notifications" && (
            <Section title="Notifications" description="Choose what you'd like to be alerted about.">
              <div className="space-y-3">
                <ToggleRow title="Email notifications" desc="Receive a summary by email." value={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
                <ToggleRow title="New registrations" desc="Alert when an awardee checks in." value={notif.registration} onChange={(v) => setNotif({ ...notif, registration: v })} />
                <ToggleRow title="Certificates issued" desc="Alert when a certificate is handed out." value={notif.certificate} onChange={(v) => setNotif({ ...notif, certificate: v })} />
                <ToggleRow title="Duplicate alerts" desc="Flag possible duplicate awardee entries." value={notif.duplicate} onChange={(v) => setNotif({ ...notif, duplicate: v })} />
                <ToggleRow title="Daily digest" desc="A roundup at the end of the event day." value={notif.daily} onChange={(v) => setNotif({ ...notif, daily: v })} />
              </div>
            </Section>
          )}

          {tab === "security" && (
            <Section title="Security" description="Manage access and authentication settings.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Minimum password length"><Select defaultValue="8"><option value="8">8 characters</option><option value="10">10 characters</option><option value="12">12 characters</option></Select></Field>
                <Field label="Session timeout"><Select defaultValue="8h"><option value="2h">2 hours</option><option value="8h">8 hours</option><option value="24h">24 hours</option></Select></Field>
              </div>
              <ToggleRow title="Two-factor authentication" desc="Require an OTP on login for all admins." value={true} onChange={() => push({ type: "info", title: "Backend required", description: "2FA needs the authentication backend." })} />
              <ToggleRow title="Restrict to office IPs" desc="Only allow logins from approved networks." value={false} onChange={() => push({ type: "info", title: "Backend required", description: "IP restrictions need the backend." })} />
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-600">Danger zone</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Reset the portal and wipe all event data. This cannot be undone.</p>
                <Button variant="destructive" size="sm" className="mt-3" onClick={() => push({ type: "warning", title: "Action blocked", description: "Reset requires the backend." })}>Reset portal data</Button>
              </div>
            </Section>
          )}
        </Card>
      </div>
    </>
  );
}
