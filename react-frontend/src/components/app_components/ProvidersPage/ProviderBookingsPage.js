import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import client from "../../../services/restClient";
import { useDispatch } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FaStar, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaRegClock, FaStickyNote, FaIdBadge } from 'react-icons/fa';

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_COLORS = {
  new: "#fef3c7",
  confirmed: "#dbeafe",
  "in progress": "#d1fae5",
  completed: "#dcfce7",
  cancelled: "#fee2e2",
};

const STATUS_BADGE_COLORS = {
  new: "#f59e0b",
  confirmed: "#3b82f6",
  "in progress": "#10b981",
  completed: "#059669",
  cancelled: "#dc2626",
};

const ProviderBookingsPage = (props) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const dispatch = useDispatch ? useDispatch() : null;
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [timeSlot, setTimeSlot] = useState("");
  const [providerNotes, setProviderNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    client
      .service("bookings")
      .find({
        query: {
          providerId: props.user?._id,
          $limit: 100,
          $sort: { createdAt: -1 },
          $populate: [
            { path: "listingId", service: "listings" },
            { path: "customerId", service: "users" },
          ],
        },
      })
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [props.user?._id]);

  // Fetch staff list for dropdown
  useEffect(() => {
    client.service("staffinfo").find({ query: { $limit: 100 } }).then(res => {
      setStaffList(res.data);
    });
  }, []);

  // Map status for UI
  const mapStatus = (status) => {
    if (!status) return "new";
    const s = status.toLowerCase();
    if (s === "pending") return "new";
    if (s === "confirmed") return "confirmed";
    if (s === "in progress") return "in progress";
    if (s === "completed") return "completed";
    if (s === "cancelled") return "cancelled";
    return s;
  };

  // Count for badge
  const getTabCount = (tab) => {
    if (tab.value === "all") return bookings.length;
    return bookings.filter((b) => mapStatus(b.status) === tab.value).length;
  };

  // Filter bookings by tab and search
  const filteredBookings = bookings.filter((b) => {
    const status = mapStatus(b.status);
    const matchesTab = activeTab === "all" ? true : status === activeTab;
    const customer = b.customerId?.name?.toLowerCase() || "";
    const service = b.listingId?.name?.toLowerCase() || "";
    const matchesSearch =
      customer.includes(search.toLowerCase()) ||
      service.includes(search.toLowerCase()) ||
      (b._id && b._id.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate booking statistics
  const bookingStats = {
    total: bookings.length,
    new: bookings.filter(b => mapStatus(b.status) === "new").length,
    confirmed: bookings.filter(b => mapStatus(b.status) === "confirmed").length,
    inProgress: bookings.filter(b => mapStatus(b.status) === "in progress").length,
    completed: bookings.filter(b => mapStatus(b.status) === "completed").length,
    cancelled: bookings.filter(b => mapStatus(b.status) === "cancelled").length,
    averageRating: bookings.filter(b => b.rating).length ? 
      (bookings.filter(b => b.rating).reduce((a, b) => a + b.rating, 0) / bookings.filter(b => b.rating).length).toFixed(1) : '0.0'
  };

  const getStatusBadge = (status) => (
    <span
      style={{
        background: STATUS_BADGE_COLORS[status] || "#e5e7eb",
        color: "#ffffff",
        padding: "6px 16px",
        borderRadius: 20,
        fontWeight: 700,
        fontSize: 13,
        display: "inline-block",
        letterSpacing: 0.5,
        textTransform: "uppercase"
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  // Accept booking
  const handleAccept = (booking) => {
    setSelectedBooking(booking);
    setShowAcceptModal(true);
  };

  // New function to submit accept with new fields
  const handleAcceptSubmit = async () => {
    if (!selectedBooking) return;
    setActionLoading((prev) => ({ ...prev, [selectedBooking._id]: true }));
    try {
      await client.service("bookings").patch(selectedBooking._id, {
        status: "confirmed",
        assignedStaff: assignedStaff?._id,
        timeSlot,
        providerNotes
      });
      fetchBookings();
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "success", message: "Booking accepted." });
    } catch (err) {
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "error", message: "Failed to accept booking." });
    }
    setActionLoading((prev) => ({ ...prev, [selectedBooking._id]: false }));
    setShowAcceptModal(false);
    setSelectedBooking(null);
    setAssignedStaff(null);
    setTimeSlot("");
    setProviderNotes("");
  };

  // Add new function to handle marking booking as in progress
  const handleMarkAsInProgress = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await client.service("bookings").patch(bookingId, { status: "in progress" });
      fetchBookings();
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "success", message: "Booking marked as in progress." });
    } catch (err) {
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "error", message: "Failed to update booking status." });
    }
    setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  // Add new function to handle marking booking as completed
  const handleMarkAsCompleted = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await client.service("bookings").patch(bookingId, { status: "completed" });
      fetchBookings();
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "success", message: "Booking marked as completed." });
    } catch (err) {
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "error", message: "Failed to mark booking as completed." });
    }
    setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  // Decline booking
  const handleDecline = async (bookingId) => {
    if (!window.confirm("Are you sure you want to decline this booking?")) return;
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await client.service("bookings").patch(bookingId, { status: "cancelled" });
      fetchBookings();
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "success", message: "Booking declined." });
    } catch (err) {
      if (dispatch) dispatch.toast && dispatch.toast.alert && dispatch.toast.alert({ title: "Booking", type: "error", message: "Failed to decline booking." });
    }
    setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  // View Details
  const handleViewDetails = (booking) => {
    setDetailsBooking(booking);
    setShowDetailsModal(true);
  };

  // --- UI Styles ---
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc'
  };
  const mainContentStyle = {
    flex: 1,
    maxWidth: 1400,
    margin: "40px auto",
    padding: "0 32px"
  };
  const headerStyle = {
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
  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 32
  };
  const statCardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
    textAlign: "center"
  };
  const statValueStyle = {
    fontWeight: 800,
    fontSize: 32,
    color: "#1e293b",
    marginBottom: 8
  };
  const statLabelStyle = {
    fontWeight: 600,
    fontSize: 14,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5
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
  const tabContainerStyle = {
    display: "flex",
    gap: 4,
    flex: 1
  };
  const tabButtonStyle = (isActive) => ({
    background: isActive ? "#3b82f6" : "#f1f5f9",
    color: isActive ? "#ffffff" : "#64748b",
    border: 0,
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: 8
  });
  const searchInputStyle = {
    padding: "12px 16px",
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    fontSize: 15,
    fontWeight: 500,
    color: "#1e293b",
    background: "#ffffff",
    minWidth: 250
  };
  const bookingCardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    marginBottom: 20
  };
  const bookingHeaderStyle = {
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid #f1f5f9"
  };
  const bookingContentStyle = {
    padding: "20px 24px 24px 24px"
  };
  const serviceInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16
  };
  const serviceImageStyle = {
    width: 60,
    height: 60,
    borderRadius: 12,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  };
  const serviceDetailsStyle = {
    flex: 1
  };
  const serviceNameStyle = {
    fontWeight: 700,
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 4
  };
  const serviceCategoryStyle = {
    color: "#6366f1",
    fontWeight: 600,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  const bookingIdStyle = {
    color: "#64748b",
    fontWeight: 600,
    fontSize: 14,
    textAlign: "right"
  };
  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 20
  };
  const infoItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8
  };
  const infoLabelStyle = {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  const infoValueStyle = {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: 600
  };
  const actionButtonsStyle = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  };
  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const secondaryButtonStyle = {
    background: "#ffffff",
    color: "#3b82f6",
    border: "2px solid #3b82f6",
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const dangerButtonStyle = {
    background: "#ffffff",
    color: "#dc2626",
    border: "2px solid #dc2626",
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const successButtonStyle = {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease"
  };
  const warningButtonStyle = {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease"
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

  // Booking Details Modal
  const renderDetailsModal = () => {
    if (!detailsBooking) return null;
    const status = mapStatus(detailsBooking.status);
    const customer = detailsBooking.customerId;
    const listing = detailsBooking.listingId;
    return (
      <Dialog
        header="Booking Details"
        visible={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        style={{ width: "600px", maxWidth: "95vw" }}
        modal
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {listing?.imageUrl && (
              <img 
                src={listing.imageUrl} 
                alt={listing.name} 
                style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }} 
              />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1e293b' }}>{listing?.name || 'Service'}</div>
              <div style={{ color: '#6366f1', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>{listing?.category}</div>
              <div style={{ marginTop: 8 }}>{getStatusBadge(status)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
              <FaUser /> Customer: <span style={{ color: '#1e293b', fontWeight: 500 }}>{customer?.name || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
              <FaCalendarAlt /> Date: <span style={{ color: '#1e293b', fontWeight: 500 }}>{detailsBooking.bookingDate ? new Date(detailsBooking.bookingDate).toLocaleDateString() : '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
              <FaMapMarkerAlt /> Location: <span style={{ color: '#1e293b', fontWeight: 500 }}>{detailsBooking.location || '-'}</span>
            </div>
            {detailsBooking.timeSlot && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
                <FaRegClock /> Time Slot: <span style={{ color: '#1e293b', fontWeight: 500 }}>{detailsBooking.timeSlot}</span>
              </div>
            )}
            {detailsBooking.assignedStaff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
                <FaIdBadge /> Assigned Staff: <span style={{ color: '#1e293b', fontWeight: 500 }}>{typeof detailsBooking.assignedStaff === 'object' ? detailsBooking.assignedStaff.name : detailsBooking.assignedStaff}</span>
              </div>
            )}
            {detailsBooking.pricerange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 600 }}>
                <FaMoneyBillWave /> Price: <span style={{ color: '#1e293b', fontWeight: 500 }}>{detailsBooking.pricerange}</span>
              </div>
            )}
          </div>
          {detailsBooking.providerNotes && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaStickyNote /> Provider Notes:
              </div>
              <div style={{ color: '#1e293b', fontSize: 15 }}>{detailsBooking.providerNotes}</div>
            </div>
          )}
          <div style={{ color: '#64748b', fontSize: 13, padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
            Created: {detailsBooking.createdAt ? new Date(detailsBooking.createdAt).toLocaleString() : '-'}<br />
            Updated: {detailsBooking.updatedAt ? new Date(detailsBooking.updatedAt).toLocaleString() : '-'}
          </div>
          {(detailsBooking.rating || detailsBooking.comment) && (
            <div style={{ background: '#fef3c7', borderRadius: 12, padding: 20, border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} color={i < Math.round(detailsBooking.rating || 0) ? '#f59e0b' : '#d1d5db'} size={20} />
                ))}
                <span style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>{detailsBooking.rating ? detailsBooking.rating.toFixed(1) : '-'}</span>
              </div>
              <div style={{ color: '#92400e', fontSize: 15, textAlign: 'center' }}>
                {detailsBooking.comment || <span style={{ color: '#a3a3a3' }}>(No comment left)</span>}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    );
  };

  // Accept modal JSX
  const renderAcceptModal = () => (
    <Dialog
      header="Accept Booking"
      visible={showAcceptModal}
      onHide={() => setShowAcceptModal(false)}
      style={{ width: "500px" }}
      modal
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            onClick={() => setShowAcceptModal(false)} 
            className="p-button-text" 
            style={{ background: '#f1f5f9', color: '#64748b', border: 0, borderRadius: 8, fontWeight: 600 }}
          />
          <Button 
            label="Accept Booking" 
            icon="pi pi-check" 
            onClick={handleAcceptSubmit} 
            autoFocus 
            style={{ background: '#3b82f6', color: '#ffffff', border: 0, borderRadius: 8, fontWeight: 600 }}
          />
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#1e293b' }}>Assign Staff</label>
          <Dropdown
            value={assignedStaff}
            options={staffList}
            onChange={(e) => setAssignedStaff(e.value)}
            optionLabel="name"
            placeholder="Select Staff"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#1e293b' }}>Time Slot</label>
          <input
            type="time"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '2px solid #e2e8f0',
              fontSize: '15px',
              color: '#1e293b'
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#1e293b' }}>Provider Notes</label>
          <InputTextarea
            value={providerNotes}
            onChange={(e) => setProviderNotes(e.target.value)}
            rows={4}
            placeholder="Enter any additional notes for this booking..."
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '2px solid #e2e8f0',
              fontSize: '15px',
              color: '#1e293b',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    </Dialog>
  );

  return (
    <div style={mainContentStyle}>
      {renderAcceptModal()}
      {renderDetailsModal()}
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Manage Bookings</h1>
        <p style={subtitleStyle}>Track and manage all your service bookings</p>
      </div>

      {/* Statistics Cards */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.total}</div>
          <div style={statLabelStyle}>Total Bookings</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.new}</div>
          <div style={statLabelStyle}>New Requests</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.confirmed}</div>
          <div style={statLabelStyle}>Confirmed</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.inProgress}</div>
          <div style={statLabelStyle}>In Progress</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.completed}</div>
          <div style={statLabelStyle}>Completed</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{bookingStats.averageRating}</div>
          <div style={statLabelStyle}>Avg Rating</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={filtersStyle}>
        <div style={tabContainerStyle}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
              style={tabButtonStyle(activeTab === tab.value)}
              >
                {tab.label}
                {getTabCount(tab) > 0 && (
                  <span style={{
                  background: activeTab === tab.value ? "#ffffff" : "#3b82f6",
                  color: activeTab === tab.value ? "#3b82f6" : "#ffffff",
                    borderRadius: 12,
                  fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 6px",
                  minWidth: 20,
                  textAlign: "center"
                }}>
                  {getTabCount(tab)}
                </span>
                )}
              </button>
            ))}
          </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Booking Cards */}
      {loading ? (
        <div style={loadingStyle}>Loading your bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No bookings found</div>
          <div style={{ fontSize: 16, color: "#94a3b8" }}>
            {search || activeTab !== "all" ? "Try adjusting your filters" : "You'll see new booking requests here"}
          </div>
        </div>
        ) : (
        <div>
            {filteredBookings.map((booking) => {
              const status = mapStatus(booking.status);
              const customer = booking.customerId;
              const listing = booking.listingId;
              return (
              <div key={booking._id} style={bookingCardStyle}>
                <div style={bookingHeaderStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={serviceInfoStyle}>
                      <div style={serviceImageStyle}>
                        {listing?.imageUrl ? (
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 20 }}>📷</span>
                        )}
                      </div>
                      <div style={serviceDetailsStyle}>
                        <div style={serviceNameStyle}>{listing?.name || "Service"}</div>
                        <div style={serviceCategoryStyle}>{listing?.category}</div>
                      </div>
                    </div>
                    <div style={bookingIdStyle}>
                      <div>Booking ID</div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
                        #BK-{booking._id?.slice(-6) || "-"}
                      </div>
                          </div>
                        </div>
                  <div style={{ marginTop: 16 }}>{getStatusBadge(status)}</div>
                </div>
                
                <div style={bookingContentStyle}>
                  <div style={infoGridStyle}>
                    <div style={infoItemStyle}>
                      <span style={{ color: "#3b82f6", fontSize: 16 }}>👤</span>
                        <div>
                        <div style={infoLabelStyle}>Customer</div>
                        <div style={infoValueStyle}>{customer?.name || "-"}</div>
                      </div>
                        </div>
                    <div style={infoItemStyle}>
                      <span style={{ color: "#3b82f6", fontSize: 16 }}>📅</span>
                        <div>
                        <div style={infoLabelStyle}>Service Date</div>
                        <div style={infoValueStyle}>
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "-"}
                        </div>
                      </div>
                    </div>
                    <div style={infoItemStyle}>
                      <span style={{ color: "#3b82f6", fontSize: 16 }}>📍</span>
                      <div>
                        <div style={infoLabelStyle}>Location</div>
                        <div style={infoValueStyle}>{booking.location || "-"}</div>
                      </div>
                    </div>
                    <div style={infoItemStyle}>
                      <span style={{ color: "#3b82f6", fontSize: 16 }}>💰</span>
                      <div>
                        <div style={infoLabelStyle}>Price</div>
                        <div style={infoValueStyle}>{booking.pricerange || listing?.pricerange || "-"}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={actionButtonsStyle}>
                    {status === "new" && (
                      <button
                        style={primaryButtonStyle}
                        onClick={() => handleAccept(booking)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? "Accepting..." : "✅ Accept Booking"}
                      </button>
                    )}
                    {status === "confirmed" && (
                      <button
                        style={warningButtonStyle}
                        onClick={() => handleMarkAsInProgress(booking._id)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? "Updating..." : "🚀 Start Work"}
                      </button>
                    )}
                    {status === "in progress" && (
                      <button
                        style={successButtonStyle}
                        onClick={() => handleMarkAsCompleted(booking._id)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? "Updating..." : "✅ Complete"}
                      </button>
                    )}
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => handleViewDetails(booking)}
                    >
                      👁️ View Details
                    </button>
                    {status === "new" && (
                      <button
                        style={dangerButtonStyle}
                        onClick={() => handleDecline(booking._id)}
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] ? "Declining..." : "❌ Decline"}
                      </button>
                    )}
                    {status === "completed" && (booking.rating || booking.comment) && (
                      <button
                        style={warningButtonStyle}
                        onClick={() => { setReviewBooking(booking); setShowReviewModal(true); }}
                      >
                        ⭐ View Review
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      
      {showReviewModal && reviewBooking && (
        <Dialog
          header="Customer Review"
          visible={showReviewModal}
          onHide={() => setShowReviewModal(false)}
          style={{ width: "400px" }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} color={i < Math.round(reviewBooking.rating || 0) ? '#f59e0b' : '#d1d5db'} size={24} />
              ))}
              <span style={{ marginLeft: 8, fontWeight: 700, fontSize: 20, color: '#92400e' }}>
                {reviewBooking.rating ? reviewBooking.rating.toFixed(1) : '-'}
              </span>
            </div>
            <div style={{ color: '#1e293b', fontSize: 16, textAlign: 'center', lineHeight: 1.6 }}>
              {reviewBooking.comment || <span style={{ color: '#94a3b8' }}>(No comment left)</span>}
            </div>
      </div>
        </Dialog>
      )}
    </div>
  );
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};

export default connect(mapState)(ProviderBookingsPage); 