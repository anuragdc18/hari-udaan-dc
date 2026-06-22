import type { AwardCategory, Awardee } from "../types";
import { readSharedCrmState, writeSharedCrmState } from "./sharedCrmState";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export const awardeeService = {
  async list(): Promise<Awardee[]> {
    try {
      const data = await request<{ awardees: Awardee[] }>("/api/awardees");
      return data.awardees;
    } catch {
      return (await readSharedCrmState()).awardees;
    }
  },

  async getById(id: string): Promise<Awardee | undefined> {
    try {
      const data = await request<{ awardee: Awardee }>(`/api/awardees/${encodeURIComponent(id)}`);
      return data.awardee;
    } catch {
      return (await readSharedCrmState()).awardees.find((awardee) => awardee.id === id);
    }
  },

  async create(data: Partial<Awardee>): Promise<Awardee> {
    try {
      const response = await request<{ awardee: Awardee }>("/api/awardees", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.awardee;
    } catch {
      const state = await readSharedCrmState();
      const awardee = createAwardeeRecord(data, state.awardees.length);
      state.awardees = [awardee, ...state.awardees.filter((item) => item.id.toLowerCase() !== awardee.id.toLowerCase())];
      await writeSharedCrmState(state);
      return awardee;
    }
  },

  async update(id: string, data: Partial<Awardee>): Promise<Awardee> {
    try {
      const response = await request<{ awardee: Awardee }>(`/api/awardees/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response.awardee;
    } catch {
      const state = await readSharedCrmState();
      const index = state.awardees.findIndex((awardee) => awardee.id === id);
      if (index === -1) throw new Error("Awardee not found.");
      state.awardees[index] = { ...state.awardees[index], ...data };
      await writeSharedCrmState(state);
      return state.awardees[index];
    }
  },

  async importRows(rows: Array<Record<string, unknown>>): Promise<{ imported: Awardee[]; duplicates: Awardee[] }> {
    try {
      return await request<{ imported: Awardee[]; duplicates: Awardee[] }>("/api/awardees/import", {
        method: "POST",
        body: JSON.stringify({ rows }),
      });
    } catch {
      const state = await readSharedCrmState();
      const seenIds = new Set(state.awardees.map((awardee) => awardee.id.toLowerCase()));
      const seenEmails = new Set(state.awardees.map((awardee) => awardee.email.toLowerCase()).filter(Boolean));
      const seenPhones = new Set(state.awardees.map((awardee) => awardee.phone.replace(/\D/g, "")).filter(Boolean));
      const imported: Awardee[] = [];
      const duplicates: Awardee[] = [];

      rows.forEach((row, index) => {
        const awardee = normalizeImportRow(row, state.awardees.length + index);
        const phoneKey = awardee.phone.replace(/\D/g, "");
        const duplicate = seenIds.has(awardee.id.toLowerCase()) || (awardee.email && seenEmails.has(awardee.email.toLowerCase())) || (phoneKey && seenPhones.has(phoneKey));
        if (duplicate) {
          duplicates.push({ ...awardee, dataFlag: "Duplicate" });
          return;
        }
        imported.push(awardee);
        seenIds.add(awardee.id.toLowerCase());
        if (awardee.email) seenEmails.add(awardee.email.toLowerCase());
        if (phoneKey) seenPhones.add(phoneKey);
      });

      state.awardees = [...imported, ...state.awardees];
      await writeSharedCrmState(state);
      return { imported, duplicates };
    }
  },

  async remove(id: string): Promise<void> {
    const state = await readSharedCrmState();
    state.awardees = state.awardees.filter((awardee) => awardee.id !== id);
    await writeSharedCrmState(state);
  },

  async importFromFile(_file: File): Promise<void> {
    throw new Error("Excel import is not implemented yet.");
  },

  async export(): Promise<void> {
    throw new Error("Excel export is not implemented yet.");
  },
};

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

function createAwardeeRecord(data: Partial<Awardee>, index: number): Awardee {
  const percentage = Number(data.percentage) || 0;
  const id = data.id?.trim() || `HU-2026-${String(index + 1001).padStart(4, "0")}`;
  return {
    id,
    name: data.name?.trim() || "Unnamed Awardee",
    phone: data.phone?.trim() || "",
    email: data.email?.trim() || "",
    college: data.college?.trim() || "",
    course: data.course?.trim() || "",
    percentage,
    awardCategory: data.awardCategory || categoryFromPercentage(percentage),
    district: data.district?.trim() || "",
    registrationStatus: data.registrationStatus || "Pending",
    certificateStatus: data.certificateStatus || "Pending",
    dataFlag: data.dataFlag || (data.email ? "ok" : "Missing Data"),
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
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function normalizeImportRow(row: Record<string, unknown>, index: number): Awardee {
  const name = readCell(row, ["Awardee Name", "Name", "Student Name", "Candidate Name", "Full Name", "Applicant Name"]);
  const email = readCell(row, ["Email ID", "Email", "Email Address", "Mail ID", "E-mail", "Student Email"]);
  const phone = readCell(row, ["Phone Number", "Phone", "Mobile", "Mobile Number", "Contact Number", "Contact No", "Phone No", "Student Mobile", "Student Phone", "Whatsapp Number", "WhatsApp No"]);
  const id = readCell(row, ["Hall Ticket Number", "Hall Ticket No", "Hallticket Number", "Student ID", "Application ID", "Unique ID", "ID", "Roll Number", "Roll No", "Registration Number", "Reg No"]) || `HU-2026-IMP-${String(index + 1).padStart(4, "0")}`;
  const percentage = Number(readCell(row, ["Percentage", "%", "Marks Percentage", "Aggregate", "Score", "CGPA"])) || 0;
  const categoryValue = readCell(row, ["Award Category", "Category", "Award", "Award Type"]);
  const awardCategory = categories.find((category) => category.toLowerCase() === categoryValue.toLowerCase()) ?? categoryFromPercentage(percentage);
  const status = readCell(row, ["Status", "Registration Status", "Registered Status", "Attendance Status", "Check In Status", "Check-in Status"]).toLowerCase();
  const registrationStatus = status.includes("register") || status.includes("check") ? "Registered" : status.includes("absent") || status.includes("not") ? "Absent" : "Pending";

  return createAwardeeRecord({
    id,
    name,
    email,
    phone,
    college: readCell(row, ["College Name", "College", "Institute", "Institution", "University", "School Name", "School"]),
    course: readCell(row, ["Course / Stream", "Course", "Stream", "Branch", "Program", "Programme", "Class", "Year"]),
    percentage,
    awardCategory,
    district: readCell(row, ["District", "District Name", "City", "Town", "Mandal"]),
    registrationStatus,
    certificateStatus: readCell(row, ["Certificate Issued Status", "Certificate Status", "Certificate", "Issued Status"]).toLowerCase().includes("issued") ? "Issued" : "Pending",
    dataFlag: !name || !email || !phone ? "Missing Data" : "ok",
    studentAttended: registrationStatus === "Registered",
    parentsCount: Number(readCell(row, ["Number of Parents", "Parents", "Parents Count", "Parent Count", "No of Parents", "No. of Parents", "Family Members", "Family Members Attended", "No of Family Members", "No. of Family Members"])) || 0,
    guestsCount: Number(readCell(row, ["Number of Guests", "Guests", "Guests Count", "Guest Count", "No of Guests", "No. of Guests", "Others Count", "Other Members"])) || 0,
    parentName: readCell(row, ["Parent Name", "Guardian Name", "Father Name", "Mother Name", "Father/Mother Name", "Parent/Guardian Name"]),
    parentPhone: readCell(row, ["Parent Phone Number", "Parent Phone", "Guardian Phone", "Parent Mobile", "Guardian Mobile", "Father Mobile", "Mother Mobile", "Parent Contact Number"]),
    address: readCell(row, ["Address", "Full Address", "Residential Address", "Permanent Address", "Communication Address", "Student Address", "Village Address", "Location"]),
    remarks: readCell(row, ["Remarks", "Notes", "Comments", "Remark"]),
    checkedInBy: readCell(row, ["Registered By", "Checked-in By", "Checked In By", "Check In By"]) || undefined,
    checkedInAt: readCell(row, ["Registration Time", "Check-in Time", "Checked In Time", "Check In Time", "Registered At"]) || undefined,
    certificateIssuedBy: readCell(row, ["Certificate Issued By", "Issued By"]) || undefined,
    certificateIssuedAt: readCell(row, ["Certificate Issued Time", "Issue Time", "Issued At"]) || undefined,
  }, index);
}
