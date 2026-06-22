import type { AwardCategory } from "../types";

export const EVENT = {
  name: "HARI UDAAN 2026",
  subtitle: "State Merit Excellence Awards",
  org: "HARI University, Kanha Shanti Vanam, Hyderabad",
  date: "21 June 2026",
  venue: "Kanha Shanti Vanam, Hyderabad",
};

export const DISTRICTS = [
  "Hyderabad",
  "Rangareddy",
  "Medchal–Malkajgiri",
  "Warangal",
  "Karimnagar",
  "Nizamabad",
  "Khammam",
  "Nalgonda",
  "Mahbubnagar",
  "Adilabad",
  "Siddipet",
  "Sangareddy",
  "Suryapet",
  "Nagarkurnool",
];

export const COLLEGES = [
  "Sri Chaitanya Jr College",
  "Narayana Jr College",
  "NRI Junior College",
  "Vignan Junior College",
  "St. Mary's Jr College",
  "Gowtham Junior College",
  "Resonance Jr College",
  "Sri Gayatri Jr College",
  "Bhashyam Junior College",
  "Triveni Junior College",
  "Loyola Academy Jr College",
  "FIITJEE Jr College",
];

export const COURSES = ["MPC", "BiPC", "MEC", "CEC", "HEC", "MPC (IIT)", "BiPC (NEET)"];

export const AWARD_CATEGORIES: AwardCategory[] = [
  "Topper Award",
  "Gold Merit",
  "Silver Merit",
  "Bronze Merit",
  "Excellence Award",
];

export const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Sai", "Ananya", "Diya", "Sneha", "Harini",
  "Rohan", "Karthik", "Meghana", "Pranav", "Nikhil", "Bhavya", "Tejaswi",
  "Akshara", "Charan", "Manogna", "Srinidhi", "Yashwanth", "Keerthana",
  "Rishika", "Varun", "Lakshmi", "Praneeth", "Anvitha", "Mokshith", "Saanvi",
  "Vamshi", "Navya", "Ishaan", "Tanvi", "Abhiram", "Dhruva", "Sahasra",
  "Goutham", "Aishwarya", "Pavan", "Ritvik", "Shreya",
];

export const LAST_NAMES = [
  "Reddy", "Rao", "Sharma", "Kumar", "Goud", "Naidu", "Varma", "Chowdary",
  "Sastry", "Yadav", "Patel", "Bhupal", "Mehta", "Raju", "Acharya",
  "Krishna", "Prasad", "Venkat", "Madhav", "Setty",
];

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  { key: "awardees", label: "Awardees", icon: "GraduationCap", path: "/awardees" },
  { key: "registration", label: "Registration Desk", icon: "ClipboardCheck", path: "/registration" },
  { key: "certificate", label: "Certificate Desk", icon: "Award", path: "/certificate" },
  { key: "reports", label: "Reports", icon: "FileBarChart", path: "/reports" },
  { key: "users", label: "Users", icon: "Users", path: "/users" },
  { key: "settings", label: "Settings", icon: "Settings", path: "/settings" },
  { key: "profile", label: "Profile", icon: "UserCircle", path: "/profile" },
] as const;
