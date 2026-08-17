import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { analyticsApi } from "../services/api";
import "../styles/analytics.css";
import "../styles/animations.css";

/* ── Data ── */
const WEEKLY = [
  { name:"Mon", revenue:1200, orders:30 },
  { name:"Tue", revenue:2100, orders:45 },
  { name:"Wed", revenue:1800, orders:38 },
  { name:"Thu", revenue:2800, orders:60 },
  { name:"Fri", revenue:3200, orders:75 },
  { name:"Sat", revenue:2600, orders:55 },
  { name:"Sun", revenue:3000, orders:68 },
];
const MONTHLY = [
  { name:"Jan", revenue:12000, orders:320 },
  { name:"Feb", revenue:15000, orders:380 },
  { name:"Mar", revenue:18000, orders:420 },
  { name:"Apr", revenue:22000, orders:500 },
  { name:"May", revenue:19500, orders:460 },
  { name:"Jun", revenue:24000, orders:540 },
];
const YEARLY = [
  { name:"2021", revenue:180000, orders:3200 },
  { name:"2022", revenue:240000, orders:4100 },
  { name:"2023", revenue:320000, orders:5600 },
  { name:"2024", revenue:420000, orders:7200 },
];

const TOP_PRODUCTS = [
  { name:"iPhone 15 Pro",   sales:432, pct:92 },
  { name:"MacBook Pro M3",  sales:318, pct:74 },
  { name:"AirPods Pro 2",   sales:276, pct:61 },
  { name:"Samsung S24",     sales:198, pct:48 },
  { name:"iPad Air",        sales:145, pct:33 },
];

const ACTIVITIES = [
  { color:"var(--green)", text:"New order #1042 placed — $240.00",          time:"2 min ago" },
  { color:"var(--brand)", text:"Customer Sara upgraded her account",         time:"18 min ago" },
  { color:"var(--amber)", text:"Inventory alert: AirPods stock below 10",   time:"1 hr ago" },
  { color:"var(--red)",   text:"Refund processed for order #1038 — $90.00", time:"3 hr ago" },
  { color:"var(--green)", text:"New customer Bilal Ahmed registered",        time:"5 hr ago" },
];

/* ── Animated number ── */
const AnimNum: React.FC<{ to:number; prefix?:string; suffix?:string }> = ({ to, prefix="", suffix="" }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = to / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= to) { setV(to); clearInterval(t); }
      else setV(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
};

