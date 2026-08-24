import type { Awardee } from "../types";
import { readSharedCrmState, writeSharedCrmState } from "./sharedCrmState";

async function postAwardee(url: string, payload?: Record<string, unknown>): Promise<Awardee> {
      const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload ?? {}),
      });
      if (!response.ok) throw new Error(await response.text());
      return (await response.json()).awardee as Awardee;
}

export const certificateService = {
      async issue(id: string, payload: { issuedBy: string; remarks?: string }): Promise<Awardee> {
              try {
                        return await postAwardee(`/api/certificates/${encodeURIComponent(id)}/issue`, payload);
              } catch {
                        const state = await readSharedCrmState();
                        const index = state.awardees.findIndex((awardee) => awardee.id === id);
                        if (index === -1) throw new Error("Awardee not found.");
                        if (state.awardees[index].registrationStatus !== "Registered") {
                                    throw new Error("Awardee must be registered before certificate issue.");
                        }
                        state.awardees[index] = {
                                    ...state.awardees[index],
                                    certificateStatus: "Issued",
                                    certificateIssuedBy: payload.issuedBy,
                                    certificateIssuedAt: new Date().toISOString(),
                                    remarks: payload.remarks ?? state.awardees[index].remarks,
                        };
                        await writeSharedCrmState(state);
                        return state.awardees[index];
              }
      },

      async revoke(id: string): Promise<Awardee> {
              try {
                        return await postAwardee(`/api/certificates/${encodeURIComponent(id)}/revoke`);
              } catch {
                        const state = await readSharedCrmState();
                        const index = state.awardees.findIndex((awardee) => awardee.id === id);
                        if (index === -1) throw new Error("Awardee not found.");
                        state.awardees[index] = {
                                    ...state.awardees[index],
                                    certificateStatus: "Pending",
                                    certificateIssuedBy: undefined,
                                    certificateIssuedAt: undefined,
                        };
                        await writeSharedCrmState(state);
                        return state.awardees[index];
              }
      },
};

