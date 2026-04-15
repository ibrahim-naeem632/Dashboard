/* =========================
   TYPES (VERY IMPORTANT)
========================= */

export interface Stat {
  title: string;
  value: number;
  change: string | number;
  isCurrency?: boolean;
  icon?: string;
  sparkline?: number[];
}

export interface ChartData {
  name: string;
  sales: number;
}

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: "Pending" | "Completed" | "Shipped";
}

/* =========================
   STATS DATA
========================= */

export const stats: Stat[] = [
  {
    title: "Revenue",
    value: 24500,
    change: 12,
    isCurrency: true,
    icon: "💰",
    sparkline: [10, 20, 15, 30, 25, 35],
  },
  {
    title: "Orders",
    value: 1320,
    change: "8",
    icon: "📦",
    sparkline: [5, 10, 8, 12, 9, 15],
  },
  {
    title: "Customers",
    value: 890,
    change: "5",
    icon: "👤",
    sparkline: [3, 6, 4, 8, 7, 10],
  },
  {
    title: "Refunds",
    value: 1200,
    change: "-2",
    isCurrency: true,
    icon: "↩️",
    sparkline: [8, 6, 7, 5, 4, 3],
  },
];

/* =========================
   CHART DATA
========================= */

export const weeklyData = [
  { name: "Mon", revenue: 1200, orders: 30 },
  { name: "Tue", revenue: 2100, orders: 45 },
  { name: "Wed", revenue: 1800, orders: 38 },
  { name: "Thu", revenue: 2800, orders: 60 },
  { name: "Fri", revenue: 3200, orders: 75 },
  { name: "Sat", revenue: 2600, orders: 55 },
  { name: "Sun", revenue: 3000, orders: 68 },
];

export const monthlyData = [
  { name: "Jan", revenue: 12000, orders: 320 },
  { name: "Feb", revenue: 15000, orders: 380 },
  { name: "Mar", revenue: 18000, orders: 420 },
  { name: "Apr", revenue: 22000, orders: 500 },
];

/* =========================
   TABLE COLUMNS
========================= */

export const orderColumns = [
  { header: "Order ID", accessor: "id" },
  { header: "Customer", accessor: "customer" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: "status" },
];

/* =========================
   TABLE DATA (BACKEND READY)
========================= */

export const orderData: Order[] = [
  {
    id: "#1234",
    customer: "Ali Khan",
    amount: 120,
    status: "Pending",
  },
  {
    id: "#1235",
    customer: "Ahmed",
    amount: 250,
    status: "Completed",
  },
  {
    id: "#1236",
    customer: "Sara",
    amount: 90,
    status: "Shipped",
  },
];