import { createRequire } from "node:module";

const require = createRequire(new URL("../packages/web/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const requestedUsers = [];
if (process.env.SUPABASE_ADMIN_EMAIL && process.env.SUPABASE_ADMIN_PASSWORD) {
  requestedUsers.push({
    email: process.env.SUPABASE_ADMIN_EMAIL,
    password: process.env.SUPABASE_ADMIN_PASSWORD,
    metadata: {
      name: process.env.SUPABASE_ADMIN_NAME || "Admin",
      phone: process.env.SUPABASE_ADMIN_PHONE || "",
      role: "Admin",
    },
  });
}

if (requestedUsers.length === 0) {
  console.error("Missing SUPABASE_ADMIN_EMAIL and/or SUPABASE_ADMIN_PASSWORD.");
  process.exit(1);
}

async function ensureAuthUser(user) {
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const found = existing.users.find((item) => item.email?.toLowerCase() === user.email.toLowerCase());
  if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: user.metadata,
      app_metadata: { role: user.metadata.role },
    });
    if (error) throw error;
    return { email: user.email, action: "updated" };
  }

  const { error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: user.metadata,
    app_metadata: { role: user.metadata.role },
  });
  if (error) throw error;
  return { email: user.email, action: "created" };
}

async function checkAppStateTable() {
  const { error } = await supabase.from("crm_app_state").select("id").limit(1);
  if (!error) return { ok: true };

  return {
    ok: false,
    message: error.message,
    hint: "Run supabase-schema.sql in Supabase SQL Editor, then restart the app.",
  };
}

const results = [];
for (const user of requestedUsers) {
  results.push(await ensureAuthUser(user));
}

const table = await checkAppStateTable();

console.log(JSON.stringify({ authUsers: results, table }, null, 2));
