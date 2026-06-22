import { Hono } from 'hono';
import { cors } from "hono/cors"
import {
  authenticateUser,
  createAwardee,
  createUser,
  getAwardee,
  importAwardees,
  listAwardees,
  listUsers,
  updateAwardee,
} from "./store";
import { supabaseAuth, supabaseAuthEnabled } from "./supabase";
import type { PortalUser, UserRole } from "../web/types";

function roleFromMetadata(value: unknown): UserRole {
  return value === "Registration" || value === "Certificate" || value === "Admin" ? value : "Admin";
}

function portalUserFromSupabase(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }, fallbackEmail: string): PortalUser {
  const metadata = user.user_metadata ?? {};
  const role = roleFromMetadata(user.app_metadata?.role ?? metadata.role);
  const email = user.email || fallbackEmail;

  return {
    id: user.id,
    name: String(metadata.name || email.split("@")[0] || "Admin"),
    email,
    phone: String(metadata.phone || ""),
    role,
    status: "Active",
    lastActive: new Date().toISOString(),
    avatarSeed: String(metadata.name || email),
  };
}

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .get('/env-check', (c) => c.json({
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }, 200))
  .post('/auth/login', async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({}));
    const email = body.email?.trim() || "";
    const password = body.password || "";

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (supabaseAuthEnabled && supabaseAuth) {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
      const localUser = await authenticateUser(email, password).catch(() => null);
      if (localUser) return c.json({ user: localUser }, 200);
      if (!error && data.user) return c.json({ user: portalUserFromSupabase(data.user, email) }, 200);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const user = await authenticateUser(email, password);
    if (!user) return c.json({ error: 'Invalid email or password' }, 401);
    return c.json({ user }, 200);
  })
  .get('/auth/demo-users', async (c) => c.json({
    users: (await listUsers()).filter((user) => user.id.startsWith('DEMO-')),
  }, 200))
  .get('/awardees', async (c) => c.json({ awardees: await listAwardees() }, 200))
  .get('/awardees/:id', async (c) => {
    const awardee = await getAwardee(c.req.param('id'));
    if (!awardee) return c.json({ error: 'Awardee not found' }, 404);
    return c.json({ awardee }, 200);
  })
  .post('/awardees', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    if (!body.name || !body.phone) return c.json({ error: 'Name and phone are required' }, 400);
    return c.json({ awardee: await createAwardee(body) }, 201);
  })
  .patch('/awardees/:id', async (c) => {
    const patch = await c.req.json().catch(() => ({}));
    const awardee = await updateAwardee(c.req.param('id'), patch);
    if (!awardee) return c.json({ error: 'Awardee not found' }, 404);
    return c.json({ awardee }, 200);
  })
  .post('/awardees/import', async (c) => {
    const body = await c.req.json<{ rows?: Array<Record<string, unknown>> }>().catch(() => ({}));
    if (!Array.isArray(body.rows)) return c.json({ error: 'Rows are required' }, 400);
    return c.json(await importAwardees(body.rows), 200);
  })
  .post('/registration/:id/check-in', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const awardee = await updateAwardee(c.req.param('id'), {
      ...body,
      studentAttended: body.studentAttended ?? true,
      registrationStatus: body.studentAttended === false ? 'Absent' : 'Registered',
      checkedInBy: body.checkedInBy || 'Admin',
      checkedInAt: new Date().toISOString(),
    });
    if (!awardee) return c.json({ error: 'Awardee not found' }, 404);
    return c.json({ awardee }, 200);
  })
  .post('/registration/:id/draft', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const awardee = await updateAwardee(c.req.param('id'), body);
    if (!awardee) return c.json({ error: 'Awardee not found' }, 404);
    return c.json({ awardee }, 200);
  })
  .post('/certificates/:id/issue', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const current = await getAwardee(c.req.param('id'));
    if (!current) return c.json({ error: 'Awardee not found' }, 404);
    if (current.registrationStatus !== 'Registered') {
      return c.json({ error: 'Awardee must be registered before certificate issue' }, 409);
    }
    const awardee = await updateAwardee(current.id, {
      certificateStatus: 'Issued',
      certificateIssuedBy: body.issuedBy || 'Admin',
      certificateIssuedAt: new Date().toISOString(),
      remarks: body.remarks ?? current.remarks,
    });
    return c.json({ awardee }, 200);
  })
  .post('/certificates/:id/revoke', async (c) => {
    const awardee = await updateAwardee(c.req.param('id'), {
      certificateStatus: 'Pending',
      certificateIssuedBy: undefined,
      certificateIssuedAt: undefined,
    });
    if (!awardee) return c.json({ error: 'Awardee not found' }, 404);
    return c.json({ awardee }, 200);
  })
  .get('/users', async (c) => c.json({ users: await listUsers() }, 200))
  .post('/users', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    if (!body.name || !body.email) return c.json({ error: 'Name and email are required' }, 400);
    if (!body.password) return c.json({ error: 'Temporary password is required' }, 400);
    return c.json({ user: await createUser(body) }, 201);
  });

export type AppType = typeof app;
export default app;
