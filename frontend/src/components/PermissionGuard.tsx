import React from "react";
import { useAuth, PERMISSIONS, ROLE_CAPABILITIES } from "../hooks/useAuth";
import type { UserRole } from "../hooks/useAuth";

type PermKey = keyof typeof PERMISSIONS;

interface Props {
  permission: PermKey;
  children: React.ReactNode;
  action?: string;
}

const PermissionGuard: React.FC<Props> = ({ permission, children, action }) => {
  const auth = useAuth();
  const allowed = PERMISSIONS[permission](auth.role);

  if (allowed) return <>{children}</>;

  const caps = ROLE_CAPABILITIES[auth.role];

  const roleStyle: Record<UserRole, { bg: string; text: string; border: string }> = {
    admin:   { bg:"var(--purple-dim)", text:"var(--purple)", border:"rgba(139,92,246,.2)" },
    manager: { bg:"var(--amber-dim)",  text:"var(--amber)",  border:"rgba(245,158,11,.2)" },
    viewer:  { bg:"var(--blue-dim)",   text:"var(--blue)",   border:"rgba(59,130,246,.2)" },
  };
  const rc = roleStyle[auth.role];

  return (
    <div style={{
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"60px 24px",gap:20,textAlign:"center",
      background:"var(--card)",borderRadius:"var(--r-xl)",
      border:"1.5px dashed var(--border)",boxShadow:"var(--shadow-xs)",
    }}>
      <div style={{
        width:64,height:64,borderRadius:"50%",
        background:"var(--red-dim)",border:"2px solid rgba(239,68,68,.15)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
      }}>🔒</div>

      <div>
        <h3 style={{fontSize:18,fontWeight:800,color:"var(--text)",marginBottom:8,letterSpacing:"-.25px"}}>
          Access Restricted
        </h3>
        <p style={{fontSize:13.5,color:"var(--muted)",maxWidth:340,lineHeight:1.6}}>
          {action
            ? `You don't have permission to ${action}. `
            : "You don't have permission to access this section. "}
          Contact an <strong style={{color:"var(--text)"}}>Admin</strong> to request access.
        </p>
      </div>

      {/* Role badge */}
      <div style={{
        display:"inline-flex",alignItems:"center",gap:8,
        background:rc.bg,border:`1px solid ${rc.border}`,
        padding:"8px 18px",borderRadius:30,
      }}>
        <span style={{fontSize:14}}>
          {auth.role==="admin"?"👑":auth.role==="manager"?"🔧":"👁"}
        </span>
        <span style={{fontSize:13,fontWeight:700,color:rc.text}}>
          Your role: {auth.role.charAt(0).toUpperCase()+auth.role.slice(1)}
        </span>
      </div>

      {/* Capability grid */}
      <div style={{
        display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,
        width:"100%",maxWidth:480,textAlign:"left",
      }}>
        <div style={{background:"var(--green-dim)",border:"1px solid rgba(0,166,126,.15)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:10.5,fontWeight:800,textTransform:"uppercase",letterSpacing:.8,color:"var(--green)",marginBottom:8}}>
            ✓ You can
          </div>
          {caps.allowed.map(a=>(
            <div key={a} style={{fontSize:12.5,color:"var(--text2)",marginBottom:4,display:"flex",alignItems:"flex-start",gap:6}}>
              <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{a}
            </div>
          ))}
        </div>

        <div style={{background:"var(--red-dim)",border:"1px solid rgba(239,68,68,.15)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:10.5,fontWeight:800,textTransform:"uppercase",letterSpacing:.8,color:"var(--red)",marginBottom:8}}>
            ✗ You cannot
          </div>
          {caps.blocked.length ? caps.blocked.map(b=>(
            <div key={b} style={{fontSize:12.5,color:"var(--text2)",marginBottom:4,display:"flex",alignItems:"flex-start",gap:6}}>
              <span style={{color:"var(--red)",fontWeight:700,flexShrink:0}}>✗</span>{b}
            </div>
          )):(
            <div style={{fontSize:12.5,color:"var(--green)"}}>No restrictions 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionGuard;
