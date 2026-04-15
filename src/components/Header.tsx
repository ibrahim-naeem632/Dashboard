import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineBell,
  AiOutlineSearch,
  AiOutlineDown,
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineMenu,
} from "react-icons/ai";
import "../styles/header.css";

// ─── TYPES (backend-ready) ───
interface PageMeta {
  title: string;
  subtitle: string;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

interface UserInfo {
  name: string;
  role: string;
  avatar?: string;
}

// ─── PAGE META CONFIG ───
const pageMeta: Record<string, PageMeta> = {
  "/": { title: "Dashboard", subtitle: "Overview of your store" },
  "/products": { title: "Products", subtitle: "Manage your inventory" },
  "/orders": { title: "Orders", subtitle: "Track all orders" },
  "/customers": { title: "Customers", subtitle: "View customer data" },
  "/analytics": { title: "Analytics", subtitle: "Sales & performance" },
  "/settings": { title: "Settings", subtitle: "Manage preferences" },
};

// ─── MOCK DATA (replace with API later) ───
const mockNotifications: Notification[] = [
  { id: "1", text: "New order #1042 received", time: "2 min ago", read: false },
  { id: "2", text: "Product stock running low", time: "1 hr ago", read: false },
  { id: "3", text: "Customer left a review", time: "3 hr ago", read: true },
];

const currentUser: UserInfo = {
  name: "Ali Hassan",
  role: "Admin",
};

// ─── PROPS ───
interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const { title, subtitle } = pageMeta[location.pathname] || {
    title: "Dashboard",
    subtitle: "",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── CLOSE DROPDOWNS ON OUTSIDE CLICK ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── HANDLERS ───
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // TODO: call backend search API or filter locally
      console.log("Searching for:", searchValue);
    }
  };

  const handleLogout = () => {
    // TODO: call backend logout API, clear tokens
    console.log("Logout clicked");
    setUserDropdownOpen(false);
  };

  return (
    <header className="header">
      {/* ── LEFT SIDE ── */}
      <div className="header-left">
        {/* Mobile hamburger */}
        <button
          className="header-hamburger"
          onClick={onToggleMobileSidebar}
          title="Toggle sidebar"
        >
          <AiOutlineMenu />
        </button>

        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="header-right">
        {/* SEARCH */}
        <form className="header-search" onSubmit={handleSearch}>
          <AiOutlineSearch className="header-search-icon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="header-search-input"
          />
          {searchValue && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => setSearchValue("")}
            >
              <AiOutlineClose />
            </button>
          )}
        </form>

        {/* NOTIFICATIONS */}
        <div className="header-notif-wrapper" ref={notifDropdownRef}>
          <button
            className="header-icon-btn"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setUserDropdownOpen(false);
            }}
            title="Notifications"
          >
            <AiOutlineBell />
            {unreadCount > 0 && (
              <span className="header-badge">{unreadCount}</span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="header-dropdown header-notif-dropdown">
              <div className="header-dropdown-head">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    className="header-mark-read"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="header-notif-list">
                {notifications.length === 0 ? (
                  <p className="header-notif-empty">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`header-notif-item ${
                        !notif.read ? "unread" : ""
                      }`}
                    >
                      <p className="header-notif-text">{notif.text}</p>
                      <span className="header-notif-time">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER */}
        <div className="header-user-wrapper" ref={userDropdownRef}>
          <button
            className="header-user-btn"
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotifDropdownOpen(false);
            }}
          >
            <div className="header-user-avatar">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <span>{currentUser.name.charAt(0)}</span>
              )}
            </div>

            <div className="header-user-info">
              <span className="header-user-name">{currentUser.name}</span>
              <span className="header-user-role">{currentUser.role}</span>
            </div>

            <AiOutlineDown
              className={`header-user-arrow ${
                userDropdownOpen ? "rotated" : ""
              }`}
            />
          </button>

          {userDropdownOpen && (
            <div className="header-dropdown header-user-dropdown">
              <div
                className="header-dropdown-item"
                onClick={() => {
                  navigate("/settings");
                  setUserDropdownOpen(false);
                }}
              >
                <AiOutlineUser />
                <span>Profile</span>
              </div>

              <div
                className="header-dropdown-item"
                onClick={() => {
                  navigate("/settings");
                  setUserDropdownOpen(false);
                }}
              >
                <AiOutlineSetting />
                <span>Settings</span>
              </div>

              <div className="header-dropdown-divider" />

              <div
                className="header-dropdown-item danger"
                onClick={handleLogout}
              >
                <AiOutlineLogout />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;