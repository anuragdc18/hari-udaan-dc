import type { Awardee } from "../types";

export class ApiError extends Error {
    status: number;
    awardee?: Awardee;

  constructor(message: string, status: number, awardee?: Awardee) {
        super(message);
        this.status = status;
        this.awardee = awardee;
  }
}
