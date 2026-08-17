/* ═══════════════════════════════════════════════
   API Service
   - Backend running → real API calls
   - Backend offline / no token → local fallback
═══════════════════════════════════════════════ */

const BASE = "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as T;
}

/* ── AUTH ── */
export const authApi = {
  login: (email: string, password: string) =>
    req<{ token: string; user: { id:string; name:string; email:string; role:string } }>(
      "POST", "/auth/login", { email, password }
    ),
};

/* ── PRODUCTS ── */
export const productsApi = {
  getAll: () => req<any[]>("GET", "/products"),
  create: (d: { name:string; price:number; stock:number; category:string }) => req<any>("POST", "/products", d),
  update: (id: string, d: { name:string; price:number; stock:number; category:string }) => req<any>("PUT", `/products/${id}`, d),
  delete: (id: string) => req<any>("DELETE", `/products/${id}`),
};

/* ── ORDERS ── */
export const ordersApi = {
  getAll: () => req<any[]>("GET", "/orders"),
  create: (d: { customer:string; amount:number; status:string }) => req<any>("POST", "/orders", d),
  update: (id: string, d: { customer:string; amount:number; status:string }) => req<any>("PUT", `/orders/${id}`, d),
  delete: (id: string) => req<any>("DELETE", `/orders/${id}`),
};

/* ── CUSTOMERS ── */
export const customersApi = {
  getAll: () => req<any[]>("GET", "/customers"),
  create: (d: { name:string; email:string; phone:string }) => req<any>("POST", "/customers", d),
  update: (id: string, d: { name:string; email:string; phone:string }) => req<any>("PUT", `/customers/${id}`, d),
  delete: (id: string) => req<any>("DELETE", `/customers/${id}`),
};

/* ── ANALYTICS ── */
export const analyticsApi = {
  getStats: () => req<{ revenue:number; totalOrders:number; totalCustomers:number; pendingOrders:number; lowStockProducts:number }>(
    "GET", "/analytics/stats"
  ),
};

/* ═══════════════════════════════════════════════
   LOCAL SEED DATA — used when backend is offline
═══════════════════════════════════════════════ */
export const localData = {
  products: [
    { id:"p1",  name:"iPhone 15 Pro",     price:1199, stock:24, category:"Mobile",   status:"Active"   },
    { id:"p2",  name:"MacBook Pro M3",    price:1999, stock:12, category:"Laptop",   status:"Active"   },
    { id:"p3",  name:"AirPods Pro 2",     price:249,  stock:58, category:"Audio",    status:"Active"   },
    { id:"p4",  name:"iPad Air",          price:599,  stock:31, category:"Tablet",   status:"Active"   },
    { id:"p5",  name:"Apple Watch S9",    price:399,  stock:0,  category:"Wearable", status:"Inactive" },
    { id:"p6",  name:"Samsung S24 Ultra", price:1299, stock:18, category:"Mobile",   status:"Active"   },
    { id:"p7",  name:"Dell XPS 15",       price:1749, stock:7,  category:"Laptop",   status:"Active"   },
    { id:"p8",  name:"Sony WH-1000XM5",   price:349,  stock:42, category:"Audio",    status:"Active"   },
    { id:"p9",  name:"Google Pixel 8",    price:699,  stock:0,  category:"Mobile",   status:"Inactive" },
    { id:"p10", name:"Nintendo Switch",   price:299,  stock:15, category:"Gaming",   status:"Active"   },
  ],
  orders: [
    { id:"#1001", customer:"Ali Khan",     amount:120, status:"Pending",   date:"2025-01-15" },
    { id:"#1002", customer:"Ahmed Raza",   amount:250, status:"Completed", date:"2025-01-14" },
    { id:"#1003", customer:"Sara Malik",   amount:90,  status:"Shipped",   date:"2025-01-13" },
    { id:"#1004", customer:"Fatima Noor",  amount:340, status:"Completed", date:"2025-01-12" },
    { id:"#1005", customer:"Omar Farooq",  amount:175, status:"Pending",   date:"2025-01-11" },
    { id:"#1006", customer:"Zainab Ali",   amount:420, status:"Shipped",   date:"2025-01-10" },
    { id:"#1007", customer:"Hassan Shah",  amount:65,  status:"Cancelled", date:"2025-01-09" },
    { id:"#1008", customer:"Ayesha Tariq", amount:290, status:"Completed", date:"2025-01-08" },
  ],
  customers: [
    { id:"c1", name:"Ali Khan",     email:"ali@gmail.com",    phone:"+92 300 1234567", orders:12, spent:2450, status:"Active",   joined:"2024-06-15" },
    { id:"c2", name:"Ahmed Raza",   email:"ahmed@gmail.com",  phone:"+92 301 2345678", orders:5,  spent:890,  status:"Active",   joined:"2024-07-20" },
    { id:"c3", name:"Sara Malik",   email:"sara@gmail.com",   phone:"+92 302 3456789", orders:23, spent:5670, status:"Active",   joined:"2024-03-10" },
    { id:"c4", name:"Fatima Noor",  email:"fatima@gmail.com", phone:"+92 303 4567890", orders:8,  spent:1240, status:"Active",   joined:"2024-08-01" },
    { id:"c5", name:"Omar Farooq",  email:"omar@gmail.com",   phone:"+92 304 5678901", orders:0,  spent:0,    status:"Inactive", joined:"2024-09-12" },
    { id:"c6", name:"Zainab Ali",   email:"zainab@gmail.com", phone:"+92 305 6789012", orders:17, spent:3890, status:"Active",   joined:"2024-04-22" },
    { id:"c7", name:"Hassan Shah",  email:"hassan@gmail.com", phone:"+92 306 7890123", orders:3,  spent:420,  status:"Active",   joined:"2024-10-05" },
    { id:"c8", name:"Ayesha Tariq", email:"ayesha@gmail.com", phone:"+92 307 8901234", orders:31, spent:8900, status:"Active",   joined:"2024-01-18" },
  ],
};

/* ── USERS ── */
export const usersApi = {
  getAll: () => req<any[]>("GET", "/users"),
  create: (d: { name:string; email:string; password:string; role:string }) => req<any>("POST", "/users", d),
  update: (id: string, d: { name:string; email:string; role:string; password?:string }) => req<any>("PUT", `/users/${id}`, d),
  delete: (id: string) => req<any>("DELETE", `/users/${id}`),
};
