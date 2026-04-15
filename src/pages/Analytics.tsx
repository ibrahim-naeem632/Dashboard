import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "../styles/analytics.css";

/* ================= DATA ================= */
const weeklyData = [
  { name: "Mon", revenue: 1200, orders: 30 },
  { name: "Tue", revenue: 2100, orders: 45 },
  { name: "Wed", revenue: 1800, orders: 38 },
  { name: "Thu", revenue: 2800, orders: 60 },
  { name: "Fri", revenue: 3200, orders: 75 },
  { name: "Sat", revenue: 2600, orders: 55 },
  { name: "Sun", revenue: 3000, orders: 68 },
];

const monthlyData = [
  { name: "Jan", revenue: 4000, orders: 240 },
  { name: "Feb", revenue: 3000, orders: 139 },
  { name: "Mar", revenue: 5000, orders: 400 },
  { name: "Apr", revenue: 4500, orders: 300 },
  { name: "May", revenue: 6000, orders: 500 },
];

const yearlyData = [
  { name: "2022", revenue: 40000, orders: 3200 },
  { name: "2023", revenue: 52000, orders: 4200 },
  { name: "2024", revenue: 68000, orders: 5800 },
];

const topProducts = [
  { name: "Premium Widget", sales: 432, pct: 92 },
  { name: "Starter Pack", sales: 318, pct: 74 },
  { name: "Pro License", sales: 276, pct: 61 },
  { name: "Enterprise Plan", sales: 198, pct: 48 },
  { name: "Add-on Module", sales: 145, pct: 33 },
];

const activities = [
  { color: "var(--emerald)", text: "New order #1042 placed — $240.00", time: "2 min ago" },
  { color: "var(--accent)", text: "Customer Sarah M. upgraded to Pro", time: "18 min ago" },
  { color: "var(--amber)", text: "Inventory alert: Widget stock below 50", time: "1 hr ago" },
  { color: "var(--rose)", text: "Refund processed for order #1038", time: "3 hr ago" },
];

/* ================= ANIMATED COUNTER ================= */
const AnimatedNumber: React.FC<{ target: number; prefix?: string; suffix?: string; duration?: number }> = ({
  target, prefix = "", suffix = "", duration = 1200,
}) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = target / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return (
    <span>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
};

/* ================= CUSTOM TOOLTIP ================= */
const CustomTooltip: React.FC<any> = ({ active, payload, label, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="tooltip-value">
          {isCurrency ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

/* ================= SPARKLINE ================= */
const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ================= MAIN COMPONENT ================= */
const Analytics: React.FC = () => {
  const [range, setRange] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const data = range === "Weekly" ? weeklyData : range === "Monthly" ? monthlyData : yearlyData;
  const totalRev = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrd = data.reduce((s, d) => s + d.orders, 0);

  const kpis = [
    { label: "Total Revenue", value: totalRev, prefix: "$", suffix: "", badge: "+12%", badgeCls: "up", sparkData: [12, 21, 18, 28, 32, 26, 30], sparkColor: "var(--emerald)" },
    { label: "Total Orders", value: totalOrd, prefix: "", suffix: "", badge: "+8%", badgeCls: "amber-b", sparkData: [30, 45, 38, 60, 75, 55, 68], sparkColor: "var(--amber)" },
    { label: "Customers", value: 860, prefix: "", suffix: "", badge: "+5%", badgeCls: "accent-b", sparkData: [40, 48, 52, 55, 60, 58, 65], sparkColor: "var(--accent)" },
    { label: "Conversion", value: 3.4, prefix: "", suffix: "%", badge: "+2%", badgeCls: "rose-b", sparkData: [2.1, 2.5, 2.8, 3.0, 3.1, 3.3, 3.4], sparkColor: "var(--rose)" },
  ];

  return (
    <div className="analytics-wrap">
      {/* HEADER */}
      <div className="a-header fade-item" style={{ animationDelay: "0s" }}>
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">Real-time insights across your business</p>
        </div>
        <div className="pill-group">
          {(["Weekly", "Monthly", "Yearly"] as const).map((item) => (
            <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div className="kpi fade-item" key={k.label} style={{ animationDelay: `${0.08 * (i + 1)}s` }}>
            <div className="kpi-top">
              <span className="kpi-label">{k.label}</span>
              <span className={`kpi-badge ${k.badgeCls}`}>{k.badge}</span>
            </div>
            <div className="kpi-bottom">
              <span className="kpi-val">
                {mounted ? (
                  k.suffix === "%" ? `${k.value}%` : <AnimatedNumber target={k.value} prefix={k.prefix} />
                ) : `${k.prefix}0${k.suffix}`}
              </span>
              <MiniSparkline data={k.sparkData} color={k.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="panel fade-item" style={{ animationDelay: "0.4s" }}>
          <div className="panel-head">
            <h3>Revenue Trend</h3>
            <span className="dot" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isCurrency />} />
              <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#818cf8", stroke: "#0a0a12", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel fade-item" style={{ animationDelay: "0.5s" }}>
          <div className="panel-head">
            <h3>Orders Overview</h3>
            <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 8px var(--amber)" }} />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        <div className="panel fade-item" style={{ animationDelay: "0.6s" }}>
          <div className="panel-head">
            <h3>Top Products</h3>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>by sales</span>
          </div>
          <div className="product-list">
            {topProducts.map((p, i) => (
              <div className="product-item" key={p.name}>
                <div className="product-rank">{i + 1}</div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-bar-track">
                    <div className="product-bar-fill" style={{ width: mounted ? `${p.pct}%` : "0%" }} />
                  </div>
                </div>
                <div className="product-sales">{p.sales}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel fade-item" style={{ animationDelay: "0.7s" }}>
          <div className="panel-head">
            <h3>Recent Activity</h3>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>live</span>
          </div>
          <div className="activity-list">
            {activities.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot-wrap">
                  <div className="activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                  {i < activities.length - 1 && <div className="activity-line" />}
                </div>
                <div className="activity-content">
                  <p>{a.text}</p>
                  <span className="time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;