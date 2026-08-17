import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      height:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"var(--bg)", gap:16, textAlign:"center", padding:24,
    }}>
      <div style={{
        fontSize:72, fontWeight:900, color:"var(--border)",
        fontFamily:"DM Mono,monospace", lineHeight:1, letterSpacing:-4,
      }}>404</div>
      <h2 style={{ fontSize:22, fontWeight:800, color:"var(--text)", letterSpacing:"-.3px" }}>
        Page not found
      </h2>
      <p style={{ fontSize:14, color:"var(--muted)", maxWidth:320 }}>
        The page you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div style={{ display:"flex", gap:10, marginTop:8 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding:"9px 20px", borderRadius:8,
            border:"1.5px solid var(--border)",
            background:"var(--card)", color:"var(--text)",
            fontSize:13, fontWeight:600, cursor:"pointer",
            fontFamily:"inherit", transition:"all .18s",
          }}
        >← Go Back</button>
        <button
          onClick={() => navigate("/")}
          style={{
            padding:"9px 20px", borderRadius:8, border:"none",
            background:"var(--brand)", color:"#fff",
            fontSize:13, fontWeight:700, cursor:"pointer",
            fontFamily:"inherit", transition:"all .18s",
            boxShadow:"var(--brand-glow)",
          }}
        >Go to Dashboard</button>
      </div>
    </div>
  );
};

export default NotFound;
