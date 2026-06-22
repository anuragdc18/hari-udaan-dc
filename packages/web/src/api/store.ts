import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabase, supabaseAdminEnabled, supabaseEnabled } from "./supabase";
import type { AwardCategory, Awardee, PortalUser } from "../web/types";

interface CrmStore {
  awardees: Awardee[];
  users: PortalUser[];
  credentials?: Record<string, string>;
}

const storePath = path.resolve(process.cwd(), ".data", "crm-store.json");
const stateId = "hari-udaan-2026";

function emptyStore(): CrmStore {
  return { awardees: [], users: [], credentials: {} };
}

async function saveStore(store: CrmStore) {
  const nextStore = {
    ...store,
    awardees: store.awardees ?? [],
    users: store.users ?? [],
    credentials: store.credentials ?? {},
  };

  if (supabaseEnabled && supabase) {
    const { error } = await supabase
      .from("crm_app_state")
      .upsert({ id: stateId, data: nextStore, updated_at: new Date().toISOString() });
    if (error) throw error;
    return;
  }

  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(nextStore, null, 2), "utf8");
}

async function ensureStore(): Promise<CrmStore> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("crm_app_state")
      .select("data")
      .eq("id", stateId)
      .maybeSingle();

    if (error) throw error;
    if (data?.data) return { ...emptyStore(), ...(data.data as CrmStore) };

    const initial = emptyStore();
    await saveStore(initial);
    return initial;
  }

  try {
    const store = JSON.parse(await readFile(storePath, "utf8")) as CrmStore;
    return { ...emptyStore(), ...store };
  } catch {
    const initial = emptyStore();
    await saveStore(initial);
    return initial;
  }
}

export async function listAwardees() {
  return (await ensureStore()).awardees;
}

export async function getAwardee(id: string) {
  return (await ensureStore()).awardees.find((awardee) => awardee.id === id);
}

export async function createAwardee(data: Partial<Awardee>) {
  const store = await ensureStore();
  const id = data.id?.trim() || `HU-2026-${String(store.awardees.length + 1001).padStart(4, "0")}`;
  const awardee: Awardee = {
    id,
    name: data.name?.trim() || "Unnamed Awardee",
    phone: data.phone?.trim() || "",
    email: data.email?.trim() || "",
    college: data.college?.trim() || "",
    course: data.course?.trim() || "",
    percentage: Number(data.percentage) || 0,
    awardCategory: data.awardCategory || categoryFromPercentage(Number(data.percentage) || 0),
    district: data.district?.trim() || "",
    registrationStatus: data.registrationStatus || "Pending",
    certificateStatus: data.certificateStatus || "Pending",
    dataFlag: data.dataFlag || "ok",
    studentAttended: data.studentAttended ?? false,
    parentsCount: Number(data.parentsCount) || 0,
    guestsCount: Number(data.guestsCount) || 0,
    parentName: data.parentName?.trim() || "",
    parentPhone: data.parentPhone?.trim() || "",
    address: data.address?.trim() || "",
    remarks: data.remarks?.trim() || "",
    checkedInBy: data.checkedInBy,
    checkedInAt: data.checkedInAt,
    certificateIssuedBy: data.certificateIssuedBy,
    certificateIssuedAt: data.certificateIssuedAt,
    avatarSeed: data.avatarSeed || `${data.name || id}`,
    createdAt: new Date().toISOString(),
  };

  store.awardees.unshift(awardee);
  await saveStore(store);
  return awardee;
}

export async function updateAwardee(id: string, patch: Partial<Awardee>) {
  const store = await ensureStore();
  const index = store.awardees.findIndex((awardee) => awardee.id === id);
  if (index === -1) return null;
  store.awardees[index] = { ...store.awardees[index], ...patch };
  await saveStore(store);
  return store.awardees[index];
}

const categories: AwardCategory[] = ["Topper Award", "Gold Merit", "Silver Merit", "Bronze Merit", "Excellence Award"];

