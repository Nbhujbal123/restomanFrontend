import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUtensils,
  FaChartLine,
  FaFileAlt,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";
import "./AdminSidebar.css";

interface AdminSidebarProps {
  isOpen: boolean;
  collapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, collapsed, isMobile, onToggle, onClose }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    window.location.href = "/admin";
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
    { path: "/admin/menu", icon: <FaUtensils />, text: "Menu Management" },
    { path: "/admin/analytics", icon: <FaChartLine />, text: "Sales Analytics" },
    { path: "/admin/reports", icon: <FaFileAlt />, text: "Reports" },
    { path: "/admin/billing", icon: <FaCreditCard />, text: "Billing & Payments" },
    { path: "/", icon: <FaUtensils />, text: "Customer Menu" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`} style={{top:'0px' , height: '100vh'}}>
        {/* Header */}
        <div className="sidebar-header">
          <button
            className={`sidebar-toggle-btn ${isMobile ? 'd-none' : ''}`}
            onClick={onToggle}
          >
            <FaBars />
          </button>

          <div className={`sidebar-brand ${collapsed ? 'hidden' : ''}`}>
            <span className="brand-icon">🍽️</span>
            <span className="brand-text">Admin</span>
          </div>
        </div>

        {/* Menu */}
        <ul className="sidebar-menu list-unstyled mt-3 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleLinkClick}
                className={`sidebar-link d-flex align-items-center ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="sidebar-icon">
                  {item.icon}
                </span>
                <span className="sidebar-text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="sidebar-footer mt-auto p-3 border-top">
          <button
            onClick={handleLogout}
            className="logout-btn w-100 fw-semibold d-flex align-items-center justify-content-center"
          >
            <FaSignOutAlt className={collapsed ? "" : "me-2"} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;