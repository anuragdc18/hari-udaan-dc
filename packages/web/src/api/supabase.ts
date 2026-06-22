import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(supabaseUrl && (serviceKey || anonKey));
export const supabaseAuthEnabled = Boolean(supabaseUrl && anonKey);

export const supabase = supabaseEnabled
  ? createClient(supabaseUrl!, serviceKey || anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const supabaseAuth = supabaseAuthEnabled
  ? createClient(supabaseUrl!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const supabaseAdminEnabled = Boolean(supabaseUrl && serviceKey);
