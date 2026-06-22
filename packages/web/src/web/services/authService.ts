import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "../lib/session";
import type { PortalUser, UserRole } from "../types";
import { readSharedCrmState } from "./sharedCrmState";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const browserSupabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function roleFromMetadata(value: unknown): UserRole {
  return value === "Registration" || value === "Certificate" || value === "Admin" ? value : "Admin";
}

function userFromSupabase(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }, fallbackEmail: string): PortalUser {
  const metadata = user.user_metadata ?? {};
  const email = user.email || fallbackEmail;
  const role = roleFromMetadata(user.app_metadata?.role ?? metadata.role);

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

export const authService = {
  async login(email: string, password: string): Promise<PortalUser> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) return (await response.json()).user as PortalUser;
    } catch {
      // Fall through to browser Supabase auth when the deployed API route is unavailable.
    }

    if (!browserSupabase) throw new Error("Supabase browser auth is not configured.");

    const { data, error } = await browserSupabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      const state = await readSharedCrmState();
      const normalizedEmail = email.toLowerCase();
      const user = state.users.find((item) => item.email.toLowerCase() === normalizedEmail);
      if (user && state.credentials?.[normalizedEmail] === password) {
        return { ...user, status: "Active", lastActive: new Date().toISOString() };
      }
      throw new Error(error?.message || "Invalid email or password.");
    }
    return userFromSupabase(data.user, email);
  },

  async logout(): Promise<void> {
    localStorage.removeItem("crm.currentUser");
  },

  current(): PortalUser {
    return getCurrentUser();
  },
};
