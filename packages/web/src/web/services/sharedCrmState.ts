import { createClient } from "@supabase/supabase-js";
import type { Awardee, PortalUser } from "../types";

interface CrmState {
  awardees: Awardee[];
  users: PortalUser[];
  credentials: Record<string, string>;
}

const stateId = "hari-udaan-2026";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const browserSupabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export function emptyCrmState(): CrmState {
  return { awardees: [], users: [], credentials: {} };
}

export async function readSharedCrmState(): Promise<CrmState> {
  if (!browserSupabase) throw new Error("Supabase browser client is not configured.");
  const { data, error } = await browserSupabase
    .from("crm_app_state")
    .select("data")
    .eq("id", stateId)
    .maybeSingle();
  if (error) throw error;
  return { ...emptyCrmState(), ...(data?.data as Partial<CrmState> | null) };
}

export async function writeSharedCrmState(state: CrmState): Promise<void> {
  if (!browserSupabase) throw new Error("Supabase browser client is not configured.");
  const { error } = await browserSupabase
    .from("crm_app_state")
    .upsert({ id: stateId, data: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}
