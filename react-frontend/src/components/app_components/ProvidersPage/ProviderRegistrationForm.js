import React, { useState } from "react";
import client from "../../../services/restClient";
import { useNavigate } from "react-router-dom";

const initialState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

const categories = [
  "Cleaning", "Plumbing", "Electrical", "Landscaping", "Painting", "Moving", "Other"
];

const whyJoinCards = [
  {
    icon: (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        background: "#ede9fe",
        borderRadius: "50%",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 22, color: "#6366f1" }}>💲</span>
      </span>
    ),
    title: "Increase Your Income",
    desc: "Access a steady stream of clients and grow your business revenue.",
  },
  {
    icon: (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        background: "#ede9fe",
        borderRadius: "50%",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 22, color: "#6366f1" }}>🕒</span>
      </span>
    ),
    title: "Flexible Schedule",
    desc: "Work when you want and manage your availability with our easy tools.",
  },
  {
    icon: (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        background: "#ede9fe",
        borderRadius: "50%",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 22, color: "#6366f1" }}>🗂️</span>
      </span>
    ),
    title: "Simple Management",
    desc: "Easily manage bookings, payments, and client communications.",
  },
  {
    icon: (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        background: "#ede9fe",
        borderRadius: "50%",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 22, color: "#6366f1" }}>📢</span>
      </span>
    ),
    title: "Build Your Reputation",
    desc: "Collect reviews and build a strong online presence to attract more clients.",
  },
];

export default function ProviderRegistrationForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      // Create user with provider role
      await client.service("users").create({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: "provider",
      });

      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true, state: { email: form.email } }), 1200);
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>Registration Successful!</h2>
        <p>You can now log in as a service provider.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fd" }}>
      <div style={{ display: "flex", gap: 48, alignItems: "flex-start", justifyContent: "center", width: "100%", maxWidth: 1200, padding: 24 }}>
        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{
          width: 400,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #e5e7ef",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: 32, margin: 0 }}>Join Our Provider Network</h1>
          <p style={{ textAlign: "center", color: "#444", margin: 0 }}>Create your account and start offering your services today</p>
          <div style={{ marginTop: 8 }}>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e5e7ef", fontSize: 16 }}
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e5e7ef", fontSize: 16 }}
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e5e7ef", fontSize: 16 }}
            />
          </div>
          <div>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e5e7ef", fontSize: 16 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              required
              style={{ marginRight: 8 }}
            />
            <span>I agree to the <a href="#" style={{ color: "#6366f1" }}>Terms of Service</a> and <a href="#" style={{ color: "#6366f1" }}>Privacy Policy</a></span>
          </div>
          {error && <div style={{ color: "red", marginTop: -8, fontSize: 15 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: "100%",
              background: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              padding: 14,
              border: 0,
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px #e5e7ef"
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 15 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: "#6366f1", textDecoration: "underline", cursor: "pointer" }}>Log in</a>
          </div>
        </form>
        {/* Why Join ServicePro Section */}
        <div style={{ minWidth: 380, maxWidth: 420 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28, marginTop: 8 }}>Why Join StayEase?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {whyJoinCards.map((card, idx) => (
              <div key={card.title} style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px #e5e7ef",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                minHeight: 150,
                gap: 2,
              }}>
                {card.icon}
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{card.title}</div>
                <div style={{ color: "#444", fontSize: 15 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 