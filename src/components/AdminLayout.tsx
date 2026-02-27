import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// 🔑 Theme Logic: Helper function to get initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  }
  return 'light';
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // 🔑 Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // Detect window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔑 Theme Side Effect: Apply theme to body and localStorage
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleOverlayClick = () => {
    setShowProfileMenu(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔑 Theme toggle handler
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    // setShowProfileMenu(false); // Do not close the profile menu if the toggle button is inside
  };

return (
<>
      <div className="admin-layout">
        {/* 🔹 Navbar */}
        <nav className={`admin-navbar navbar navbar-expand-lg navbar-light ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`} style={{
          position: 'fixed',
          top: 0,
          zIndex: 1060,
          backgroundColor: '#ffffff',
        }}>
          <div className="container-fluid d-flex align-items-center">
            <button
              className="btn btn-link text-dark border-0 me-3 d-lg-none"
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
              style={{
                fontSize: '1.2rem',
                padding: '0.5rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // marginTop: '80px',
              }}
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="flex-grow-1 text-center">
              <h5 className="mb-0 fw-bold d-md-none">Admin Dashboard</h5>
            </div>

            {/* RIGHT – Theme + Profile */}
            <div className="d-flex align-items-center gap-3 ms-auto">

              {/* Theme Toggle */}
              <button
                className="btn btn-link border-0"
                onClick={toggleTheme}
                style={{display:"none"}}
              >
                {theme === 'light' ? <FaMoon /> : <FaSun className="text-warning" />}
              </button>

              {/* Profile Icon */}
              <div className="d-flex align-items-center position-relative profile-menu-container">
              <button
                className="btn btn-link text-dark border-0 d-flex align-items-center gap-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  textDecoration: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaUserCircle size={24} />
                <span className="d-none d-md-inline fw-semibold">Admin</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="position-absolute bg-white shadow-lg rounded-3 border-0"
                  style={{
                    top: '100%',
                    right: 0,
                    minWidth: '200px',
                    zIndex: 1050,
                    marginTop: '8px'
                  }}
                >
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <FaUserCircle size={32} className="text-primary" />
                      <div>
                        <div className="fw-semibold text-dark">Administrator</div>
                        <small className="text-muted">admin@restom.com</small>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {/* The Theme Toggle button has been moved to the Navbar header above, but keeping a profile setting link is optional */}
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-dark">
                      <FaUserCircle size={16} />
                      <span>Profile Settings</span>
                    </button>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-dark">
                      <FaBars size={16} />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-top">
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger">
                      <FaSignOutAlt size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </nav>

        {/* 🔹 Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} collapsed={collapsed} isMobile={isMobile} onToggle={() => setCollapsed(!collapsed)} onClose={() => setIsSidebarOpen(false)} />

        {/* 🔹 Overlay for Mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 🔹 Main Content */}
        <main
          className={`admin-main ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          style={{ backgroundColor: '#f8f9fa', color: '#212529', minHeight: '100vh' }}
        >
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;