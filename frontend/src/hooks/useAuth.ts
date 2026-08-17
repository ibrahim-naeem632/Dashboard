/* ════════════════════════════════════════════════
   useAuth — Role-Based Access Control
   
   ROLES:
   ┌─────────────────────────────────────────────┐
   │ viewer  → sirf data dekh sakta hai          │
   │ manager → data + users manage kar sakta hai │
   │ admin   → sab kuch — settings bhi           │
   └─────────────────────────────────────────────┘
════════════════════════════════════════════════ */

export type UserRole = "admin" | "manager" | "viewer";

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  UserRole;
}

/** Read current user from localStorage */
export function useAuth(): AuthUser {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { id:"", name:"", email:"", role:"viewer" };
    return JSON.parse(raw) as AuthUser;
  } catch {
    return { id:"", name:"", email:"", role:"viewer" };
  }
}

/* ────────────────────────────────────────────────
   PERMISSION CHECKS
   Each function takes a role and returns boolean.
   Use these everywhere — never hardcode role names.
──────────────────────────────────────────────── */
export const PERMISSIONS = {
  // Can add / edit / delete Products, Orders, Customers
  canEdit:    (r: UserRole) => r === "admin" || r === "manager",

  // Can add / edit / delete Users
  canManageUsers: (r: UserRole) => r === "admin" || r === "manager",

  // Can open Settings page and change system config
  canAccessSettings: (r: UserRole) => r === "admin",

  // Can do dangerous things (reset data, etc.)
  canDangerousOps: (r: UserRole) => r === "admin",
} as const;

/** Human-readable role label */
export const ROLE_LABEL: Record<UserRole, string> = {
  admin:   "Admin",
  manager: "Manager",
  viewer:  "Viewer",
};

/** What each role can / cannot do — used in UI tooltips & guards */
export const ROLE_CAPABILITIES: Record<UserRole, { allowed: string[]; blocked: string[] }> = {
  admin: {
    allowed: ["View all data", "Add / edit / delete everything", "Manage users", "Access Settings"],
    blocked: [],
  },
  manager: {
    allowed: ["View all data", "Add / edit / delete Products, Orders, Customers", "Manage users"],
    blocked: ["Settings (Admin only)"],
  },
  viewer: {
    allowed: ["View all data"],
    blocked: ["Add / edit / delete anything", "Manage users", "Settings"],
  },
};
