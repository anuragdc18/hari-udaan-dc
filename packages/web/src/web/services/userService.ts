import type { PortalUser } from "../types";
import { browserSupabase, readSharedCrmState, writeSharedCrmState } from "./sharedCrmState";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export const userService = {
  async list(): Promise<PortalUser[]> {
    try {
      const data = await request<{ users: PortalUser[] }>("/api/users");
      return data.users;
    } catch {
      return (await readSharedCrmState()).users;
    }
  },

  async create(data: Partial<PortalUser> & { password?: string }): Promise<PortalUser> {
    try {
      const response = await request<{ user: PortalUser }>("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.user;
    } catch (error) {
      if (!browserSupabase || !data.email || !data.password) throw error;

      const { error: signUpError } = await browserSupabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || data.email.split("@")[0],
            phone: data.phone || "",
            role: data.role || "Registration",
          },
        },
      });

      if (signUpError && !signUpError.message.toLowerCase().includes("already registered")) {
        console.warn(`Supabase Auth signup skipped for ${data.email}: ${signUpError.message}`);
      }

      const user = {
        id: `AUTH-${Date.now()}`,
        name: data.name || data.email.split("@")[0],
        email: data.email,
        phone: data.phone || "",
        role: data.role || "Registration",
        status: "Invited",
        lastActive: new Date().toISOString(),
        avatarSeed: data.name || data.email,
      } as PortalUser;
      const state = await readSharedCrmState();
      state.users = [user, ...state.users.filter((item) => item.email.toLowerCase() !== user.email.toLowerCase())];
      state.credentials = { ...(state.credentials ?? {}), [user.email.toLowerCase()]: data.password };
      await writeSharedCrmState(state);
      return user;
    }
  },

  async update(_id: string, _data: Partial<PortalUser>): Promise<void> {
    const state = await readSharedCrmState();
    const index = state.users.findIndex((user) => user.id === _id || user.email.toLowerCase() === _data.email?.toLowerCase());
    if (index === -1) throw new Error("User not found.");
    const previousEmail = state.users[index].email.toLowerCase();
    state.users[index] = { ...state.users[index], ..._data, lastActive: new Date().toISOString() };
    const nextEmail = state.users[index].email.toLowerCase();
    if (state.credentials?.[previousEmail] && previousEmail !== nextEmail) {
      state.credentials[nextEmail] = state.credentials[previousEmail];
      delete state.credentials[previousEmail];
    }
    await writeSharedCrmState(state);
  },

  async remove(_id: string): Promise<void> {
    const state = await readSharedCrmState();
    const user = state.users.find((item) => item.id === _id);
    state.users = state.users.filter((item) => item.id !== _id);
    if (user?.email && state.credentials) delete state.credentials[user.email.toLowerCase()];
    await writeSharedCrmState(state);
  },
};
