import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

export default function ProviderServicesList() {
  const userId = useSelector(state => state.auth.user?._id);
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const [servicesRes, reviewsRes, bookingsRes] = await Promise.all([
        client.service("listings").find({ query: { providerId: userId } }),
        client.service("reviews").find({ query: { providerId: userId } }),
        client.service("bookings").find({ query: { providerId: userId } })
      ]);
      setServices(servicesRes.data || []);
      setReviews(reviewsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (e) {
      setServices([]);
      setReviews([]);
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchServices();
    // eslint-disable-next-line
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await client.service("listings").remove(id);
      setSuccess("Service deleted successfully!");
      fetchServices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setSuccess("");
    }
  };

  const filtered = services.filter(s =>
    (!category || s.category === category) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to get stats for a service
  const getServiceStats = (serviceId) => {
    const serviceBookings = bookings.filter(b => (b.listingId === serviceId || (b.listingId && b.listingId.toString() === serviceId)) && typeof b.rating === 'number');
    const avgRating = serviceBookings.length ? (serviceBookings.reduce((a, b) => a + b.rating, 0) / serviceBookings.length).toFixed(1) : '-';
    return {
      avgRating,
      reviewCount: serviceBookings.length,
      totalBookings: bookings.filter(b => b.listingId === serviceId || (b.listingId && b.listingId.toString() === serviceId)).length
    };
  };

  // Calculate overall stats
  const ratedBookings = bookings.filter(b => typeof b.rating === 'number' && b.rating > 0);
  const overallStats = {
    totalServices: services.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    averageRating: ratedBookings.length ? (ratedBookings.reduce((a, b) => a + (b.rating || 0), 0) / ratedBookings.length).toFixed(1) : '0.0',
    totalReviews: ratedBookings.length
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
  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
    marginBottom: 40
  };
  const statCardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease"
  };
  const statValueStyle = {
    fontWeight: 800,
    fontSize: 36,
    color: "#1e293b",
    marginBottom: 8
  };
  const statLabelStyle = {
    fontWeight: 600,
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8
  };
  const statSubtextStyle = {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500
  };
  const filtersStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 32,
    alignItems: "center",
    background: "#ffffff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f1f5f9"
  };
  const selectStyle = {
    padding: "12px 16px",
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    fontSize: 15,
    fontWeight: 500,
    color: "#1e293b",
    background: "#ffffff",
    minWidth: 180
  };
  const searchInputStyle = {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    fontSize: 15,
    fontWeight: 500,
    color: "#1e293b",
    background: "#ffffff"
  };
  const serviceGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24
  };
  const serviceCardStyle = {
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease"
  };
  const serviceImageStyle = {
    height: 200,
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  };
  const serviceContentStyle = {
    padding: 24
  };
  const serviceTitleStyle = {
    fontWeight: 700,
    fontSize: 20,
    color: "#1e293b",
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };
  const priceStyle = {
    color: "#3b82f6",
    fontWeight: 800,
    fontSize: 18
  };
  const categoryStyle = {
    color: "#6366f1",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  const descriptionStyle = {
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 16,
    minHeight: 48
  };
  const statsRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: "12px 0",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9"
  };
  const ratingStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 15,
    color: "#f59e0b"
  };
  const bookingCountStyle = {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500
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
  const emptyStateStyle = {
    textAlign: "center",
    padding: "80px 20px",
    color: "#64748b"
  };
  const loadingStyle = {
    textAlign: "center",
    padding: "80px 20px",
    color: "#64748b",
    fontSize: 18
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
          <h1 style={titleStyle}>My Services</h1>
          <p style={subtitleStyle}>Manage your service listings and track performance</p>
        </div>
        <button onClick={() => navigate("/provider-services/create")} style={addButtonStyle}>
          <span style={{ fontSize: 20 }}>+</span>
          Add New Service
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{overallStats.totalServices}</div>
          <div style={statLabelStyle}>Total Services</div>
          <div style={statSubtextStyle}>Active listings</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{overallStats.totalBookings}</div>
          <div style={statLabelStyle}>Total Bookings</div>
          <div style={statSubtextStyle}>
            {overallStats.pendingBookings} pending, {overallStats.completedBookings} completed
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{overallStats.averageRating}</div>
          <div style={statLabelStyle}>Average Rating</div>
          <div style={statSubtextStyle}>⭐ {overallStats.totalReviews} total reviews</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{filtered.length}</div>
          <div style={statLabelStyle}>Filtered Results</div>
          <div style={statSubtextStyle}>Showing {filtered.length} of {services.length}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={filtersStyle}>
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          style={selectStyle}
        >
          <option value="">All Categories</option>
          {SERVICE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search services by name..." 
          style={searchInputStyle} 
        />
      </div>

      {/* Service Cards */}
      {loading ? (
        <div style={loadingStyle}>Loading your services...</div>
      ) : filtered.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No services found</div>
          <div style={{ fontSize: 16, color: "#94a3b8" }}>
            {search || category ? "Try adjusting your filters" : "Create your first service to get started"}
          </div>
        </div>
      ) : (
        <div style={serviceGridStyle}>
          {filtered.map(service => {
            const stats = getServiceStats(service._id);
            return (
              <div key={service._id} style={serviceCardStyle}>
                <div style={serviceImageStyle}>
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>
                      📷 No Image
                    </div>
                  )}
                </div>
                <div style={serviceContentStyle}>
                  <div style={serviceTitleStyle}>
                    <span>{service.name}</span>
                    <span style={priceStyle}>{service.pricerange}</span>
                  </div>
                  <div style={categoryStyle}>📂 {service.category}</div>
                  <div style={descriptionStyle}>
                    {service.description || "No description available"}
                  </div>
                  <div style={statsRowStyle}>
                    <div style={ratingStyle}>
                      <span>⭐</span>
                      <span style={{ fontWeight: 600 }}>{stats.avgRating}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>
                        ({stats.reviewCount} reviews)
                      </span>
                    </div>
                    <div style={bookingCountStyle}>
                      📊 {stats.totalBookings} bookings
                    </div>
                  </div>
                  <div style={actionButtonsStyle}>
                    <button 
                      onClick={() => navigate(`/provider-services/edit/${service._id}`)} 
                      style={editButtonStyle}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(service._id)} 
                      style={deleteButtonStyle}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 