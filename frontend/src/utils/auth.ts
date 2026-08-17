export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  company?: string;
  createdAt: string;
}

const STORAGE_KEY = "ronin_users";

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function initDefaultAdmin() {
  const users = getUsers();

  const exists = users.find(u => u.email === "admin@ronin.com");

  if (!exists) {
    users.push({
      id: "admin-001",
      name: "Admin",
      email: "admin@ronin.com",
      password: "admin1234",
      role: "admin",
      company: "Ronin HQ",
      createdAt: new Date().toISOString(),
    });

    saveUsers(users);
  }
}

export function loginUser(email: string, password: string) {
  const users = getUsers();

  return users.find(
    u => u.email === email && u.password === password
  );
}