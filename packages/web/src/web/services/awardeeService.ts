import type { Awardee } from "../types";
import { ApiError } from "./httpError";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
          headers: { "Content-Type": "application/json", ...init?.headers },
          ...init,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
          throw new ApiError(body?.error || "Request failed", response.status, body?.awardee);
    }
    return body as T;
}

export const awardeeService = {
    async list(): Promise<Awardee[]> {
          const data = await request<{ awardees: Awardee[] }>("/api/awardees");
          return data.awardees;
    },

    async getById(id: string): Promise<Awardee | undefined> {
          try {
                  const data = await request<{ awardee: Awardee }>(`/api/awardees/${encodeURIComponent(id)}`);
                  return data.awardee;
          } catch {
                  return undefined;
          }
    },

    async create(data: Partial<Awardee>): Promise<Awardee> {
          const response = await request<{ awardee: Awardee }>("/api/awardees", {
                  method: "POST",
                  body: JSON.stringify(data),
          });
          return response.awardee;
    },

    async update(id: string, data: Partial<Awardee>): Promise<Awardee> {
          const response = await request<{ awardee: Awardee }>(`/api/awardees/${encodeURIComponent(id)}`, {
                  method: "PATCH",
                  body: JSON.stringify(data),
          });
          return response.awardee;
    },

    async importRows(rows: Array<Record<string, unknown>>): Promise<{ imported: Awardee[]; duplicates: Awardee[] }> {
          return request<{ imported: Awardee[]; duplicates: Awardee[] }>("/api/awardees/import", {
                  method: "POST",
                  body: JSON.stringify({ rows }),
          });
    },

    async remove(id: string): Promise<void> {
          await request<{ ok: boolean }>(`/api/awardees/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    async importFromFile(_file: File): Promise<void> {
          throw new Error("Excel import is not implemented yet.");
    },

    async export(): Promise<void> {
          throw new Error("Excel export is not implemented yet.");
    },
};
