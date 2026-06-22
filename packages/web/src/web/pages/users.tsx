import * as React from "react";
import { Search, UserPlus, MoreVertical, Mail, Phone } from "lucide-react";
import { PageHeader, EmptyState, StatCard } from "@/components/shared";
import { Card, Input, Label, Select, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/data-table";
import { RoleBadge, StatusPill } from "@/components/badges";
import { useToast } from "@/components/ui/toast";
import { userService } from "@/services/userService";
import { timeAgo } from "@/lib/format";
import type { PortalUser, DashboardStat } from "@/types";

export default function Users() {
  const { push } = useToast();
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("");
  const [users, setUsers] = React.useState<PortalUser[]>([]);
  const [open, setOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<PortalUser | null>(null);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", role: "Registration", password: "" });
  const [editForm, setEditForm] = React.useState({ name: "", email: "", phone: "", role: "Registration", status: "Active" });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    userService.list()
      .then(setUsers)
      .catch(() => push({ type: "warning", title: "Users unavailable", description: "Could not load users from the API." }));
  }, [push]);

  const filtered = React.useMemo(() => {
    const ql = q.toLowerCase().trim();
    return users.filter((u) => {
      if (ql && !(u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql) || u.phone.includes(ql))) return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }, [users, q, role]);

  const counts = React.useMemo(() => ({
    admin: users.filter((u) => u.role === "Admin").length,
    registration: users.filter((u) => u.role === "Registration").length,
    certificate: users.filter((u) => u.role === "Certificate").length,
  }), [users]);

  async function addUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      push({ type: "warning", title: "Missing details", description: "Name, email and temporary password are required." });
      return;
    }

    setBusy(true);
    try {
      const u = await userService.create({ ...form, role: form.role as PortalUser["role"] });
      setUsers((p) => [u, ...p.filter((user) => user.id !== u.id)]);
      setOpen(false);
      setForm({ name: "", email: "", phone: "", role: "Registration", password: "" });
      push({ type: "success", title: "Login created", description: `${u.name} added as ${u.role} user.` });
    } catch (error) {
      push({ type: "warning", title: "Could not create login", description: error instanceof Error ? error.message : "Check Supabase settings or try again." });
    } finally {
      setBusy(false);
    }
  }

  function openManageUser(user: PortalUser) {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status });
    setManageOpen(true);
  }

  async function updateUser() {
    if (!selectedUser) return;
    setBusy(true);
    try {
      await userService.update(selectedUser.id, { ...editForm, role: editForm.role as PortalUser["role"], status: editForm.status as PortalUser["status"] });
      const updated = { ...selectedUser, ...editForm, role: editForm.role as PortalUser["role"], status: editForm.status as PortalUser["status"], lastActive: new Date().toISOString() };
      setUsers((items) => items.map((user) => user.id === selectedUser.id ? updated : user));
      setManageOpen(false);
      push({ type: "success", title: "User updated", description: `${updated.name} was updated.` });
    } catch (error) {
      push({ type: "error", title: "Update failed", description: error instanceof Error ? error.message : "Could not update user." });
    } finally {
      setBusy(false);
    }
  }

  async function removeUser() {
    if (!selectedUser) return;
    setBusy(true);
    try {
      await userService.remove(selectedUser.id);
      setUsers((items) => items.filter((user) => user.id !== selectedUser.id));
      setManageOpen(false);
      push({ type: "success", title: "User removed", description: `${selectedUser.name} was removed from CRM users.` });
    } catch (error) {
      push({ type: "error", title: "Remove failed", description: error instanceof Error ? error.message : "Could not remove user." });
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<PortalUser>[] = [
    {
      key: "name", header: "User", sortable: true, sortValue: (u) => u.name,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} seed={u.avatarSeed} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{u.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">{u.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact", header: "Contact", className: "hidden lg:table-cell",
      render: (u) => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-[13px]"><Mail className="size-3.5 text-muted-foreground" />{u.email}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Phone className="size-3.5" />{u.phone}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", sortable: true, sortValue: (u) => u.role, render: (u) => <RoleBadge role={u.role} /> },
    { key: "status", header: "Status", render: (u) => <StatusPill status={u.status} /> },
    { key: "lastActive", header: "Last active", className: "hidden sm:table-cell", sortable: true, sortValue: (u) => u.lastActive, render: (u) => <span className="text-[13px] text-muted-foreground">{timeAgo(u.lastActive)}</span> },
    {
      key: "actions", header: "", className: "w-10",
      render: (u) => (
        <button onClick={(e) => { e.stopPropagation(); openManageUser(u); }} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><MoreVertical className="size-4" /></button>
      ),
    },
  ];

  const stats: DashboardStat[] = [
    { key: "admin", label: "Administrators", value: counts.admin, icon: "ShieldCheck", accent: "navy" },
    { key: "reg", label: "Registration Desk", value: counts.registration, icon: "ClipboardCheck", accent: "green" },
    { key: "cert", label: "Certificate Desk", value: counts.certificate, icon: "Award", accent: "gold" },
  ];

  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle={`${users.length} portal users - access controlled by role`}
        actions={<Button variant="gold" onClick={() => setOpen(true)}><UserPlus className="size-4" />Add login</Button>}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => <StatCard key={s.key} stat={s} index={i} />)}
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, phone..." className="pl-10" />
          </div>
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-48">
            <option value="">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Registration">Registration</option>
            <option value="Certificate">Certificate</option>
          </Select>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={10}
          emptyState={<EmptyState icon="Users" title="No users found" description="Try a different search or role filter." />}
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add portal login"
        description="Create a Supabase login for a desk operator or administrator."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={addUser} disabled={busy}>{busy ? "Creating..." : "Create login"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="u-name">Full name</Label>
            <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@hariudaan.org" />
            </div>
            <div>
              <Label htmlFor="u-phone">Phone</Label>
              <Input id="u-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." />
            </div>
          </div>
          <div>
            <Label htmlFor="u-password">Temporary password</Label>
            <Input id="u-password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a temporary password" />
          </div>
          <div>
            <Label htmlFor="u-role">Role</Label>
            <Select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="Registration">Registration Desk</option>
              <option value="Certificate">Certificate Desk</option>
              <option value="Admin">Administrator</option>
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title="Manage user"
        description="Edit role, status and contact details."
        footer={
          <>
            <Button variant="ghost" onClick={() => setManageOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={removeUser} disabled={busy} className="text-red-600">Remove</Button>
            <Button variant="gold" onClick={updateUser} disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label>Role</Label><Select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              <option value="Registration">Registration Desk</option>
              <option value="Certificate">Certificate Desk</option>
              <option value="Admin">Administrator</option>
            </Select></div>
            <div><Label>Status</Label><Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Suspended">Suspended</option>
            </Select></div>
          </div>
        </div>
      </Modal>
    </>
  );
}
