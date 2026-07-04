import type { Awardee } from "../types";
import { ApiError } from "./httpError";

async function postAwardee(url: string, payload?: Record<string, unknown>): Promise<Awardee> {
    const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload ?? {}),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
          throw new ApiError(body?.error || "Request failed", response.status, body?.awardee);
    }
    return body.awardee as Awardee;
}

export const registrationService = {
    async markRegistered(id: string, payload: Partial<Awardee>): Promise<Awardee> {
          return postAwardee(`/api/registration/${encodeURIComponent(id)}/check-in`, payload);
    },

    async saveDraft(id: string, payload: Partial<Awardee>): Promise<Awardee> {
          return postAwardee(`/api/registration/${encodeURIComponent(id)}/draft`, payload);
    },

    async cancel(_id: string): Promise<void> {
          throw new Error("Registration cancel is not implemented yet.");
    },
};
