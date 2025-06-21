import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import client from "../../../services/restClient";
import { uploadToCloudinary } from '../../../services/cloudinaryUpload';

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LOCATION_OPTIONS = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
];

export default function ProviderServiceCreate() {
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?._id);
  const [form, setForm] = useState({
    name: "",
    category: "",
    imageUrl: "",
    description: "",
    pricerange: "",
    location: "",
    whatsappLink: "",
    availability: DAYS.reduce((acc, day) => ({ ...acc, [day]: day !== "Sunday" }), {}),
    startTime: "09:00",
    endTime: "17:00",
    leadTime: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && DAYS.includes(name)) {
      setForm((prev) => ({ ...prev, availability: { ...prev.availability, [name]: checked } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadToCloudinary(file);
      if (res && res.secure_url) {
        setForm((prev) => ({ ...prev, imageUrl: res.secure_url }));
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
    try {
      await client.service("listings").create({
        providerId: userId,
        name: form.name,
        category: form.category,
        description: form.description,
        pricerange: form.pricerange,
        location: form.location,
        whatsappLink: form.whatsappLink,
        imageUrl: form.imageUrl, // Save as string URL
        availability: form.availability,
        startTime: form.startTime,
        endTime: form.endTime,
        leadTime: form.leadTime
      });
      setSuccess(true);
      setTimeout(() => navigate("/provider-services"), 1800);
    } catch (err) {
      setError("Failed to create service");
    }
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
  const selectStyle = {
    ...inputStyle
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
  const twoCol = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 40
  };
  const oneCol = {
    display: "block"
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
  const imageUploadStyle = {
    border: "2px dashed #cbd5e1",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    marginBottom: 24,
    cursor: "pointer",
    position: "relative",
    background: "#f8fafc",
    transition: "all 0.2s ease"
  };
  const dayButtonStyle = (isSelected) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
    background: isSelected ? "#3b82f6" : "#ffffff",
    color: isSelected ? "#ffffff" : "#475569",
    borderRadius: 10,
    padding: "10px 16px",
    cursor: "pointer",
    boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.25)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: isSelected ? "2px solid #3b82f6" : "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    fontSize: 14
  });
  const actionButtonStyle = {
    minWidth: 140,
    padding: "16px 24px",
    fontWeight: 700,
    border: 0,
    borderRadius: 12,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  };
  const cancelButtonStyle = {
    ...actionButtonStyle,
    background: "#f1f5f9",
    color: "#475569",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
  };
  const submitButtonStyle = {
    ...actionButtonStyle,
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
  };
  // --- Responsive ---
  const isMobile = window.innerWidth < 700;

  return (
    <>
      {success && (
        <div style={successStyle}>
          Service created successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontWeight: 800, fontSize: 32, marginBottom: 8, letterSpacing: -0.5 }}>Add New Service</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: 0, fontSize: 16, lineHeight: 1.5 }}>Create a new service listing that customers can book</p>
        </div>
        <div style={isMobile ? oneCol : twoCol}>
          {/* Left column: Basic Info */}
          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <span role="img" aria-label="info" style={{ fontSize: 20 }}>ℹ️</span>
              Basic Service Information
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <label style={labelStyle}>Service Name*</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="e.g. Professional House Cleaning" 
              style={inputStyle} 
              required 
            />
            <label style={labelStyle}>Service Category*</label>
            <select name="category" value={form.category} onChange={handleChange} style={selectStyle} required>
              <option value="">Select a category</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label style={labelStyle}>Service Description*</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Describe your service in detail..." 
              style={textareaStyle} 
              required 
            />
            <div style={helpTextStyle}>Include what's included, what to expect, and any special requirements</div>
            <label style={labelStyle}>Price*</label>
            <input 
              name="pricerange" 
              value={form.pricerange} 
              onChange={handleChange} 
              placeholder="e.g. RM 100" 
              style={inputStyle} 
              required 
            />
            <label style={labelStyle}>Location*</label>
            <select name="location" value={form.location} onChange={handleChange} style={selectStyle} required>
              <option value="">Select a location</option>
              {LOCATION_OPTIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <label style={labelStyle}>WhatsApp Link*</label>
            <input 
              name="whatsappLink" 
              value={form.whatsappLink} 
              onChange={handleChange} 
              placeholder="e.g. https://wa.me/60123456789" 
              style={inputStyle} 
              required 
            />
          </section>
          {/* Right column: Image and Availability */}
          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <span role="img" aria-label="image" style={{ fontSize: 20 }}>🖼️</span>
              Service Image
            </div>
            <div style={imageUploadStyle}>
              <input 
                type="file" 
                accept="image/*" 
                style={{ opacity: 0, position: "absolute", width: "100%", height: "100%", left: 0, top: 0, cursor: "pointer" }} 
                onChange={handleImageChange} 
                disabled={uploading} 
              />
              {form.imageUrl ? (
                <img 
                  src={form.imageUrl} 
                  alt="Service" 
                  style={{ 
                    maxWidth: 320, 
                    maxHeight: 200, 
                    display: "block", 
                    margin: "0 auto", 
                    borderRadius: 12, 
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)" 
                  }} 
                />
              ) : (
                <div>
                  <span style={{ fontSize: 40, color: "#94a3b8" }}>☁️</span>
                  <div style={{ color: "#475569", fontWeight: 600, marginTop: 12, fontSize: 16 }}>Click to upload an image</div>
                  <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>(Recommended size: 1200 × 800px)</div>
                </div>
              )}
              {uploading && <div style={{ color: "#3b82f6", fontWeight: 600, marginTop: 12 }}>Uploading...</div>}
            </div>
            <div style={sectionTitleStyle}>
              <span role="img" aria-label="calendar" style={{ fontSize: 20 }}>📅</span>
              Availability
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {DAYS.map(day => (
                <label key={day} style={dayButtonStyle(form.availability[day])}>
                  <input 
                    type="checkbox" 
                    name={day} 
                    checked={form.availability[day]} 
                    onChange={handleChange} 
                    style={{ display: "none" }} 
                  />
                  {day}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <label style={labelStyle}>Booking Lead Time (Optional)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input 
                name="leadTime" 
                value={form.leadTime} 
                onChange={handleChange} 
                style={{ ...inputStyle, width: 100, marginBottom: 0 }} 
              />
              <span style={{ color: "#64748b", fontSize: 15 }}>hours in advance</span>
            </div>
            <div style={helpTextStyle}>Minimum time required before a booking can be made</div>
          </section>
        </div>
        {/* Actions */}
        <div style={{ ...lastSectionStyle, background: "#f8fafc", display: "flex", gap: 16, justifyContent: "flex-end", padding: "32px 40px" }}>
          <button 
            type="button" 
            onClick={() => navigate("/provider-services")}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={submitButtonStyle}
          >
            <span role="img" aria-label="save" style={{ fontSize: 18 }}>➕</span>
            Create Service
          </button>
        </div>
      </form>
    </>
  );
} 