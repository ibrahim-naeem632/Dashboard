import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi, ordersApi } from "../services/api";
import { formatCurrency } from "../utils/format";
import "../styles/dashboard.css";
import "../styles/animations.css";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  PieChart, Pie, Cell, Tooltip as PieTip,
} from "recharts";
import { weeklyData, monthlyData } from "../utils/dashboardData";

/* ── Static data ── */
const TOP_PRODUCTS = [
  { name:"iPhone 15 Pro",     sales:248, max:248, icon:"📱", color:"#5c6ac4" },
  { name:"MacBook Pro M3",    sales:185, max:248, icon:"💻", color:"#8b5cf6" },
  { name:"AirPods Pro 2",     sales:162, max:248, icon:"🎧", color:"#00a67e" },
  { name:"iPad Air",          sales:134, max:248, icon:"📲", color:"#f97316" },
  { name:"Samsung S24 Ultra", sales:98,  max:248, icon:"📸", color:"#3b82f6" },
];

const ACTIVITY = [
  { text:"New order #1048 from Ali Khan — $340",   time:"just now",  dot:"var(--green)" },
  { text:"MacBook Pro stock updated to 12 units",  time:"4 min ago", dot:"var(--brand)" },
  { text:"Customer Zainab Ali registered",         time:"18 min ago",dot:"var(--purple)" },
  { text:"Order #1044 marked as Completed",        time:"42 min ago",dot:"var(--green)" },
  { text:"⚠ AirPods Pro stock is low (3 left)",   time:"1 hr ago",  dot:"var(--amber)" },
  { text:"Payment received $1,200 from Sara",      time:"2 hr ago",  dot:"var(--green)" },
];

const DONUT_COLORS = ["#00a67e","#5c6ac4","#f59e0b","#e53e3e"];
const DONUT_DATA   = [
  { name:"Completed", value:65, count:"858"  },
  { name:"Shipped",   value:20, count:"264"  },
  { name:"Pending",   value:10, count:"132"  },
  { name:"Cancelled", value:5,  count:"66"   },
];

/* ── Custom Tooltip ── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", boxShadow:"var(--shadow-lg)" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"var(--dim)", textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block" }} />
          <span style={{ fontSize:12.5, color:"var(--text2)", textTransform:"capitalize" }}>{p.name}:</span>
          <span style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"DM Mono,monospace" }}>
            {p.name === "revenue" ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Donut center label ── */
