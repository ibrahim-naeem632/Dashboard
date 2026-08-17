import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AiOutlineHome, AiOutlineAppstore, AiOutlineShoppingCart,
  AiOutlineUser, AiOutlineBarChart, AiOutlineSetting,
  AiOutlineLogout, AiOutlineMenuFold, AiOutlineMenuUnfold,
  AiOutlineTeam,
} from "react-icons/ai";
import "../styles/sidebar.css";
import ConfirmModal from "./ConfirmModal";

const NAV = [
  { section:"Main",
    items:[{ label:"Dashboard", path:"/", end:true, icon:<AiOutlineHome /> }] },
  { section:"Store",
    items:[
      { label:"Products",  path:"/products",  icon:<AiOutlineAppstore /> },
      { label:"Orders",    path:"/orders",    icon:<AiOutlineShoppingCart /> },
      { label:"Customers", path:"/customers", icon:<AiOutlineUser /> },
    ]},
  { section:"Insights",
    items:[{ label:"Analytics", path:"/analytics", icon:<AiOutlineBarChart /> }] },
  { section:"Admin",
    items:[
      { label:"Users",    path:"/users",    icon:<AiOutlineTeam /> },
      { label:"Settings", path:"/settings", icon:<AiOutlineSetting /> },
    ]},
];

interface Props {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<Props> = ({ mobileOpen = false, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const stored  = JSON.parse(localStorage.getItem("user") || "{}");
  const name    = stored.name  || "Ibrahim Naeem";
  const role    = stored.role  || "admin";

  const doLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

        {/* BRAND */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">D</div>
            {!collapsed && (
              <div>
                <div className="sidebar-brand-name">Dashboard Pro</div>
                <div className="sidebar-brand-sub">Admin Panel</div>
              </div>
            )}
          </div>
          <button
            className="collapse-btn"
            onClick={() => { setCollapsed(c => !c); onClose?.(); }}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          {NAV.map((section, si) => (
            <div className="nav-section" key={si}>
              <span className="nav-section-heading">{section.section}</span>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={"end" in item ? item.end : false}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  title={collapsed ? item.label : undefined}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
              {si < NAV.length - 1 && <div className="nav-divider" />}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{name.charAt(0)}</div>
            {!collapsed && (
              <div className="user-meta">
                <div className="user-name">{name}</div>
                <span className="user-role">{role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={() => setShowModal(true)} title="Logout">
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
        onConfirm={doLogout}
      />
    </>
  );
};

export default Sidebar;