/* ── Custom tooltip ── */
const ChartTip: React.FC<any> = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="tooltip-value">
          {money ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

/* ── Sparkline ── */
const Spark: React.FC<{ data:number[]; color:string }> = ({ data, color }) => {
  const max = Math.max(...data); const min = Math.min(...data);
  const r   = max - min || 1;
  const W = 80; const H = 32;
  const pts = data.map((v,i) => `${(i/(data.length-1))*W},${H-((v-min)/r)*H}`).join(" ");
  return (
    <svg width={W} height={H} style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const Analytics: React.FC = () => {
  const [range,   setRange]   = useState<"Weekly"|"Monthly"|"Yearly">("Monthly");
  const [ready,   setReady]   = useState(false);
  const [liveStats, setLive]  = useState({ revenue:24500, totalOrders:1320, totalCustomers:890, pendingOrders:4 });

  useEffect(() => {
    setReady(true);
    analyticsApi.getStats().then(d => setLive(d)).catch(() => {});
  }, []);

  const data = range === "Weekly" ? WEEKLY : range === "Monthly" ? MONTHLY : YEARLY;
  const totalRev = data.reduce((s,d) => s + d.revenue, 0);
  const totalOrd = data.reduce((s,d) => s + d.orders,  0);

  const KPIS = [
    { label:"Total Revenue",   to:totalRev,                  pre:"$", suf:"",  badge:"+12%", cls:"kpi-up",      spark:[12,21,18,28,32,26,30], sc:"var(--green)" },
    { label:"Total Orders",    to:totalOrd,                  pre:"",  suf:"",  badge:"+8%",  cls:"kpi-neutral", spark:[30,45,38,60,75,55,68], sc:"var(--brand)" },
    { label:"Customers",       to:liveStats.totalCustomers,  pre:"",  suf:"",  badge:"+5%",  cls:"kpi-neutral", spark:[40,48,52,55,60,58,65], sc:"var(--purple)"},
    { label:"Conversion Rate", to:3,                         pre:"",  suf:"%", badge:"+0.4%",cls:"kpi-up",      spark:[2.1,2.5,2.8,3.0,3.1,3.3,3.4],sc:"var(--amber)"},
  ];

  return (
    <div className="analytics-wrap fade-up">

      {/* HEADER */}
      <div className="a-header">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">Real-time insights across your business</p>
        </div>
        <div className="pill-group">
          {(["Weekly","Monthly","Yearly"] as const).map(r => (
            <button key={r} className={range===r?"active":""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        {KPIS.map((k,i) => (
          <div className="kpi fade-item" key={k.label} style={{ animationDelay:`${i*.08}s`, opacity:0 }}>
            <div className="kpi-top">
              <span className="kpi-label">{k.label}</span>
              <span className={`kpi-badge ${k.cls}`}>{k.badge}</span>
            </div>
            <div className="kpi-bottom">
              <span className="kpi-val">
                {ready ? <AnimNum to={k.to} prefix={k.pre} suffix={k.suf}/> : `${k.pre}0${k.suf}`}
              </span>
              <Spark data={k.spark} color={k.sc}/>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="panel fade-item" style={{ animationDelay:"0.35s", opacity:0 }}>
          <div className="panel-head">
            <h3>Revenue Trend</h3>
            <span className="dot" style={{ background:"var(--brand)", boxShadow:"0 0 8px var(--brand)" }}/>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--brand)" stopOpacity={.22}/>
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border2)"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"var(--muted)" }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"var(--muted)" }} width={52}/>
              <Tooltip content={<ChartTip money/>}/>
              <Area type="monotone" dataKey="revenue" stroke="var(--brand)" fill="url(#gA)" strokeWidth={2.5} dot={false}
                activeDot={{ r:5, fill:"var(--brand)", stroke:"var(--card)", strokeWidth:2 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel fade-item" style={{ animationDelay:"0.45s", opacity:0 }}>
          <div className="panel-head">
            <h3>Orders Overview</h3>
            <span className="dot" style={{ background:"var(--amber)", boxShadow:"0 0 8px var(--amber)" }}/>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--amber)" stopOpacity={.9}/>
                  <stop offset="100%" stopColor="var(--amber)" stopOpacity={.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border2)"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"var(--muted)" }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"var(--muted)" }} width={52}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="orders" fill="url(#gB)" radius={[6,6,0,0]} maxBarSize={40}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="bottom-row">
        <div className="panel fade-item" style={{ animationDelay:"0.55s", opacity:0 }}>
          <div className="panel-head">
            <h3>Top Products</h3>
            <span style={{ fontSize:12, color:"var(--dim)" }}>by sales volume</span>
          </div>
          <div className="product-list">
            {TOP_PRODUCTS.map((p,i) => (
              <div className="product-item" key={p.name}>
                <div className="product-rank">{i+1}</div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-bar-track">
                    <div className="product-bar-fill" style={{ width:ready?`${p.pct}%`:"0%" }}/>
                  </div>
                </div>
                <div className="product-sales">{p.sales}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel fade-item" style={{ animationDelay:"0.65s", opacity:0 }}>
          <div className="panel-head">
            <h3>Recent Activity</h3>
            <span style={{ fontSize:11, color:"var(--green)", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", display:"inline-block" }}/>
              Live
            </span>
          </div>
          <div className="activity-list">
            {ACTIVITIES.map((a,i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot-wrap">
                  <div className="activity-dot" style={{ background:a.color, boxShadow:`0 0 6px ${a.color}40` }}/>
                  {i < ACTIVITIES.length-1 && <div className="activity-line"/>}
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
