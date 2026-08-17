import React, { useEffect, useState, useCallback } from "react";
import "../styles/statecard.css";

// ─── TYPES (backend-ready) ───
type StatCardProps = {
  title: string;
  value: string;
  change: number;
  icon?: React.ReactNode;
  sparklineData?: number[];
  iconColor?: string;
  loading?: boolean;
};

// ─── HELPER: format number during count-up ───
const formatAnimatedValue = (
  current: number,
  finalValue: string
): string => {
  const hasDollar = finalValue.includes("$");
  const hasComma = finalValue.includes(",");
  const hasPercent = finalValue.includes("%");

  let formatted = Math.floor(current).toString();

  if (hasComma) {
    formatted = Math.floor(current).toLocaleString();
  }

  if (hasDollar) {
    formatted = "$" + formatted;
  }

  if (hasPercent) {
    formatted = formatted + "%";
  }

  return formatted;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  sparklineData = [],
  iconColor = "var(--primary)",
  loading = false,
}) => {
  const isPositive = change >= 0;
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  // ─── COUNT-UP WITH PROPER FORMATTING ───
  const animateValue = useCallback(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

    if (numericValue === 0) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * numericValue;

      if (progress < 1) {
        setDisplayValue(formatAnimatedValue(start, value));
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

useEffect(() => {
  if (!loading && !hasAnimated) {
    animateValue();
  }
}, [loading, animateValue, hasAnimated]);

  // ─── SPARKLINE: normalize to percentage heights ───
  const normalizedSparkline = (() => {
    if (sparklineData.length === 0) return [];
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    return sparklineData.map((val) => ((val - min) / range) * 100);
  })();

  // ─── LOADING SKELETON ───
  if (loading) {
    return (
      <div className="stat-card stat-card-loading">
        <div className="stat-skeleton stat-skeleton-title" />
        <div className="stat-skeleton stat-skeleton-value" />
        <div className="stat-skeleton stat-skeleton-change" />
      </div>
    );
  }

  return (
    <div className="stat-card">
      {/* HEADER */}
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <div
            className="stat-icon-box"
            style={{ background: `${iconColor}15`, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* VALUE */}
      <h2 className="stat-value">{displayValue}</h2>

      {/* CHANGE + SPARKLINE ROW */}
      <div className="stat-footer">
        <div
          className={`stat-change ${
            isPositive ? "stat-positive" : "stat-negative"
          }`}
        >
          <span className="stat-arrow">{isPositive ? "↑" : "↓"}</span>
          <span>
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="stat-muted">this month</span>
        </div>

        {/* SPARKLINE */}
        {normalizedSparkline.length > 0 && (
          <div className="stat-sparkline">
            {normalizedSparkline.map((height, i) => (
              <span
                key={i}
                className="stat-sparkline-bar"
                style={{
                  height: `${Math.max(height, 8)}%`,
                  opacity: i === normalizedSparkline.length - 1 ? 1 : 0.5,
                  background: isPositive ? "#16a34a" : "#dc2626",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;