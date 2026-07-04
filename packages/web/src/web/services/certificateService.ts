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

export const certificateService = {
    async issue(id: string, payload: { issuedBy: string; remarks?: string }): Promise<Awardee> {
          return postAwardee(`/api/certificates/${encodeURIComponent(id)}/issue`, payload);
    },

    async revoke(id: string): Promise<Awardee> {
          return postAwardee(`/api/certificates/${encodeURIComponent(id)}/revoke`);
    },
};
