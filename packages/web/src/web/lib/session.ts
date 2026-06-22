import type { PortalUser } from "../types";

export function getStoredUser(): PortalUser | null {
  try {
    const raw = localStorage.getItem("crm.currentUser");
    return raw ? (JSON.parse(raw) as PortalUser) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): PortalUser {
  return getStoredUser() ?? {
    id: "SIGNED-OUT",
    name: "Signed Out",
    email: "",
    phone: "",
    role: "Admin",
    status: "Active",
    lastActive: new Date().toISOString(),
    avatarSeed: "SignedOut",
  };
}

export function homeForRole(role: PortalUser["role"]) {
  if (role === "Registration") return "/registration";
  if (role === "Certificate") return "/certificate";
  return "/dashboard";
}

export function canAccessPath(role: PortalUser["role"], path: string) {
  if (role === "Admin") return true;
  if (path === "/profile" || path === "/login") return true;
  if (path.startsWith("/awardees")) return true;
  if (role === "Registration") return path === "/registration";
  if (role === "Certificate") return path === "/certificate";
  return false;
}
