import React from "react";
import { useAuth } from "../hooks/useAuth";

const RoleBanner: React.FC = () => {
  const { role, name } = useAuth();
  if (role === "admin") return null;

  const cfg = role === "manager"
    ? { icon:"🔧", color:"var(--amber)", bg:"var(--amber-dim)", border:"rgba(245,158,11,.18)",
        msg:"Manager access — you can manage all data & users, but Settings is Admin-only." }
    : { icon:"👁",  color:"var(--blue)",  bg:"var(--blue-dim)",  border:"rgba(59,130,246,.18)",
        msg:"Viewer access — read-only. You cannot add, edit, or delete any data." };

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 16px", borderRadius:"var(--r-sm)",
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      marginBottom:4,
    }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{cfg.icon}</span>
      <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.5, flex:1 }}>
        <strong style={{ color:cfg.color }}>{name}</strong> — {cfg.msg}
      </p>
    </div>
  );
};

export default RoleBanner;
