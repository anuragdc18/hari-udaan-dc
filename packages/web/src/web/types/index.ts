// ============================================================
// HARI UDAAN 2026 CRM — Domain Types
// Frontend-only. These interfaces mirror the future backend
// schema so services can be wired with minimal UI changes.
// ============================================================

export type RegistrationStatus = "Registered" | "Pending" | "Absent";
export type CertificateStatus = "Issued" | "Pending";
export type DataFlag = "ok" | "Duplicate" | "Missing Data";

export type AwardCategory =
  | "Topper Award"
  | "Gold Merit"
  | "Silver Merit"
  | "Bronze Merit"
  | "Excellence Award";

export interface Awardee {
  id: string; // unique HU-2026-#### id
  name: string;
  phone: string;
  email: string;
  college: string;
  course: string;
  percentage: number;
  awardCategory: AwardCategory;
  district: string;
  registrationStatus: RegistrationStatus;
  certificateStatus: CertificateStatus;
  dataFlag: DataFlag;
  // registration desk
  studentAttended: boolean;
  parentsCount: number;
  guestsCount: number;
  parentName: string;
  parentPhone: string;
  address: string;
  remarks: string;
  checkedInBy?: string;
  checkedInAt?: string; // ISO
  // certificate desk
  certificateIssuedBy?: string;
  certificateIssuedAt?: string; // ISO
  avatarSeed: string;
  createdAt: string;
}

export type UserRole = "Admin" | "Registration" | "Certificate";

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string; // ISO
  avatarSeed: string;
}

export interface ActivityItem {
  id: string;
  type: "registration" | "certificate" | "system" | "user" | "alert";
  title: string;
  description: string;
  actor: string;
  timestamp: string; // ISO
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
}

export interface StatTrend {
  value: number;
  direction: "up" | "down";
}

export interface DashboardStat {
  key: string;
  label: string;
  value: number;
  icon: string;
  accent: "navy" | "gold" | "green" | "amber" | "blue" | "teal" | "red";
  trend?: StatTrend;
  suffix?: string;
}
