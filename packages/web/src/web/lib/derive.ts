import { AWARD_CATEGORIES, DISTRICTS } from "./constants";
import type { Awardee, DashboardStat } from "../types";

export function computeStats(awardees: Awardee[]): DashboardStat[] {
  const total = awardees.length;
  const registered = awardees.filter((a) => a.registrationStatus === "Registered").length;
  const absent = awardees.filter((a) => a.registrationStatus === "Absent").length;
  const issued = awardees.filter((a) => a.certificateStatus === "Issued").length;
  const pendingCert = registered - issued;
  const parents = awardees.reduce((s, a) => s + a.parentsCount, 0);
  const guests = awardees.reduce((s, a) => s + a.guestsCount, 0);
  const totalPeople = registered + parents + guests;
  const duplicates = awardees.filter((a) => a.dataFlag === "Duplicate").length;
  const missing = awardees.filter((a) => a.dataFlag === "Missing Data").length;

  return [
    { key: "total", label: "Total Awardees", value: total, icon: "GraduationCap", accent: "navy", trend: { value: 8, direction: "up" } },
    { key: "registered", label: "Total Registered", value: registered, icon: "ClipboardCheck", accent: "green", trend: { value: 12, direction: "up" } },
    { key: "issued", label: "Certificates Issued", value: issued, icon: "Award", accent: "gold", trend: { value: 9, direction: "up" } },
    { key: "pendingCert", label: "Pending Certificates", value: Math.max(pendingCert, 0), icon: "Clock", accent: "amber", trend: { value: 4, direction: "down" } },
    { key: "absent", label: "Not Attended", value: absent, icon: "UserX", accent: "red" },
    { key: "parents", label: "Parents Entered", value: parents, icon: "Users", accent: "blue" },
    { key: "guests", label: "Guests Entered", value: guests, icon: "UserPlus", accent: "teal" },
    { key: "people", label: "Total People", value: totalPeople, icon: "Building2", accent: "navy", trend: { value: 15, direction: "up" } },
    { key: "duplicates", label: "Duplicate Alerts", value: duplicates, icon: "Copy", accent: "red" },
    { key: "missing", label: "Missing Data", value: missing, icon: "AlertTriangle", accent: "amber" },
  ];
}

export function registrationProgress(awardees: Awardee[]) {
  const slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  let cum = 0;
  const reg = awardees.filter((a) => a.registrationStatus === "Registered").length;
  const per = Math.round(reg / slots.length);
  return slots.map((t, i) => {
    cum += i === slots.length - 1 ? reg - per * (slots.length - 1) : per;
    return { time: t, registered: cum, target: Math.round((reg * (i + 1)) / slots.length + 6) };
  });
}

export function certificateProgress(awardees: Awardee[]) {
  const issued = awardees.filter((a) => a.certificateStatus === "Issued").length;
  const pending = awardees.filter((a) => a.registrationStatus === "Registered").length - issued;
  return [
    { name: "Issued", value: issued, fill: "#d4af37" },
    { name: "Pending", value: Math.max(pending, 0), fill: "#e4e9f2" },
  ];
}

export function categoryDistribution(awardees: Awardee[]) {
  return AWARD_CATEGORIES.map((c) => ({
    category: c.replace(" Award", "").replace(" Merit", ""),
    count: awardees.filter((a) => a.awardCategory === c).length,
  }));
}

export function districtDistribution(awardees: Awardee[]) {
  return DISTRICTS.map((d) => ({
    district: d.length > 10 ? `${d.slice(0, 9)}...` : d,
    full: d,
    count: awardees.filter((a) => a.district === d).length,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function recentRegistrations(awardees: Awardee[], n = 6) {
  return awardees.filter((a) => a.checkedInAt)
    .sort((a, b) => (b.checkedInAt! > a.checkedInAt! ? 1 : -1))
    .slice(0, n);
}

export function recentCertificates(awardees: Awardee[], n = 6) {
  return awardees.filter((a) => a.certificateIssuedAt)
    .sort((a, b) => (b.certificateIssuedAt! > a.certificateIssuedAt! ? 1 : -1))
    .slice(0, n);
}
