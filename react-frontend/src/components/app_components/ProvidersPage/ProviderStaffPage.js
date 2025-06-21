import React, { useEffect, useState } from "react";
import client from "../../../services/restClient";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

export default function ProviderStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", position: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await client.service("staffinfo").find({ query: {} });
      setStaff(res.data || []);
    } catch {
      setStaff([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => {
    setEditStaff(null);
    setForm({ name: "", email: "", position: "" });
    setShowModal(true);
    setError("");
  };
  
  const openEdit = (s) => {
    setEditStaff(s);
    setForm({ name: s.name, email: s.email, position: s.position });
    setShowModal(true);
    setError("");
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditStaff(null);
    setForm({ name: "", email: "", position: "" });
    setError("");
  };
  
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editStaff) {
        await client.service("staffinfo").patch(editStaff._id, form);
        setSuccess("Staff updated successfully!");
      } else {
        await client.service("staffinfo").create(form);
        setSuccess("Staff created successfully!");
      }
      fetchStaff();
      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save staff");
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await client.service("staffinfo").remove(id);
      setSuccess("Staff deleted successfully!");
      fetchStaff();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete staff");
    }
  };

  // --- UI Styles ---
  const mainContentStyle = {
    flex: 1,
    maxWidth: 1400,
    margin: "40px auto",
    padding: "0 32px"
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32
  };
  const titleStyle = {
    fontWeight: 800,
    fontSize: 36,
    margin: 0,
    color: '#1e293b',
    letterSpacing: -0.5
  };
  const subtitleStyle = {
    color: "#64748b",
    margin: "8px 0 0 0",
    fontSize: 18,
    fontWeight: 500
  };
  const addButtonStyle = {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontWeight: 700,
    border: 0,
    borderRadius: 12,
    padding: "16px 32px",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
    transition: "all 0.2s ease"
  };
  const loadingStyle = {
    textAlign: "center",
    padding: "80px 20px",
    color: "#64748b",
    fontSize: 18
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
  const staffGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24
  };
  const staffCardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease"
  };
  const staffHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20
  };
  const avatarStyle = {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 20
  };
  const staffInfoStyle = {
    flex: 1
  };
  const staffNameStyle = {
    fontWeight: 700,
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 4
  };
  const staffPositionStyle = {
    color: "#6366f1",
    fontWeight: 600,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  const staffEmailStyle = {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4
  };
  const actionButtonsStyle = {
    display: "flex",
    gap: 12
  };
  const editButtonStyle = {
    flex: 1,
    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    color: "#3730a3",
    fontWeight: 700,
    border: 0,
    borderRadius: 10,
    padding: "12px 0",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const deleteButtonStyle = {
    flex: 1,
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#dc2626",
    fontWeight: 700,
    border: 0,
    borderRadius: 10,
    padding: "12px 0",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const emptyStateStyle = {
    textAlign: "center",
    padding: "80px 20px",
    color: "#64748b"
  };
  const modalStyle = {
    width: "500px",
    maxWidth: "95vw"
  };
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  };
  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  };
  const labelStyle = {
    fontWeight: 600,
    fontSize: 15,
    color: '#1e293b'
  };
  const inputStyle = {
    padding: "14px 16px",
    borderRadius: 10,
    border: "2px solid #e2e8f0",
    fontSize: 16,
    color: "#1e293b",
    background: "#ffffff",
    transition: "all 0.2s ease"
  };
  const modalFooterStyle = {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 24
  };
  const cancelButtonStyle = {
    background: "#f1f5f9",
    color: "#64748b",
    border: 0,
    borderRadius: 10,
    padding: "12px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const saveButtonStyle = {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    padding: "12px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  return (
    <div style={mainContentStyle}>
      {success && (
        <div style={successStyle}>
          {success}
        </div>
      )}
      
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Staff Management</h1>
          <p style={subtitleStyle}>Manage your team members and their roles</p>
        </div>
        <button onClick={openCreate} style={addButtonStyle}>
          <span style={{ fontSize: 20 }}>+</span>
          Add Staff Member
        </button>
      </div>

      {/* Staff Cards */}
      {loading ? (
        <div style={loadingStyle}>Loading your staff...</div>
      ) : staff.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No staff members found</div>
          <div style={{ fontSize: 16, color: "#94a3b8" }}>
            Add your first team member to get started
          </div>
        </div>
      ) : (
        <div style={staffGridStyle}>
          {staff.map(s => (
            <div key={s._id} style={staffCardStyle}>
              <div style={staffHeaderStyle}>
                <div style={avatarStyle}>
                  {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div style={staffInfoStyle}>
                  <div style={staffNameStyle}>{s.name}</div>
                  <div style={staffPositionStyle}>{s.position}</div>
                  <div style={staffEmailStyle}>{s.email}</div>
                </div>
              </div>
              <div style={actionButtonsStyle}>
                <button onClick={() => openEdit(s)} style={editButtonStyle}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(s._id)} style={deleteButtonStyle}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Modal */}
      <Dialog 
        header={editStaff ? "Edit Staff Member" : "Add Staff Member"} 
        visible={showModal} 
        onHide={closeModal} 
        style={modalStyle}
        modal
      >
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Full Name*</label>
            <InputText 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Enter full name"
              required 
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address*</label>
            <InputText 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Enter email address"
              type="email"
              required 
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Position*</label>
            <InputText 
              name="position" 
              value={form.position} 
              onChange={handleChange} 
              placeholder="Enter job position"
              required 
              style={inputStyle}
            />
          </div>
          <div style={modalFooterStyle}>
            <Button 
              label="Cancel" 
              onClick={closeModal} 
              className="p-button-text" 
              type="button" 
              style={cancelButtonStyle}
            />
            <Button 
              label={editStaff ? "Update Staff" : "Add Staff"} 
              type="submit" 
              style={saveButtonStyle}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
} 