import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import client from "../../../services/restClient";

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

export default function ProviderServiceEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      try {
        const res = await client.service("listings").get(id);
        setForm({
          name: res.name || "",
          category: res.category || "",
          imageUrl: res.imageUrl || "",
          description: res.description || "",
          pricerange: res.pricerange || "",
          location: res.location || "",
          whatsappLink: res.whatsappLink || "",
          availability: res.availability || DAYS.reduce((acc, day) => ({ ...acc, [day]: day !== "Sunday" }), {}),
          startTime: res.startTime || "09:00",
          endTime: res.endTime || "17:00",
          leadTime: res.leadTime || "",
        });
      } catch (e) {
        setError("Failed to load service");
      }
      setLoading(false);
    }
    if (id) fetchService();
  }, [id]);

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "z3a46qga");
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
    try {
      await client.service("listings").patch(id, {
        providerId: userId,
        name: form.name,
        category: form.category,
        description: form.description,
        pricerange: form.pricerange,
        location: form.location,
        whatsappLink: form.whatsappLink,
        imageUrl: form.imageUrl,
        availability: form.availability,
        startTime: form.startTime,
        endTime: form.endTime,
        leadTime: form.leadTime
      });
      setSuccess(true);
      setTimeout(() => navigate("/provider-services"), 1800);
    } catch (err) {
      setError("Failed to update service");
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>;

  return (
    <>
      {success && (
        <div style={{ position: "fixed", top: 30, right: 30, background: "#22c55e", color: "#fff", padding: "16px 32px", borderRadius: 8, fontWeight: 600, fontSize: 18, zIndex: 9999, boxShadow: "0 2px 12px #e5e7ef" }}>
          Service updated successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: "40px auto", background: "#f4faff", borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Edit Service</h2>
        <p style={{ color: "#444", marginBottom: 24 }}>Update your service details below</p>
        {/* Basic Service Information */}
        <section style={{ background: "#fff", borderRadius: 12, marginBottom: 24, padding: 24, boxShadow: "0 2px 8px #e5e7ef" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#2563eb", marginBottom: 18 }}>
            <span role="img" aria-label="info">ℹ️</span> Basic Service Information
          </div>
          <label style={{ fontWeight: 600 }}>Service Name*</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Professional House Cleaning" style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} required />
          <label style={{ fontWeight: 600 }}>Service Category*</label>
          <select name="category" value={form.category} onChange={handleChange} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} required>
            <option value="">Select a category</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label style={{ fontWeight: 600 }}>Service Image</label>
          <div style={{ border: "2px dashed #38bdf8", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 12, cursor: "pointer", position: "relative" }}>
            <input type="file" accept="image/*" style={{ opacity: 0, position: "absolute", width: "100%", height: "100%", left: 0, top: 0, cursor: "pointer" }} onChange={handleImageChange} disabled={uploading} />
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Service" style={{ maxWidth: 300, maxHeight: 200, display: "block", margin: "0 auto" }} />
            ) : (
              <div>
                <span style={{ fontSize: 36, color: "#38bdf8" }}>☁️</span>
                <div style={{ color: "#2563eb", fontWeight: 600, marginTop: 8 }}>Click to upload an image</div>
                <div style={{ color: "#888", fontSize: 13 }}>(Recommended size: 1200 × 800px)</div>
              </div>
            )}
            {uploading && <div style={{ color: "#38bdf8", fontWeight: 600, marginTop: 8 }}>Uploading...</div>}
          </div>
          <label style={{ fontWeight: 600 }}>Service Description*</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your service in detail..." style={{ width: "100%", marginBottom: 6, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} rows={3} required />
          <div style={{ color: "#888", fontSize: 13, marginBottom: 0 }}>Include what's included, what to expect, and any special requirements</div>
          <label style={{ fontWeight: 600 }}>Price Range*</label>
          <input name="pricerange" value={form.pricerange} onChange={handleChange} placeholder="e.g. $50 - $200" style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} required />
          <label style={{ fontWeight: 600 }}>Location*</label>
          <select name="location" value={form.location} onChange={handleChange} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} required>
            <option value="">Select a location</option>
            {LOCATION_OPTIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <label style={{ fontWeight: 600 }}>WhatsApp Link*</label>
          <input name="whatsappLink" value={form.whatsappLink} onChange={handleChange} placeholder="e.g. https://wa.me/60123456789" style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} required />
        </section>
        {/* Availability */}
        <section style={{ background: "#fff", borderRadius: 12, marginBottom: 24, padding: 24, boxShadow: "0 2px 8px #e5e7ef" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#2563eb", marginBottom: 18 }}>
            <span role="img" aria-label="calendar">📅</span> Availability
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
            {DAYS.map(day => (
              <label key={day} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, background: form.availability[day] ? "#38bdf8" : "#f1f5f9", color: form.availability[day] ? "#fff" : "#222", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>
                <input type="checkbox" name={day} checked={form.availability[day]} onChange={handleChange} style={{ display: "none" }} />
                {day}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} />
            </div>
          </div>
          <label style={{ fontWeight: 600 }}>Booking Lead Time (Optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="leadTime" value={form.leadTime} onChange={handleChange} style={{ width: 80, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} />
            <span style={{ color: "#888", fontSize: 15 }}>hours in advance</span>
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Minimum time required before a booking can be made</div>
        </section>
        <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
          <button type="button" onClick={() => navigate("/provider-services")}
            style={{ flex: 1, background: "#e5e7ef", color: "#222", fontWeight: 700, border: 0, borderRadius: 8, padding: "16px 0", fontSize: 18, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" style={{ flex: 2, background: "#38bdf8", color: "#fff", fontWeight: 700, border: 0, borderRadius: 8, padding: "16px 0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span role="img" aria-label="save">💾</span> Save Changes
          </button>
        </div>
      </form>
    </>
  );
} 