function categoryFromPercentage(percentage: number): AwardCategory {
  if (percentage >= 99) return "Topper Award";
  if (percentage >= 98) return "Gold Merit";
  if (percentage >= 97) return "Silver Merit";
  if (percentage >= 96) return "Bronze Merit";
  return "Excellence Award";
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readCell(row: Record<string, unknown>, names: string[]) {
  const entries = Object.entries(row);
  const normalizedNames = names.map(normalizeHeader);
  for (const name of names) {
    const found = entries.find(([key]) => key.trim().toLowerCase() === name.toLowerCase());
    if (found && found[1] !== undefined && found[1] !== null) return String(found[1]).trim();
  }
  for (const [key, value] of entries) {
    const normalizedKey = normalizeHeader(key);
    if (normalizedNames.includes(normalizedKey) && value !== undefined && value !== null) return String(value).trim();
  }
  for (const [key, value] of entries) {
    const normalizedKey = normalizeHeader(key);
    if (normalizedNames.some((name) => normalizedKey.includes(name) || name.includes(normalizedKey)) && value !== undefined && value !== null) return String(value).trim();
  }
  return "";
}

function normalizeImportRow(row: Record<string, unknown>, index: number): Awardee {
  const name = readCell(row, ["Awardee Name", "Name", "Student Name", "Candidate Name", "Full Name", "Applicant Name"]);
  const email = readCell(row, ["Email ID", "Email", "Email Address", "Mail ID", "E-mail", "Student Email"]);
  const phone = readCell(row, ["Phone Number", "Phone", "Mobile", "Mobile Number", "Contact Number", "Contact No", "Phone No", "Student Mobile", "Student Phone", "Whatsapp Number", "WhatsApp No"]);
  const id = readCell(row, ["Hall Ticket Number", "Hall Ticket No", "Hallticket Number", "Student ID", "Application ID", "Unique ID", "ID", "Roll Number", "Roll No", "Registration Number", "Reg No"]) || `HU-2026-IMP-${String(index + 1).padStart(4, "0")}`;
  const percentage = Number(readCell(row, ["Percentage", "%", "Marks Percentage", "Aggregate", "Score", "CGPA"])) || 0;
  const categoryValue = readCell(row, ["Award Category", "Category", "Award", "Award Type"]);
  const awardCategory = categories.find((category) => category.toLowerCase() === categoryValue.toLowerCase()) ?? categoryFromPercentage(percentage);
  const parentsCount = Number(readCell(row, ["Number of Parents", "Parents", "Parents Count", "Parent Count", "No of Parents", "No. of Parents", "Family Members", "Family Members Attended", "No of Family Members", "No. of Family Members"])) || 0;
  const guestsCount = Number(readCell(row, ["Number of Guests", "Guests", "Guests Count", "Guest Count", "No of Guests", "No. of Guests", "Others Count", "Other Members"])) || 0;
  const status = readCell(row, ["Status", "Registration Status", "Registered Status", "Attendance Status", "Check In Status", "Check-in Status"]).toLowerCase();
  const registrationStatus = status.includes("register") || status.includes("check") ? "Registered" : status.includes("absent") || status.includes("not") ? "Absent" : "Pending";
  const missing = !name || !email || !phone;

  return {
    id,
    name: name || "Unnamed Awardee",
    email,
    phone,
    college: readCell(row, ["College Name", "College", "Institute", "Institution", "University", "School Name", "School"]),
    course: readCell(row, ["Course / Stream", "Course", "Stream", "Branch", "Program", "Programme", "Class", "Year"]),
    percentage,
    awardCategory,
    district: readCell(row, ["District", "District Name", "City", "Town", "Mandal"]),
    registrationStatus,
    certificateStatus: readCell(row, ["Certificate Issued Status", "Certificate Status", "Certificate", "Issued Status"]).toLowerCase().includes("issued") ? "Issued" : "Pending",
    dataFlag: missing ? "Missing Data" : "ok",
    studentAttended: registrationStatus === "Registered",
    parentsCount,
    guestsCount,
    parentName: readCell(row, ["Parent Name", "Guardian Name", "Father Name", "Mother Name", "Father/Mother Name", "Parent/Guardian Name"]),
    parentPhone: readCell(row, ["Parent Phone Number", "Parent Phone", "Guardian Phone", "Parent Mobile", "Guardian Mobile", "Father Mobile", "Mother Mobile", "Parent Contact Number"]),
    address: readCell(row, ["Address", "Full Address", "Residential Address", "Permanent Address", "Communication Address", "Student Address", "Village Address", "Location"]),
    remarks: readCell(row, ["Remarks", "Notes", "Comments", "Remark"]),
    checkedInBy: readCell(row, ["Registered By", "Checked-in By", "Checked In By", "Check In By"]) || undefined,
    checkedInAt: readCell(row, ["Registration Time", "Check-in Time", "Checked In Time", "Check In Time", "Registered At"]) || undefined,
    certificateIssuedBy: readCell(row, ["Certificate Issued By", "Issued By"]) || undefined,
    certificateIssuedAt: readCell(row, ["Certificate Issued Time", "Issue Time", "Issued At"]) || undefined,
    avatarSeed: `${name || id}${index}`,
    createdAt: new Date().toISOString(),
  };
}

export async function importAwardees(rows: Array<Record<string, unknown>>) {
  const store = await ensureStore();
  const seenIds = new Set(store.awardees.map((awardee) => awardee.id.toLowerCase()));
  const seenEmails = new Set(store.awardees.map((awardee) => awardee.email.toLowerCase()).filter(Boolean));
  const seenPhones = new Set(store.awardees.map((awardee) => awardee.phone.replace(/\D/g, "")).filter(Boolean));
  const imported: Awardee[] = [];
  const duplicates: Awardee[] = [];

  rows.forEach((row, index) => {
    const awardee = normalizeImportRow(row, store.awardees.length + index);
    const phoneKey = awardee.phone.replace(/\D/g, "");
    const isDuplicate = seenIds.has(awardee.id.toLowerCase()) || (awardee.email && seenEmails.has(awardee.email.toLowerCase())) || (phoneKey && seenPhones.has(phoneKey));

    if (isDuplicate) {
      duplicates.push({ ...awardee, dataFlag: "Duplicate" });
      return;
    }

    imported.push(awardee);
    seenIds.add(awardee.id.toLowerCase());
    if (awardee.email) seenEmails.add(awardee.email.toLowerCase());
    if (phoneKey) seenPhones.add(phoneKey);
  });

  store.awardees = [...imported, ...store.awardees];
  await saveStore(store);
  return { imported, duplicates };
}

export async function listUsers() {
  return (await ensureStore()).users;
}

export async function createUser(data: Partial<PortalUser> & { password?: string }) {
  const store = await ensureStore();
  const user: PortalUser = {
    id: `U-${String(store.users.length + 1).padStart(3, "0")}`,
    name: data.name?.trim() || "New User",
    email: data.email?.trim() || "",
    phone: data.phone?.trim() || "-",
    role: data.role ?? "Registration",
    status: "Invited",
    lastActive: new Date().toISOString(),
    avatarSeed: (data.name || data.email || "NewUser").replace(/\s/g, ""),
  };

  if (supabaseAdminEnabled && supabase && user.email) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: user.name, phone: user.phone, role: user.role },
    });
    if (error && !error.message.toLowerCase().includes("already registered")) throw error;
  }

  store.users.unshift(user);
  store.credentials = data.password ? { ...(store.credentials ?? {}), [user.email.toLowerCase()]: data.password } : (store.credentials ?? {});
  await saveStore(store);
  return user;
}

export async function findUserByEmail(email: string) {
  return (await ensureStore()).users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function authenticateUser(email: string, password: string) {
  const store = await ensureStore();
  const normalizedEmail = email.toLowerCase();
  const expectedPassword = (store.credentials ?? {})[normalizedEmail];
  const user = store.users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || !expectedPassword || expectedPassword !== password) return null;
  return user;
}
