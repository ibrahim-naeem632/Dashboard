import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineAppstore,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
} from "react-icons/ai";
import img from "../assets/logo.png";
import "../styles/sidebar.css";
import ConfirmModal from "./ConfirmModal";
// ─── TYPES ───
interface UserInfo {
  name: string;
  role: string;
  avatar?: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuSection {
  heading: string;
  items: MenuItem[];
}

// ─── MENU ───
const menuSections: MenuSection[] = [
  {
    heading: "Main",
    items: [{ label: "Dashboard", path: "/", icon: <AiOutlineHome /> }],
  },
  {
    heading: "Management",
    items: [
      { label: "Products", path: "/products", icon: <AiOutlineAppstore /> },
      { label: "Orders", path: "/orders", icon: <AiOutlineShoppingCart /> },
      { label: "Customers", path: "/customers", icon: <AiOutlineUser /> },
    ],
  },
  {
    heading: "Insights",
    items: [
      { label: "Analytics", path: "/analytics", icon: <AiOutlineBarChart /> },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Settings", path: "/settings", icon: <AiOutlineSetting /> },
    ],
  },
];

// ─── MOCK USER ───
const currentUser: UserInfo = {
  name: "Coder Creative",
  role: "Admin",
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // 🔥 IMPORTANT: navigation hook
  const navigate = useNavigate();

  // 🔥 FULL WORKING LOGOUT
  const handleConfirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* ── TOP ── */}
      <div className="sidebar-top">
        <img src={img} alt="Logo" className="logo" />

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
        </button>
      </div>

      {/* ── NAV ── */}
      <nav className="sidebar-nav">
        {menuSections.map((section) => (
          <div className="menu-section" key={section.heading}>
            {!collapsed && (
              <span className="section-heading">{section.heading}</span>
            )}

            <ul className="menu">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `menu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="menu-label">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── BOTTOM ── */}
      <div className="sidebar-bottom">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <span>{currentUser.name.charAt(0)}</span>
            )}
          </div>

          {!collapsed && (
            <div className="user-details">
              <p className="user-name">{currentUser.name}</p>
              <p className="user-role">{currentUser.role}</p>
            </div>
          )}
        </div>

        {/* 🔥 LOGOUT BUTTON */}
        <button className="logout-btn" onClick={() => setShowModal(true)}>
            <AiOutlineLogout />
            {!collapsed && <span>Logout</span>}
          </button>
      </div>
      
    </aside>
      <ConfirmModal
        isOpen={showModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;