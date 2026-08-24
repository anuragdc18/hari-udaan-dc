import type { Awardee } from "@/types";

export function digitsOnly(value: string | number | undefined | null) {
  return String(value ?? "").replace(/\D/g, "");
}

export function awardeeMatchesQuery(awardee: Awardee, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const qDigits = digitsOnly(q);
  const text = [
    awardee.name,
    awardee.id,
    awardee.email,
    awardee.college,
    awardee.course,
    awardee.district,
    awardee.parentName,
  ].join(" ").toLowerCase();

  if (text.includes(q)) return true;
  if (!qDigits) return false;

  return [awardee.phone, awardee.parentPhone].some((phone) => digitsOnly(phone).includes(qDigits));
}
