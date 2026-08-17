import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineBell, AiOutlineDown, AiOutlineClose,
  AiOutlineUser, AiOutlineSetting, AiOutlineLogout, AiOutlineMenu,
} from "react-icons/ai";
import { useAuth, PERMISSIONS } from "../hooks/useAuth";
import "../styles/header.css";

interface Notif { id:string; text:string; time:string; read:boolean; icon:string; }

const PAGE_META: Record<string, { title:string; subtitle:string }> = {
  "/":           { title:"Dashboard",  subtitle:"Overview of your store" },
  "/products":   { title:"Products",   subtitle:"Manage your inventory" },
  "/orders":     { title:"Orders",     subtitle:"Track all orders" },
  "/customers":  { title:"Customers",  subtitle:"View customer data" },
  "/analytics":  { title:"Analytics",  subtitle:"Sales & performance insights" },
  "/users":      { title:"Users",      subtitle:"Manage team access & roles" },
  "/settings":   { title:"Settings",   subtitle:"Configure your preferences" },
};

const MOCK_NOTIFS: Notif[] = [
  { id:"1", text:"New order #1042 received — $240.00", time:"2 min ago", read:false, icon:"📦" },
  { id:"2", text:"AirPods Pro stock is running low",   time:"1 hr ago",  read:false, icon:"⚠️" },
  { id:"3", text:"Customer Ali Khan left a review",    time:"3 hr ago",  read:true,  icon:"⭐" },
];

const Header: React.FC<{ onToggleMobileSidebar?: () => void }> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const auth      = useAuth();
  const canSettings = PERMISSIONS.canAccessSettings(auth.role);

  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchValue,   setSearchValue]   = useState("");
  const [userDropOpen,  setUserDropOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifs,        setNotifs]        = useState(MOCK_NOTIFS);

  const userRef       = useRef<HTMLDivElement>(null);
  const notifRef      = useRef<HTMLDivElement>(null);
  const searchRef     = useRef<HTMLInputElement>(null);

  const meta   = PAGE_META[location.pathname] || { title:"Dashboard", subtitle:"" };
  const unread = notifs.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // SECURE logout — clears BOTH token and user
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const allPages = [
    { icon:"📊", label:"Dashboard",  path:"/" },
    { icon:"📦", label:"Products",   path:"/products" },
    { icon:"🛒", label:"Orders",     path:"/orders" },
    { icon:"👥", label:"Customers",  path:"/customers" },
    { icon:"📈", label:"Analytics",  path:"/analytics" },
    { icon:"👤", label:"Users",      path:"/users" },
    ...(canSettings ? [{ icon:"⚙️", label:"Settings", path:"/settings" }] : []),
  ];

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="header-hamburger" onClick={onToggleMobileSidebar}>
            <AiOutlineMenu />
          </button>
          <div>
            <h1 className="header-title">{meta.title}</h1>
            <p className="header-subtitle">{meta.subtitle}</p>
          </div>
        </div>

        <div className="header-right">
          {/* SEARCH */}
          <button className="header-search-btn" onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="header-search-placeholder">Search anything...</span>
            <kbd className="header-search-kbd">Ctrl K</kbd>
          </button>

          {/* BELL */}
          <div className="header-notif-wrapper" ref={notifRef}>
            <button className="header-icon-btn" onClick={() => { setNotifOpen(p => !p); setUserDropOpen(false); }}>
              <AiOutlineBell />
              {unread > 0 && <span className="header-badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="header-dropdown header-notif-dropdown">
                <div className="header-dropdown-head">
                  <h4>Notifications</h4>
                  {unread > 0 && (
                    <button className="header-mark-read" onClick={() => setNotifs(p => p.map(n => ({...n, read:true})))}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="header-notif-list">
                  {notifs.map(n => (
                    <div key={n.id} className={`header-notif-item ${!n.read ? "unread" : ""}`}
                      onClick={() => setNotifs(p => p.map(x => x.id===n.id ? {...x, read:true} : x))}>
                      <span className="notif-icon">{n.icon}</span>
                      <div>
                        <p className="header-notif-text">{n.text}</p>
                        <span className="header-notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* USER */}
          <div className="header-user-wrapper" ref={userRef}>
            <button className="header-user-btn" onClick={() => { setUserDropOpen(p => !p); setNotifOpen(false); }}>
              <div className="header-user-avatar"><span>{auth.name.charAt(0) || "A"}</span></div>
              <div className="header-user-info">
                <span className="header-user-name">{auth.name || "Ibrahim Naeem"}</span>
                <span className="header-user-role">{auth.role || "admin"}</span>
              </div>
              <AiOutlineDown className={`header-user-arrow ${userDropOpen ? "rotated" : ""}`} />
            </button>
            {userDropOpen && (
              <div className="header-dropdown header-user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-drop-avatar">{auth.name.charAt(0) || "A"}</div>
                  <div>
                    <div className="user-drop-name">{auth.name}</div>
                    <div className="user-drop-email">{auth.email}</div>
                  </div>
                </div>
                <div className="header-dropdown-divider" />
                <div className="header-dropdown-item" onClick={() => { navigate("/users"); setUserDropOpen(false); }}>
                  <AiOutlineUser /><span>Profile</span>
                </div>
                {canSettings && (
                  <div className="header-dropdown-item" onClick={() => { navigate("/settings"); setUserDropOpen(false); }}>
                    <AiOutlineSetting /><span>Settings</span>
                  </div>
                )}
                <div className="header-dropdown-divider" />
                <div className="header-dropdown-item danger" onClick={handleLogout}>
                  <AiOutlineLogout /><span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-modal-icon">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                className="search-modal-input"
                placeholder="Search pages, products, orders..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button className="search-modal-clear" onClick={() => setSearchValue("")}>
                  <AiOutlineClose />
                </button>
              )}
              <kbd className="search-modal-esc" onClick={() => setSearchOpen(false)}>ESC</kbd>
            </div>
            <div className="search-suggestions">
              {allPages
                .filter(s => !searchValue || s.label.toLowerCase().includes(searchValue.toLowerCase()))
                .map(s => (
                  <div key={s.path} className="search-suggestion-item"
                    onClick={() => { navigate(s.path); setSearchOpen(false); setSearchValue(""); }}>
                    <span className="search-sug-icon">{s.icon}</span>
                    <span className="search-sug-label">{s.label}</span>
                    <span className="search-sug-type">Page</span>
                  </div>
                ))}
            </div>
            <div className="search-modal-footer">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>ESC</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
