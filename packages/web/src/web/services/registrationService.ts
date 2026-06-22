import type { Awardee } from "../types";
import { readSharedCrmState, writeSharedCrmState } from "./sharedCrmState";

async function postAwardee(url: string, payload?: Partial<Awardee>): Promise<Awardee> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).awardee as Awardee;
}

export const registrationService = {
  async markRegistered(id: string, payload: Partial<Awardee>): Promise<Awardee> {
    try {
      const awardee = await postAwardee(`/api/registration/${encodeURIComponent(id)}/check-in`, payload);
      await syncSharedAwardee(awardee);
      return awardee;
    } catch {
      return updateSharedAwardee(id, {
        ...payload,
        studentAttended: payload.studentAttended ?? true,
        registrationStatus: payload.studentAttended === false ? "Absent" : "Registered",
        checkedInAt: new Date().toISOString(),
      });
    }
  },

  async saveDraft(id: string, payload: Partial<Awardee>): Promise<Awardee> {
    try {
      const awardee = await postAwardee(`/api/registration/${encodeURIComponent(id)}/draft`, payload);
      await syncSharedAwardee(awardee);
      return awardee;
    } catch {
      return updateSharedAwardee(id, payload);
    }
  },

  async cancel(_id: string): Promise<void> {
    throw new Error("Registration cancel is not implemented yet.");
  },
};

async function updateSharedAwardee(id: string, payload: Partial<Awardee>): Promise<Awardee> {
  const state = await readSharedCrmState();
  const index = state.awardees.findIndex((awardee) => awardee.id === id);
  if (index === -1) throw new Error("Awardee not found.");
  state.awardees[index] = { ...state.awardees[index], ...payload };
  await writeSharedCrmState(state);
  return state.awardees[index];
}

async function syncSharedAwardee(awardee: Awardee): Promise<void> {
  try {
    const state = await readSharedCrmState();
    const index = state.awardees.findIndex((item) => item.id === awardee.id);
    if (index === -1) {
      state.awardees = [awardee, ...state.awardees];
    } else {
      state.awardees[index] = awardee;
    }
    await writeSharedCrmState(state);
  } catch (error) {
    console.warn("Could not sync registration state to shared Supabase row.", error);
  }
}
