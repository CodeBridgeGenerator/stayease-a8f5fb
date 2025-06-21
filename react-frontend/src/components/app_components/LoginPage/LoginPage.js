import React, { useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./LoginPage.css";
import client from "../../../services/restClient";
import { codeGen } from "../../../utils/codegen";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = (props) => {
  const [activeTab, setActiveTab] = useState("login");
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupShowConfirm, setSignupShowConfirm] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromBookNow = searchParams.get('fromBookNow');
  const fromServiceId = searchParams.get('fromServiceId');

  // Login validation and backend integration
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    // Validation
    if (!emailRegex.test(loginEmail)) {
      setLoginError("Please enter a valid email address.");
      setLoginLoading(false);
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError("Please enter a valid password. Must be at least 6 characters.");
      setLoginLoading(false);
      return;
    }
    // Redux login action
    try {
      await props.login({ email: loginEmail, password: loginPassword })
        .then(async (res) => {
          try {
            // Save login history
            await client.service('loginHistory').create({
              userId: res.user._id,
            });
          } catch (historyError) {
            console.error('Failed to save login history:', historyError);
          }
          // --- Custom redirect logic for Book Now using query params ---
          if (fromBookNow === '1' && fromServiceId) {
            navigate(`/services/${fromServiceId}?bookNow=1`, { replace: true });
            return;
          }
          // --- End custom logic ---
          if (res.user && res.user.role === 'admin') {
            navigate("/admin-dashboard");
          } else if (res.user && res.user.role === 'provider') {
            navigate("/provider-dashboard");
          } else {
            navigate("/project");
          }
        })
        .catch((error) => {
          setLoginError("Invalid login. Please check your credentials.");
          if (props.alert) {
            props.alert({
              title: "User Login failed.",
              type: "error",
              message: "Invalid Login"
            });
          }
        });
    } catch (err) {
      setLoginError("Login failed. Please try again.");
    }
    setLoginLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    setSignupLoading(true);

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) {
      setSignupError("Please fill in all fields.");
      setSignupLoading(false);
      return;
    }

    if (!emailRegex.test(signupEmail)) {
      setSignupError("Please enter a valid email address.");
      setSignupLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      setSignupLoading(false);
      return;
    }

    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      setSignupLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await client.service('users').find({
        query: { email: signupEmail.toLowerCase() }
      });

      if (existingUser.total > 0) {
        setSignupError("This email is already registered.");
        setSignupLoading(false);
        return;
      }

      // Create the user
      await props.createUser({ 
        name: signupName.trim(), 
        email: signupEmail.toLowerCase().trim(), 
        password: signupPassword,
        status: true
      });
      
      setSignupSuccess("Account created successfully! Please log in.");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");
      
      // Switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab("login");
        setLoginEmail(signupEmail); // Pre-fill the email in login form
      }, 2000);
      
    } catch (error) {
      const errorMessage = error?.message || "Sign up failed. Please try again.";
      setSignupError(errorMessage);
      if (props.alert) {
        props.alert({
          title: "Sign Up Failed",
          type: "error",
          message: errorMessage
        });
      }
    }
    setSignupLoading(false);
  };

  return (
    <div className="loginpage-root">
      <div className="loginpage-container">
        {/* Left Panel */}
        <div className="loginpage-left">
          <div className="loginpage-icon-bg">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#fff" fillOpacity="0.08"/>
              <path d="M32 12L16 28h4v20h8V40h8v8h8V28h4L32 12z" fill="#fff"/>
            </svg>
          </div>
          <h2 className="loginpage-title">Welcome to StayEase</h2>
          <p className="loginpage-desc">
            The easiest way to manage your homestay services in Malaysia. Connect with trusted service providers instantly.
          </p>
          <div className="loginpage-features">
            <div><span className="loginpage-check">✔</span> Trusted Providers</div>
            <div><span className="loginpage-check">✔</span> Easy Booking</div>
            <div><span className="loginpage-check">✔</span> WhatsApp Integration</div>
            <div><span className="loginpage-check">✔</span> 24/7 Support</div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="loginpage-right">
          <div className="loginpage-tabs">
            <div
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Login
            </div>
            <div
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </div>
          </div>
          {activeTab === "login" && (
            <form className="loginpage-form" onSubmit={handleLogin}>
              <h3 className="loginpage-form-title">Login to your account</h3>
              {loginError && <div className="loginpage-error">{loginError}</div>}
              <label className="loginpage-label">Email</label>
              <input
                className="loginpage-input"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
              <label className="loginpage-label">Password</label>
              <div className="loginpage-password-wrap">
                <input
                  className="loginpage-input"
                  type={loginShowPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                <span
                  className="loginpage-password-toggle"
                  onClick={() => setLoginShowPassword(v => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={loginShowPassword ? "Hide password" : "Show password"}
                >
                  {loginShowPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <div className="loginpage-form-row">
                <label className="loginpage-remember">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="loginpage-forgot">Forgot password?</a>
              </div>
              <button className="loginpage-btn" type="submit" disabled={loginLoading}>{loginLoading ? "Logging in..." : "Login"}</button>
            </form>
          )}
          {activeTab === "signup" && (
            <form className="loginpage-form" onSubmit={handleSignup}>
              <h3 className="loginpage-form-title">Create your account</h3>
              {signupError && <div className="loginpage-error">{signupError}</div>}
              {signupSuccess && <div className="loginpage-success">{signupSuccess}</div>}
              <label className="loginpage-label">Name</label>
              <input
                className="loginpage-input"
                type="text"
                placeholder="Enter your name"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
              />
              <label className="loginpage-label">Email</label>
              <input
                className="loginpage-input"
                type="email"
                placeholder="Enter your email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
              />
              <label className="loginpage-label">Password</label>
              <div className="loginpage-password-wrap">
                <input
                  className="loginpage-input"
                  type={signupShowPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                />
                <span
                  className="loginpage-password-toggle"
                  onClick={() => setSignupShowPassword(v => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={signupShowPassword ? "Hide password" : "Show password"}
                >
                  {signupShowPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <label className="loginpage-label">Confirm Password</label>
              <div className="loginpage-password-wrap">
                <input
                  className="loginpage-input"
                  type={signupShowConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={signupConfirm}
                  onChange={e => setSignupConfirm(e.target.value)}
                />
                <span
                  className="loginpage-password-toggle"
                  onClick={() => setSignupShowConfirm(v => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={signupShowConfirm ? "Hide password" : "Show password"}
                >
                  {signupShowConfirm ? "🙈" : "👁️"}
                </span>
              </div>
              <button className="loginpage-btn" type="submit" disabled={signupLoading}>{signupLoading ? "Signing up..." : "Sign Up"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const mapState = (state) => ({
  isLoggedIn: state.auth.isLoggedIn
});
const mapDispatch = (dispatch) => ({
  login: (data) => dispatch.auth.login(data),
  alert: (data) => dispatch.toast.alert(data),
  createUser: (data) => dispatch.auth.createUser(data)
});

export default connect(mapState, mapDispatch)(LoginPage);
