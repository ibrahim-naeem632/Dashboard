import React, { useState } from "react";

// COMPONENTS
import StatCard from "../components/StatCard";
import Table from "../components/Table";

// STYLES
import "../styles/dashboard.css";
import "../styles/animations.css";

// CHART
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// DATA
import {
  stats,
  weeklyData,
  monthlyData,
  orderColumns,
  orderData,
} from "../utils/dashboardData";

// UTILS
import { formatCurrency } from "../utils/format";

interface StatItem {
  title: string;
  value: number;
  change: string;
  isCurrency?: boolean;
  icon?: string;
  sparkline?: number[];
}

const Dashboard: React.FC = () => {
const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly");

  const chartData = range === "weekly" ? weeklyData : monthlyData;

  return (
    <div className="dashboard fade-up">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Track your business performance</p>
        </div>

        <button className="primary-btn">+ Add Product</button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {(stats as StatItem[]).map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={
              item.isCurrency
                ? formatCurrency(item.value)
                : item.value.toString()
            }
            change={item.change}
            icon={item.icon}
            sparklineData={item.sparkline}
          />
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* LEFT */}
        <div className="left-col">

          {/* CHART */}
          <div className="panel">
            <div className="panel-header">
              <h3>Sales Analytics</h3>

              {/* TOGGLE */}
              <div className="chart-toggle">
                <button
                  className={range === "weekly" ? "active" : ""}
                  onClick={() => setRange("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={range === "monthly" ? "active" : ""}
                  onClick={() => setRange("monthly")}
                >
                  Monthly
                </button>
                                <button
                  className={range === "daily" ? "active" : ""}
                  onClick={() => setRange("daily")}
                >
                  Daily
                </button>
              </div>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.05)"
                  />

                  <XAxis dataKey="name" stroke="var(--secondary)" />
                  <YAxis stroke="var(--secondary)" />

                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value)
                    }
                    contentStyle={{
                      background: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #eee",
                    }}
                  />

                  <Legend />

                  {/* GRADIENTS */}
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* REVENUE */}
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    fill="url(#rev)"
                    strokeWidth={3}
                    dot={false}
                  />

                  {/* ORDERS */}
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#f59e0b"
                    fill="url(#orders)"
                    strokeWidth={3}
                    dot={false}
                  />

                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE */}
          <div className="panel">
            <div className="panel-header">
              <h3>Recent Orders</h3>
            </div>

            <Table columns={orderColumns} data={orderData} />
          </div>

        </div>

        {/* RIGHT */}
        <div className="panel activity-panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
          </div>

          {[
            { text: "New order received", time: "2 min ago" },
            { text: "Product added", time: "10 min ago" },
            { text: "Customer registered", time: "30 min ago" },
          ].map((item, index) => (
            <div className="activity-item" key={index}>
              <p>{item.text}</p>
              <span>{item.time}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;