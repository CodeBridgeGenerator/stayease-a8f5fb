import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import client from "../../../services/restClient";
import { connect } from "react-redux";
import { 
  FaHome, 
  FaWrench, 
  FaCalendarAlt, 
  FaUsers, 
  FaStar, 
  FaSignOutAlt,
  FaEdit,
  FaBuilding
} from 'react-icons/fa';

const sidebarStyle = {
  width: 280,
  background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "4px 0 20px rgba(0, 0, 0, 0.08)",
  position: "relative",
  overflow: "hidden",
  zIndex: 10
};
const logoBoxStyle = {
  width: 48,
  height: 48,
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.18)"
};
const brandStyle = {
  fontWeight: 800,
  fontSize: 25,
  color: "#fff",
  letterSpacing: -0.5
};
const subtitleStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
  fontWeight: 500
};
const profileCardStyle = {
  background: "rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 24,
  margin: "0 0 0 0",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 2px 8px rgba(30,41,59,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 18
};
const avatarStyle = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 22,
  color: "#fff",
  boxShadow: "0 4px 12px rgba(59,130,246,0.18)",
  border: "3px solid rgba(255,255,255,0.18)"
};
const navButtonBase = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 500,
  border: "1px solid transparent",
  borderRadius: 14,
  padding: "15px 22px",
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 2,
  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
  backdropFilter: "blur(10px)"
};
const navButtonActive = {
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#fff",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 12px rgba(59,130,246,0.18)"
};
const logoutButtonStyle = {
  width: "100%",
  background: "rgba(239,68,68,0.12)",
  color: "#ef4444",
  fontWeight: 700,
  border: "1px solid rgba(239,68,68,0.18)",
  borderRadius: 14,
  padding: "16px 20px",
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
  backdropFilter: "blur(10px)"
};

function ProviderSidebar({ activePage = "dashboard", logout }) {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user) || {};
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    async function fetchProvider() {
      if (!user._id) return;
      try {
        const res = await client.service("providers").find({ query: { providerId: user._id } });
        if (res.data && res.data.length > 0) {
          setProvider(res.data[0]);
        }
      } catch (e) {
        setProvider(null);
      }
    }
    fetchProvider();
  }, [user._id]);

  const links = [
    { label: "Dashboard", key: "dashboard", to: "/provider-dashboard", icon: <FaHome size={18} /> },
    { label: "My Services", key: "services", to: "/provider-services", icon: <FaWrench size={18} /> },
    { label: "Booking Logs", key: "bookings", to: "/provider-bookings", icon: <FaCalendarAlt size={18} /> },
    { label: "Staff Management", key: "staff", to: "/provider-staff", icon: <FaUsers size={18} /> },
    { label: "Reviews", key: "reviews", to: "/provider-reviews", icon: <FaStar size={18} /> },
  ];

  return (
    <aside style={sidebarStyle}>
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.13) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.13) 0%, transparent 50%)",
        pointerEvents: "none"
      }} />
      {/* Logo and Brand */}
      <div style={{ padding: "36px 24px 20px 24px", display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
        <div style={logoBoxStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 12h3v8h5v-5h4v5h5v-8h3L12 2z" fill="#ffffff"/>
          </svg>
        </div>
        <div>
          <div style={brandStyle}>StayEase</div>
          <div style={subtitleStyle}>Provider Portal</div>
        </div>
      </div>
      {/* User Profile */}
      <div style={{ padding: "0 24px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.10)", position: "relative", zIndex: 1 }}>
        <div style={profileCardStyle}>
          <div style={avatarStyle}>
            {provider && provider.imageUrl ? (
              <img src={provider.imageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              <span>{user.name ? user.name[0].toUpperCase() : "?"}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 2, letterSpacing: 0.2 }}>{provider && provider.name ? provider.name : user.name}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <FaBuilding size={12} />
              {provider && provider.businessName ? provider.businessName : "Service Provider"}
            </div>
            <button 
              onClick={() => navigate("/provider-profile-edit")} 
              style={{ 
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: 8,
                marginTop: 10,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaEdit size={12} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar Links */}
      <nav style={{ flex: 1, padding: "28px 16px 28px 16px", position: "relative", zIndex: 1, overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {links.map(link => (
            <li key={link.key}>
              <button
                onClick={() => navigate(link.to)}
                style={{
                  ...navButtonBase,
                  ...(activePage === link.key ? navButtonActive : {}),
                }}
                onMouseOver={e => {
                  if (activePage !== link.key) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseOut={e => {
                  if (activePage !== link.key) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={{ opacity: activePage === link.key ? 1 : 0.7, transition: "opacity 0.2s" }}>{link.icon}</span>
                {link.label}
              </button>
            </li>
          ))}
          {/* Logout button directly after Reviews */}
          <li>
            <button
              style={{
                ...logoutButtonStyle,
                marginTop: 8
              }}
              onClick={logout}
              onMouseOver={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.22)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.13)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FaSignOutAlt size={16} />
              Logout
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

export default connect(null, mapDispatch)(ProviderSidebar); 