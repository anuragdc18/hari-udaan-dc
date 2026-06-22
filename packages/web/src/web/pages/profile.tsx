import * as React from "react";
import { Mail, Phone, MapPin, Calendar, KeyRound, Save, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RoleBadge, StatusPill } from "@/components/badges";
import { ActivityFeed } from "@/components/feeds";
import { useToast } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import type { ActivityItem } from "@/types";

const activity: ActivityItem[] = [];

export default function Profile() {
  const { push } = useToast();
  const u = getCurrentUser();
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });

  const feed = activity;

  function savePassword() {
    if (!pw.current || !pw.next) {
      push({ type: "warning", title: "Missing fields", description: "Enter your current and new password." });
      return;
    }
    if (pw.next !== pw.confirm) {
      push({ type: "error", title: "Passwords don't match", description: "Re-enter your new password." });
      return;
    }
    push({ type: "info", title: "Backend required", description: "Password changes will work once auth is connected." });
    setPw({ current: "", next: "", confirm: "" });
  }

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and manage your account" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Card className="overflow-hidden">
            <div className="bg-navy-rich h-24" />
            <CardContent className="-mt-12 text-center">
              <Avatar name={u.name} seed={u.avatarSeed} size={88} className="mx-auto ring-4 ring-card" />
              <h2 className="mt-3 font-display text-xl font-bold">{u.name}</h2>
              <p className="text-sm text-muted-foreground">{u.email}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <RoleBadge role={u.role} />
                <StatusPill status={u.status} />
              </div>
            </CardContent>
            <div className="space-y-3 border-t border-border p-5 text-sm">
              <p className="flex items-center gap-2.5"><Mail className="size-4 text-muted-foreground" />{u.email}</p>
              <p className="flex items-center gap-2.5"><Phone className="size-4 text-muted-foreground" />{u.phone}</p>
              <p className="flex items-center gap-2.5"><MapPin className="size-4 text-muted-foreground" />Kanha Shanti Vanam, Hyderabad</p>
              <p className="flex items-center gap-2.5"><Calendar className="size-4 text-muted-foreground" />Last active {fmtDate(u.lastActive)}</p>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4 text-gold" />Change password</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="pw-cur">Current password</Label>
                <Input id="pw-cur" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="pw-new">New password</Label>
                <Input id="pw-new" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="pw-conf">Confirm new password</Label>
                <Input id="pw-conf" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="••••••••" />
              </div>
              <Button variant="gold" className="w-full" onClick={savePassword}><Save className="size-4" />Update password</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><Label>Full name</Label><Input defaultValue={u.name} /></div>
                <div><Label>Email</Label><Input defaultValue={u.email} /></div>
                <div><Label>Phone</Label><Input defaultValue={u.phone} /></div>
                <div><Label>Role</Label><Input defaultValue={u.role} disabled /></div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="gold" onClick={() => push({ type: "success", title: "Profile saved", description: "Updates persist once the backend is connected." })}><Save className="size-4" />Save changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-gold" />Recent activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityFeed items={feed} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
