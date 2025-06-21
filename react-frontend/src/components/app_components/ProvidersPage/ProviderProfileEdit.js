import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import client from "../../../services/restClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SERVICE_CATEGORIES = [
  "Cleaning",
  "Electrical/wiring",
  "Plumbing",
  "Aircond",
  "Pool maintenance",
  "Pest control",
  "Lawn & garden care",
  "Handyman",
  "Interior design / Renovation",
  "Security"
];

export default function ProviderProfileEdit() {
  const userId = useSelector(state => state.auth.user?._id);
  const userEmail = useSelector(state => state.auth.user?.email);
  const [form, setForm] = useState({
    fullName: "",
    email: userEmail || "",
    phone: "",
    imageUrl: "",
    businessName: "",
    categories: [],
    coverage: "",
    whatsapp: "",
    bookingMsg: "",
    available: true,
    bio: "",
    experience: "",
    certifications: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [providerId, setProviderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch provider profile on mount
  useEffect(() => {
    async function fetchProvider() {
      setLoading(true);
      setError("");
      try {
        const res = await client.service("providers").find({ query: { providerId: userId } });
        if (res.data && res.data.length > 0) {
          const p = res.data[0];
          setProviderId(p._id);
          setForm({
            fullName: p.name || "",
            email: p.email || userEmail || "",
            phone: p.phone || "",
            imageUrl: p.imageUrl || "",
            businessName: p.businessName || p.name || "",
            categories: p.category ? (Array.isArray(p.category) ? p.category : [p.category]) : [],
            coverage: p.location || "",
            whatsapp: p.whatsappLink || "",
            bookingMsg: p.bookingMsg || "",
            available: typeof p.available === 'boolean' ? p.available : true,
            bio: p.description || "",
            experience: p.experience || "",
            certifications: p.certifications || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
        }
      } catch (e) {
        setError("Failed to load provider profile");
      }
      setLoading(false);
    }
    if (userId) fetchProvider();
  }, [userId, userEmail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "categories") {
      setForm((prev) => ({
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter((cat) => cat !== value)
      }));
    } else if (type === "checkbox" && name === "available") {
      setForm((prev) => ({ ...prev, available: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image upload handler (Cloudinary)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "z3a46qga"); // your unsigned preset
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/de6nqsgxd/image/upload",
        formData
      );
      if (res.data && res.data.secure_url) {
        setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
      } else {
        setError("Image upload failed");
      }
    } catch (err) {
      setError("Image upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      if (!providerId) {
        // Create new provider profile
        const created = await client.service("providers").create({
          providerId: userId,
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          imageUrl: form.imageUrl,
          businessName: form.businessName,
          category: form.categories,
          location: form.coverage,
          whatsappLink: form.whatsapp,
          bookingMsg: form.bookingMsg,
          available: form.available,
          description: form.bio,
          experience: form.experience,
          certifications: form.certifications
        });
        // Also update user name
        await client.service("users").patch(userId, { name: form.fullName });
        setProviderId(created._id);
        setSuccess(true);
        navigate("/provider-dashboard");
      } else {
        // Update existing provider profile
        await client.service("providers").patch(providerId, {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          imageUrl: form.imageUrl,
          businessName: form.businessName,
          category: form.categories,
          location: form.coverage,
          whatsappLink: form.whatsapp,
          bookingMsg: form.bookingMsg,
          available: form.available,
          description: form.bio,
          experience: form.experience,
          certifications: form.certifications
        });
        // Also update user name
        await client.service("users").patch(userId, { name: form.fullName });
        setSuccess(true);
        navigate("/provider-dashboard");
      }
    } catch (e) {
      setError("Failed to save changes");
    }
    setLoading(false);
  };

  // --- UI Styles ---
  const cardStyle = {
    maxWidth: 900,
    margin: "40px auto",
    background: "#ffffff",
    borderRadius: 24,
    padding: 0,
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    border: "1px solid #f1f5f9"
  };
  const sectionStyle = {
    padding: 40,
    borderBottom: "1px solid #f8fafc"
  };
  const lastSectionStyle = {
    ...sectionStyle,
    borderBottom: "none"
  };
  const labelStyle = {
    fontWeight: 600,
    marginBottom: 8,
    display: "block",
    color: "#1e293b",
    fontSize: 15
  };
  const inputStyle = {
    width: "100%",
    marginBottom: 20,
    padding: "14px 16px",
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    fontSize: 16,
    background: "#ffffff",
    transition: "all 0.2s ease",
    color: "#1e293b",
    boxSizing: "border-box"
  };
  const textareaStyle = {
    ...inputStyle,
    minHeight: 100,
    resize: "vertical",
    fontFamily: "inherit"
  };
  const disabledInputStyle = {
    ...inputStyle,
    background: "#f8fafc",
    color: "#64748b",
    cursor: "not-allowed"
  };
  const errorStyle = {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "16px 20px",
    borderRadius: 12,
    fontWeight: 600,
    marginBottom: 24,
    textAlign: "center",
    border: "1px solid #fecaca",
    fontSize: 15
  };
  const successStyle = {
    position: "fixed",
    top: 30,
    right: 30,
    background: "#059669",
    color: "#ffffff",
    padding: "16px 24px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    zIndex: 9999,
    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.3)",
    border: "1px solid #10b981"
  };
  const headerStyle = {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "#ffffff",
    padding: "40px 40px 32px 40px"
  };
  const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 24,
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    gap: 10
  };
  const helpTextStyle = {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 1.5
  };
  const avatarContainerStyle = {
    width: 120,
    height: 120,
    border: "3px solid #e2e8f0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: "#f8fafc",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
  };
  const cameraButtonStyle = {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    borderRadius: "50%",
    padding: 8,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
    border: "2px solid #ffffff"
  };
  const categoryButtonStyle = (isSelected) => ({
    background: isSelected ? "#3b82f6" : "#ffffff",
    color: isSelected ? "#ffffff" : "#475569",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.25)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: isSelected ? "2px solid #3b82f6" : "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    fontSize: 14
  });
  const availabilityStatusStyle = {
    color: form.available ? "#059669" : "#dc2626",
    background: form.available ? "#f0fdf4" : "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    fontWeight: 600,
    border: `1px solid ${form.available ? "#bbf7d0" : "#fecaca"}`,
    fontSize: 15
  };
  const submitButtonStyle = {
    width: "100%",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontWeight: 700,
    border: 0,
    borderRadius: 12,
    padding: "18px 0",
    fontSize: 18,
    cursor: "pointer",
    marginTop: 8,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
    transition: "all 0.2s ease"
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: 100, fontSize: 18, color: '#64748b' }}>
      Loading your profile...
    </div>
  );
  
  if (error) return (
    <div style={{ textAlign: 'center', marginTop: 100, color: '#dc2626', fontSize: 18 }}>
      {error}
    </div>
  );
  
  if (success) return (
    <div style={{ textAlign: 'center', marginTop: 100, color: '#059669', fontSize: 18 }}>
      Profile updated successfully!
    </div>
  );

  return (
    <>
      {success && (
        <div style={successStyle}>
          Profile updated successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontWeight: 800, fontSize: 32, marginBottom: 8, letterSpacing: -0.5 }}>Edit Profile</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: 0, fontSize: 16, lineHeight: 1.5 }}>
            Update your profile information to help customers find and connect with you
          </p>
        </div>

        {/* Basic Information */}
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="user" style={{ fontSize: 20 }}>👤</span>
            Basic Information
          </div>
          {error && <div style={errorStyle}>{error}</div>}
          
          <div style={{ display: "flex", alignItems: "flex-start", gap: 32, marginBottom: 24 }}>
            <div style={avatarContainerStyle}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#64748b", fontWeight: 600, fontSize: 16, textAlign: "center" }}>
                  Profile<br />Photo
                </span>
              )}
              <label style={cameraButtonStyle}>
                <span role="img" aria-label="camera" style={{ color: "#fff", fontSize: 16 }}>📷</span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} disabled={uploading} />
              </label>
              {uploading && (
                <span style={{ position: "absolute", top: 8, left: 8, color: "#3b82f6", fontWeight: 700, fontSize: 12, background: "rgba(255,255,255,0.9)", padding: "2px 6px", borderRadius: 4 }}>
                  Uploading...
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Full Name*</label>
              <input 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                placeholder="Enter your full name"
                style={inputStyle} 
                required
              />
              <label style={labelStyle}>Email Address</label>
              <input 
                name="email" 
                value={form.email} 
                style={disabledInputStyle} 
                disabled 
              />
              <div style={helpTextStyle}>Email cannot be changed</div>
              <label style={labelStyle}>Phone Number*</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder="e.g. +60123456789"
                style={inputStyle} 
                required
              />
              <div style={helpTextStyle}>This will be used for WhatsApp link</div>
            </div>
          </div>
        </section>

        {/* Business Information */}
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="business" style={{ fontSize: 20 }}>🏢</span>
            Business Information
          </div>
          <label style={labelStyle}>Business/Service Name*</label>
          <input 
            name="businessName" 
            value={form.businessName} 
            onChange={handleChange} 
            placeholder="Enter your business name"
            style={inputStyle} 
            required
          />
          <label style={labelStyle}>Service Categories*</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {SERVICE_CATEGORIES.map((cat) => (
              <label key={cat} style={categoryButtonStyle(form.categories.includes(cat))}>
                <input 
                  type="checkbox" 
                  name="categories" 
                  value={cat} 
                  checked={form.categories.includes(cat)} 
                  onChange={handleChange} 
                  style={{ display: "none" }} 
                />
                {cat}
              </label>
            ))}
          </div>
          <label style={labelStyle}>Service Coverage Area*</label>
          <input 
            name="coverage" 
            value={form.coverage} 
            onChange={handleChange} 
            placeholder="e.g. Kuala Lumpur, Selangor"
            style={inputStyle} 
            required
          />
          <div style={helpTextStyle}>Enter city, state, and/or postcodes you serve</div>
        </section>

        {/* Contact Settings */}
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="whatsapp" style={{ fontSize: 20 }}>💬</span>
            Contact Settings
          </div>
          <label style={labelStyle}>WhatsApp Number*</label>
          <input 
            name="whatsapp" 
            value={form.whatsapp} 
            onChange={handleChange} 
            placeholder="e.g. +60123456789"
            style={inputStyle} 
            required
          />
          <label style={labelStyle}>Pre-filled Booking Message</label>
          <textarea 
            name="bookingMsg" 
            value={form.bookingMsg} 
            onChange={handleChange} 
            placeholder="Hi, I'm interested in booking your service..."
            style={textareaStyle} 
            rows={3}
          />
          <div style={helpTextStyle}>This message will be pre-filled when customers click "Book"</div>
        </section>

        {/* Availability Status */}
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="status" style={{ fontSize: 20 }}>🟢</span>
            Availability Status
          </div>
          <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <input 
              type="checkbox" 
              name="available" 
              checked={form.available} 
              onChange={handleChange} 
              style={{ width: 20, height: 20, accentColor: "#3b82f6" }} 
            />
            Service Availability
          </label>
          <div style={availabilityStatusStyle}>
            {form.available 
              ? "✅ Your services are currently active and visible to customers." 
              : "❌ Your services are currently inactive and hidden from customers."
            }
          </div>
        </section>

        {/* Professional Details */}
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="bio" style={{ fontSize: 20 }}>📝</span>
            Professional Details
          </div>
          <label style={labelStyle}>About Your Business</label>
          <textarea 
            name="bio" 
            value={form.bio} 
            onChange={handleChange} 
            placeholder="Tell customers about your business, services, and what makes you unique..."
            style={textareaStyle} 
            rows={4}
          />
          <label style={labelStyle}>Years of Experience</label>
          <input 
            name="experience" 
            value={form.experience} 
            onChange={handleChange} 
            placeholder="e.g. 5+ years"
            style={inputStyle} 
          />
          <label style={labelStyle}>Certifications (Optional)</label>
          <textarea 
            name="certifications" 
            value={form.certifications} 
            onChange={handleChange} 
            placeholder="List any relevant certifications or qualifications..."
            style={textareaStyle} 
            rows={3}
          />
          <div style={helpTextStyle}>List any relevant certifications or qualifications</div>
        </section>

        {/* Password Management */}
        <section style={lastSectionStyle}>
          <div style={sectionTitleStyle}>
            <span role="img" aria-label="password" style={{ fontSize: 20 }}>🔐</span>
            Password Management
          </div>
          <label style={labelStyle}>Current Password</label>
          <input 
            name="currentPassword" 
            type="password" 
            value={form.currentPassword} 
            onChange={handleChange} 
            placeholder="Enter current password"
            style={inputStyle} 
          />
          <label style={labelStyle}>New Password</label>
          <input 
            name="newPassword" 
            type="password" 
            value={form.newPassword} 
            onChange={handleChange} 
            placeholder="Enter new password"
            style={inputStyle} 
          />
          <label style={labelStyle}>Confirm New Password</label>
          <input 
            name="confirmPassword" 
            type="password" 
            value={form.confirmPassword} 
            onChange={handleChange} 
            placeholder="Confirm new password"
            style={inputStyle} 
          />
          <div style={helpTextStyle}>Leave password fields empty if you don't want to change it</div>
        </section>

        {/* Submit Button */}
        <div style={{ padding: "32px 40px", background: "#f8fafc", display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <button 
            type="button" 
            onClick={() => navigate("/provider-dashboard")}
            style={{
              minWidth: 120,
              padding: "16px 24px",
              fontWeight: 700,
              border: 0,
              borderRadius: 12,
              fontSize: 16,
              cursor: "pointer",
              background: "#f1f5f9",
              color: "#475569",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease"
            }}
          >
            Cancel
          </button>
          <button type="submit" style={submitButtonStyle}>
            <span role="img" aria-label="save" style={{ fontSize: 18 }}>💾</span>
            Save Changes
          </button>
        </div>
      </form>
    </>
  );
} 