const DonutLabel = ({ viewBox, total }: any) => {
  const { cx, cy } = viewBox;
  return (
    <text textAnchor="middle">
      <tspan x={cx} y={cy - 5} style={{ fontSize:20, fontWeight:800, fill:"var(--text)", fontFamily:"DM Mono,monospace" }}>{total}</tspan>
      <tspan x={cx} y={cy + 13} style={{ fontSize:10, fill:"var(--muted)", fontWeight:600 }}>Orders</tspan>
    </text>
  );
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange]   = useState<"weekly"|"monthly">("weekly");
  const [stats, setStats]   = useState({
    revenue:24500, totalOrders:1320, totalCustomers:890, pendingOrders:132, lowStockProducts:3
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.getStats().then(setStats).catch(() => {});
    ordersApi.getAll().then(d => setRecentOrders(d.slice(0, 5))).catch(() => {});
  }, []);

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const first    = user.name?.split(" ")[0] || "Ibrahim";
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today    = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  const chartData = range === "weekly" ? weeklyData : monthlyData;

  const KPI_CARDS = [
    { label:"Total Revenue",   value:formatCurrency(stats.revenue),        change:+12.5, up:true,  icon:"💰", color:"#00a67e", bg:"var(--green-dim)", spark:[9,12,10,18,16,22,20,28] },
    { label:"Total Orders",    value:stats.totalOrders.toLocaleString(),    change:+8.2,  up:true,  icon:"📦", color:"#5c6ac4", bg:"var(--brand-dim)", spark:[5,8,7,11,10,14,12,16] },
    { label:"Customers",       value:stats.totalCustomers.toLocaleString(), change:+5.1,  up:true,  icon:"👥", color:"#8b5cf6", bg:"var(--purple-dim)",spark:[3,5,4,7,6,9,8,11] },
    { label:"Pending Orders",  value:stats.pendingOrders.toLocaleString(),  change:-2.4,  up:false, icon:"⏳", color:"#f97316", bg:"var(--orange-dim)",spark:[14,11,13,9,8,6,7,5] },
  ];

  const statRows = [
    { label:"Total Revenue",  val:formatCurrency(stats.revenue),        badge:"+12.5%", up:true },
    { label:"Avg Order Value",val:"$18.56",                               badge:"+4.2%",  up:true },
    { label:"Highest Day",    val:"$4,200",                               badge:"Apr 28", up:null },
  ];

  const fallbackOrders = [
    {id:"#1001",customer:"Ali Khan",     amount:120, status:"Pending"},
    {id:"#1002",customer:"Ahmed Raza",   amount:250, status:"Completed"},
    {id:"#1003",customer:"Sara Malik",   amount:90,  status:"Shipped"},
    {id:"#1004",customer:"Fatima Noor",  amount:340, status:"Completed"},
    {id:"#1005",customer:"Omar Farooq",  amount:175, status:"Pending"},
  ];
  const orders = recentOrders.length ? recentOrders : fallbackOrders;

  const statusBadgeStyle = (s: string) => {
    const map: Record<string, [string,string]> = {
      Completed:["var(--green-dim)","var(--green)"],
      Shipped:  ["var(--blue-dim)","var(--blue)"],
      Pending:  ["var(--amber-dim)","var(--amber)"],
      Cancelled:["var(--red-dim)","var(--red)"],
    };
    const [bg, col] = map[s] || ["var(--border2)","var(--muted)"];
    return { background:bg, color:col, padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:700 };
  };

  return (
    <div className="dashboard fade-up">

      {/* ── TOP BAR ── */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <div className="dash-greeting">{greeting}, {first} 👋</div>
          <div className="dash-subtitle">Here's what's happening with your store</div>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-date">📅 {today}</div>
          <button className="dash-add-btn" onClick={() => navigate("/products")}>
            + Add Product
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="kpi-strip">
        {KPI_CARDS.map((k, i) => {
          const max = Math.max(...k.spark);
          const min = Math.min(...k.spark);
          return (
            <div className={`kpi-card kpi-card-${i}`} key={k.label}>
              <div className="kpi-top">
                <span className="kpi-label">{k.label}</span>
                <div className="kpi-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-footer">
                <div className={`kpi-change ${k.up ? "kpi-up" : "kpi-down"}`}>
                  {k.up ? "↑" : "↓"} {Math.abs(k.change)}%
                  <span className="kpi-vs">vs last month</span>
                </div>
                <div className="kpi-spark">
                  {k.spark.map((v, j) => (
                    <div key={j} className="kpi-spark-bar" style={{
                      height:`${((v-min)/(max-min||1))*100+10}%`,
                      background:j===k.spark.length-1 ? k.color : k.color+"66",
                    }}/>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MIDDLE GRID ── */}
      <div className="mid-grid">

        {/* REVENUE CHART */}
        <div className="chart-card">
          <div className="chart-card-head">
            <div>
              <div className="chart-card-title">Revenue Overview</div>
              <div className="chart-card-sub">Income & order trends</div>
            </div>
            <div className="range-pills">
              {(["weekly","monthly"] as const).map(r => (
                <button key={r} className={`range-pill ${range===r?"active":""}`} onClick={() => setRange(r)}>
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* SUMMARY STRIP */}
          <div className="chart-summary">
            {statRows.map(s => (
              <div className="chart-summary-item" key={s.label}>
                <div className="chart-summary-label">{s.label}</div>
                <div className="chart-summary-val">{s.val}</div>
                <div className={`chart-summary-badge ${s.up===null?"":s.up?"up":"down"}`}>{s.badge}</div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top:5, right:8, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#5c6ac4" stopOpacity={.22}/>
                  <stop offset="100%" stopColor="#5c6ac4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00a67e" stopOpacity={.18}/>
                  <stop offset="100%" stopColor="#00a67e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border2)"/>
              <XAxis dataKey="name" tick={{ fontSize:11, fill:"var(--muted)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"var(--muted)" }} axisLine={false} tickLine={false} width={48}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="revenue" stroke="#5c6ac4" fill="url(#gRev)" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:"#5c6ac4" }}/>
              <Area type="monotone" dataKey="orders"  stroke="#00a67e" fill="url(#gOrd)" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:"#00a67e" }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ORDER STATUS */}
        <div className="order-status-card">
          <h3>Order Status</h3>
          <div className="donut-wrap">
            <PieChart width={140} height={140}>
              <Pie
                data={DONUT_DATA} cx={65} cy={65}
                innerRadius={46} outerRadius={65}
                paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}
              >
                {DONUT_DATA.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} strokeWidth={0}/>
                ))}
                <DonutLabel viewBox={{ cx:65, cy:65 }} total={stats.totalOrders.toLocaleString()}/>
              </Pie>
              <PieTip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:9, padding:"7px 12px", fontSize:12.5, fontWeight:600, color:"var(--text)", boxShadow:"var(--shadow-lg)" }}>
                      {payload[0].name}: {payload[0].value}%
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </div>
          <div className="order-legend">
            {DONUT_DATA.map((d, i) => (
              <div className="legend-item" key={d.name}>
                <div className="legend-left">
                  <span className="legend-dot" style={{ background:DONUT_COLORS[i] }}/>
                  <span className="legend-text">{d.name}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="legend-pct">{d.value}%</div>
                  <div className="legend-count">{d.count} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="bottom-grid">

        {/* TOP PRODUCTS */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Top Products</span>
            <button className="panel-link" onClick={() => navigate("/products")}>View all →</button>
          </div>
          {TOP_PRODUCTS.map((p, i) => (
            <div className="product-row" key={p.name}>
              <div className="product-rank">#{i+1}</div>
              <div className="product-icon" style={{ background:p.color+"18" }}>{p.icon}</div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-bar-track">
                  <div className="product-bar-fill" style={{ width:`${(p.sales/p.max)*100}%`, background:p.color }}/>
                </div>
              </div>
              <div className="product-sales">{p.sales}</div>
            </div>
          ))}
        </div>

        {/* RECENT ORDERS */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Orders</span>
            <button className="panel-link" onClick={() => navigate("/orders")}>View all →</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 90px 100px", padding:"0 0 8px", borderBottom:"1px solid var(--border)" }}>
              {["Order","Customer","Amount","Status"].map(h => (
                <span key={h} style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:.8, color:"var(--dim)" }}>{h}</span>
              ))}
            </div>
            {orders.map((o: any) => (
              <div key={o.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 90px 100px", padding:"11px 0", borderBottom:"1px solid var(--border2)", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--brand)", fontFamily:"DM Mono,monospace" }}>{o.id}</span>
                <span style={{ fontSize:13, color:"var(--text2)", fontWeight:500 }}>{o.customer}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"DM Mono,monospace" }}>${o.amount}</span>
                <span style={statusBadgeStyle(o.status)}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVITY ── */}
      <div className="panel" style={{ marginBottom:4 }}>
        <div className="panel-head">
          <span className="panel-title">Recent Activity</span>
          <span style={{ fontSize:12, color:"var(--dim)" }}>Last 24 hours</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0 }}>
          {ACTIVITY.map((a, i) => (
            <div className="activity-row" key={i} style={{ borderRight: i%3<2 ? "1px solid var(--border2)" : "none", paddingRight:16, paddingLeft: i%3>0 ? 16 : 0 }}>
              <div className="activity-dot-col">
                <span className="activity-dot" style={{ background:a.dot }}/>
                {i < ACTIVITY.length - 3 && <span className="activity-line"/>}
              </div>
              <div className="activity-body">
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
