import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, connect } from "react-redux";
import { FaTachometerAlt, FaUsers, FaBook, FaStore, FaSignOutAlt } from 'react-icons/fa';

function AdminSidebar({ logout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user) || {};

  const links = [
    { label: "Dashboard", key: "dashboard", to: "/admin-dashboard", icon: <FaTachometerAlt /> },
    { label: "Users", key: "users-management", to: "/admin-users", icon: <FaUsers /> },
    { label: "Bookings", key: "bookings-management", to: "/admin-bookings", icon: <FaBook /> },
    { label: "Shops", key: "shops-management", to: "/admin-shops", icon: <FaStore /> },
  ];

  const sidebarStyle = {
    width: 280,
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: '#e2e8f0'
  };

  const brandStyle = {
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: '1px solid #334155'
  };

  const brandNameStyle = {
    fontWeight: 700,
    fontSize: 24,
    color: "#fff",
    letterSpacing: 0.5
  };

  const userProfileStyle = {
    padding: "24px",
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: 16
  };
  
  const avatarStyle = {
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 18,
      color: "#fff",
      overflow: "hidden"
  };

  const userNameStyle = {
      fontWeight: 600,
      fontSize: 16,
      color: "#fff",
  };
  
  const userRoleStyle = {
      color: "#94a3b8",
      fontWeight: 500,
      fontSize: 14,
      textTransform: 'capitalize'
  };

  const navStyle = {
    flex: 1,
    padding: "16px"
  };

  const navListStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8
  };
  
  const getLinkButtonStyle = (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      width: "100%",
      textAlign: 'left',
      background: isActive ? "rgba(59, 130, 246, 0.2)" : "transparent",
      color: isActive ? "#fff" : "#cbd5e0",
      fontWeight: isActive ? 600 : 500,
      border: "none",
      borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
      borderRadius: 8,
      padding: "12px 16px",
      fontSize: 16,
      cursor: "pointer",
      transition: "all 0.2s ease"
  });

  const logoutButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      width: "100%",
      textAlign: 'left',
      background: 'transparent',
      color: "#fda4af",
      fontWeight: 500,
      border: "none",
      borderRadius: 8,
      padding: "12px 16px",
      fontSize: 16,
      cursor: "pointer",
      transition: "all 0.2s ease"
  };

  return (
    <aside style={sidebarStyle}>
      {/* Logo and Brand */}
      <div style={brandStyle}>
        <div className="lp-navbar-logo">
          <svg className="lp-logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 12h3v8h5v-5h4v5h5v-8h3L12 2z" fill="#3b82f6"/>
          </svg>
        </div>
        <span style={brandNameStyle}>StayEase</span>
      </div>

      {/* User Profile */}
      <div style={userProfileStyle}>
        <div style={avatarStyle}>
            {user.image ? (
              <img src={user.image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span>{user.name ? user.name[0].toUpperCase() : "A"}</span>
            )}
        </div>
        <div>
            <div style={userNameStyle}>{user.name || "Admin"}</div>
            <div style={userRoleStyle}>{user.role || "admin"}</div>
        </div>
      </div>
      
      {/* Sidebar Links */}
      <nav style={navStyle}>
        <ul style={navListStyle}>
          {links.map(link => {
            const isActive = location.pathname === link.to;
            const style = getLinkButtonStyle(isActive);
            return (
              <li key={link.key}>
                <button
                  onClick={() => navigate(link.to)}
                  style={style}
                  onMouseOver={e => {
                      if (!isActive) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.color = "#fff";
                      }
                  }}
                  onMouseOut={e => {
                      if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#cbd5e0";
                      }
                  }}
                >
                  <span style={{ fontSize: 18, width: 20, textAlign: 'center' }}>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              </li>
            )
          })}
          <li>
            <button
              style={logoutButtonStyle}
              onClick={logout}
              onMouseOver={e => {
                e.currentTarget.style.background = "rgba(252, 165, 165, 0.1)";
                e.currentTarget.style.color = "#fca5a5";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#fda4af";
              }}
            >
              <span style={{ fontSize: 18, width: 20, textAlign: 'center' }}><FaSignOutAlt /></span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

const mapDispatch = (dispatch) => ({
  logout: () => dispatch.auth.logout(),
});

export default connect(null, mapDispatch)(AdminSidebar); 