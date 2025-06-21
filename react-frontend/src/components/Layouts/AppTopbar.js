import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import "./AppTopbar.css";
import client from "../../services/restClient";

const AppTopbar = (props) => {
  const location = useLocation();
  const user = props.user;
  if ((user && user.role === 'admin') || location.pathname === '/admin-dashboard') return null;
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch favorites count
  useEffect(() => {
    if (props.isLoggedIn && props.user?._id) {
      client.service('favorites').find({
        query: {
          userId: props.user._id,
          $limit: 0
        }
      })
      .then(res => {
        setFavoritesCount(res.total || 0);
      })
      .catch(err => {
        console.error('Failed to fetch favorites count:', err);
      });
    }
  }, [props.isLoggedIn, props.user?._id]);

  // Navigation handlers
  const handleNav = (path) => {
    navigate(path);
  };
  const handleAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  };

  return (
    <nav className="lp-navbar">
      <div className="lp-navbar-inner">
        <div className="lp-navbar-logo">
          <svg className="lp-logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 12h3v8h5v-5h4v5h5v-8h3L12 2z" fill="#0ea5e9"/>
          </svg>
          <span className="lp-logo-text">StayEase</span>
        </div>
        <ul className="lp-navbar-links lp-navbar-links-center">
          <li><button className="lp-navbar-link-btn" onClick={() => handleNav("/")}>Home</button></li>
          <li><button className="lp-navbar-link-btn" onClick={() => handleAnchor("services")}>Services</button></li>
          <li><button className="lp-navbar-link-btn" onClick={() => handleAnchor("how-it-works")}>How It Works</button></li>
          <li><button className="lp-navbar-link-btn" onClick={() => handleAnchor("testimonials")}>Testimonials</button></li>
          <li><button className="lp-navbar-link-btn" onClick={() => handleAnchor("contact")}>Contact</button></li>
        </ul>
        <ul className="lp-navbar-links lp-navbar-links-right">
          {props.isLoggedIn ? (
            <li ref={dropdownRef} style={{ position: "relative" }}>
              <div
                className="lp-profile-circle"
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: 'center', overflow: 'hidden', background: '--light-blue' }}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {getInitials(user && user.name)}
              </div>
              {dropdownOpen && (
                <div className="lp-profile-dropdown">
                  <div className="lp-profile-dropdown-header">
                    <div className="lp-profile-dropdown-signed">Signed in as</div>
                    <div className="lp-profile-dropdown-email">{user && user.email ? user.email : "user@email.com"}</div>
                  </div>
                  <div className="lp-profile-dropdown-list">
                    
                    <div
                      className="lp-profile-dropdown-item"
                      onClick={() => { setDropdownOpen(false); navigate("/bookings"); }}
                    >
                      <span><svg width="20" height="20" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" fill="#374151"/></svg></span>
                      My Bookings
                    </div>
                  
                    <div
                      className="lp-profile-dropdown-item"
                      onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                    >
                      <span><svg width="20" height="20" viewBox="0 0 24 24"><path d="M19.14,12.94a1.43,1.43,0,0,0,0-1.88l2-1.55a.5.5,0,0,0,.12-.66l-2-3.46a.5.5,0,0,0-.61-.22l-2.35,1a5.37,5.37,0,0,0-1.6-.93l-.36-2.49A.5.5,0,0,0,13,2H11a.5.5,0,0,0-.5.42l-.36,2.49a5.37,5.37,0,0,0-1.6.93l-2.35-1a.5.5,0,0,0-.61.22l-2,3.46a.5.5,0,0,0,.12.66l2,1.55a1.43,1.43,0,0,0,0,1.88l-2,1.55a.5.5,0,0,0-.12.66l2,3.46a.5.5,0,0,0,.61.22l2.35-1a5.37,5.37,0,0,0,1.6.93l.36,2.49A.5.5,0,0,0,11,22h2a.5.5,0,0,0,.5-.42l.36-2.49a5.37,5.37,0,0,0,1.6-.93l2.35,1a.5.5,0,0,0,.61-.22l2-3.46a.5.5,0,0,0-.12-.66ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" fill="#374151"/></svg></span>
                      Settings
                    </div>
                    <div className="lp-profile-dropdown-divider" style={{ borderTop: '1px solid #eee', margin: '8px 0' }}></div>
                    <div
                      className="lp-profile-dropdown-item logout"
                      style={{ color: '#d32f2f', fontWeight: 600 }}
                      onClick={() => { setDropdownOpen(false); props.logout(); }}
                    >
                      <span><svg width="20" height="20" viewBox="0 0 24 24"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#d32f2f"/></svg></span>
                      Logout
                    </div>
                  </div>
                </div>
              )}
            </li>
          ) : (
            <li>
              <button
                className="lp-btn lp-btn-signin"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

const mapState = (state) => {
  const { isLoggedIn, user } = state.auth;
  return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
  logout: () => dispatch.auth.logout(),
});

export default connect(mapState, mapDispatch)(AppTopbar);