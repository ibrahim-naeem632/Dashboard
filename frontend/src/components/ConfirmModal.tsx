import React from "react";

interface Props {
  isOpen:    boolean;
  title:     string;
  message:   string;
  onCancel:  () => void;
  onConfirm: () => void;
  danger?:   boolean;
}

const ConfirmModal: React.FC<Props> = ({ isOpen, title, message, onCancel, onConfirm, danger=true }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position:"fixed", inset:0,
        background:"rgba(7,11,20,.55)", backdropFilter:"blur(6px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:999, padding:20, animation:"ovFade .18s ease",
      }}
      onClick={onCancel}
    >
      <style>{`@keyframes ovFade{from{opacity:0}to{opacity:1}} @keyframes popIn{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      <div
        style={{
          background:"var(--card)", border:"1px solid var(--border)",
          borderRadius:"var(--r-xl)", padding:28, width:360, maxWidth:"90vw",
          textAlign:"center", boxShadow:"var(--shadow-xl)",
          animation:"popIn .22s var(--ease-spring,ease)", display:"flex",
          flexDirection:"column", alignItems:"center", gap:12,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width:52, height:52, borderRadius:"50%",
          background: danger ? "var(--red-dim)" : "var(--brand-dim)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26,
        }}>
          {danger ? "🗑️" : "❓"}
        </div>
        <h3 style={{ fontSize:18, fontWeight:800, color:"var(--text)", letterSpacing:"-.25px" }}>{title}</h3>
        <p style={{ fontSize:13.5, color:"var(--muted)", lineHeight:1.55 }}>{message}</p>
        <div style={{ display:"flex", gap:10, width:"100%", marginTop:6 }}>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding:"10px 14px", borderRadius:"var(--r-sm)",
              border:"1.5px solid var(--border)", background:"var(--bg)",
              color:"var(--text)", fontSize:13.5, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding:"10px 14px", borderRadius:"var(--r-sm)",
              border:"none",
              background: danger ? "var(--red)" : "var(--brand)",
              color:"#fff", fontSize:13.5, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
            }}
          >{danger ? "Delete" : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
