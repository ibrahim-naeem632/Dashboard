import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header  from "../components/Header";
import "../styles/mainlayout.css";

const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change
  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileSidebarOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="layout">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          ref={overlayRef}
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="layout-right">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(p => !p)} />
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
