import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import MainLayout  from "./layout/MainLayout";
import Dashboard   from "./pages/Dashboard";
import Products    from "./pages/Products";
import Orders      from "./pages/Orders";
import Customers   from "./pages/Customers";
import Analytics   from "./pages/Analytics";
import Settings    from "./pages/Settings";
import Users       from "./pages/Users";
import Login       from "./pages/login";
import NotFound    from "./pages/NotFound";
import "./styles/toast.css";

/* ── Session validator ──────────────────────────────
   Checks BOTH token AND user exist.
   Clears stale sessions (user without token).
   Validates token is not obviously malformed.
─────────────────────────────────────────────────── */
function checkSession(): boolean {
  const token = localStorage.getItem("token");
  const user  = localStorage.getItem("user");

  // Nothing stored → not authenticated
  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }

  // Validate user is valid JSON
  try {
    const parsed = JSON.parse(user);
    if (!parsed.email || !parsed.role) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }

  // For real JWT: check expiry
  // Offline fake tokens are "xxx.offline" — allow them
  if (!token.endsWith(".offline")) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          // Token expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return false;
        }
      }
    } catch {
      // If decode fails, still allow (might be non-standard)
    }
  }

  return true;
}

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  checkSession() ? <>{children}</> : <Navigate to="/login" replace />;

const Public: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  checkSession() ? <Navigate to="/" replace /> : <>{children}</>;

/* ── Loading screen ── */
const Loader = () => (
  <div style={{
    height:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    background:"var(--bg)", gap:16,
  }}>
    <div style={{
      width:36, height:36, border:"3px solid var(--border)",
      borderTopColor:"var(--brand)", borderRadius:"50%",
      animation:"spin .7s linear infinite",
    }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ fontSize:13, color:"var(--muted)" }}>Loading...</span>
  </div>
);

function App() {
  const [ready, setReady] = useState(false);

  // Validate session before rendering anything
  useEffect(() => {
    checkSession(); // side-effect: clears stale data if needed
    setReady(true);
  }, []);

  if (!ready) return <Loader />;

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Public><Login /></Public>} />
          <Route path="/" element={<Protected><MainLayout /></Protected>}>
            <Route index            element={<Dashboard />} />
            <Route path="products"  element={<Products />} />
            <Route path="orders"    element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users"     element={<Users />} />
            <Route path="settings"  element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
