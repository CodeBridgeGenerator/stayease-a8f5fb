import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import client from "../../../services/restClient";
import { FaBell, FaChartLine, FaStar, FaWrench, FaCalendarCheck, FaUsers, FaClock } from 'react-icons/fa';
import { Chart } from 'primereact/chart';
import { Dialog } from 'primereact/dialog';

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function ProviderDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user) || { name: "John Smith", role: "Professional Plumber" };
  
  const [provider, setProvider] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingBookings: 0,
    completedBookings: 0,
    totalServices: 0,
    staffCount: 0,
    averageRating: 0,
    reviewCount: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [chartData, setChartData] = useState({});

  // New dashboard state
  const [summary, setSummary] = useState({
    totalServices: 0,
    totalBookings: 0,
    averageRating: 0,
  });
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activityDateFilter, setActivityDateFilter] = useState({ start: '', end: '' });
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingsDateFilter, setBookingsDateFilter] = useState({ start: '', end: '' });

  // Fetch provider profile
  useEffect(() => {
    async function fetchProvider() {
      if (!user._id) return;
      try {
        const res = await client.service("providers").find({ query: { providerId: user._id } });
        if (res.data && res.data.length > 0) {
          setProvider(res.data[0]);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchProvider();
  }, [user._id]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user._id) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const [servicesRes, bookingsRes, staffRes, auditsRes] = await Promise.all([
          client.service("listings").find({ query: { providerId: user._id, $limit: 100 } }),
          client.service("bookings").find({ query: { providerId: user._id, $limit: 200, $sort: { bookingDate: -1 }, $populate: [{ path: 'customerId', service: 'users', select: ['name', 'email'] }] } }),
          client.service("staffinfo").find({ query: {} }),
          client.service("audits").find({ query: { providerId: user._id, $limit: 100, $sort: { createdAt: -1 }, $populate: [{ path: 'customerId', service: 'users', select: ['name'] }, { path: 'listingId', service: 'listings', select: ['name'] }] } })
        ]);
        
        // Process Stats
        const ratedBookings = bookingsRes.data.filter(b => b.rating != null);
        const avgRating = ratedBookings.length ? ratedBookings.reduce((a, b) => a + b.rating, 0) / ratedBookings.length : 0;
        setStats({
          pendingBookings: bookingsRes.data.filter(b => b.status === 'pending').length,
          completedBookings: bookingsRes.data.filter(b => b.status === 'completed').length,
          totalServices: servicesRes.total,
          staffCount: staffRes.total,
          averageRating: avgRating,
          reviewCount: ratedBookings.length,
        });

        // Process Bookings for table
        setBookings(bookingsRes.data.slice(0, 5));

        // Process Recent Activity from Audits
        const activities = auditsRes.data.map(audit => {
          let icon = '🔔'; let color = '#888';
          if (audit.action === 'new_booking') { icon = '🆕'; color = '#6366f1'; }
          if (audit.action === 'status_change' && audit.meta.to === 'completed') { icon = '✅'; color = '#22c55e'; }
          if (audit.action === 'status_change' && audit.meta.to === 'cancelled') { icon = '❌'; color = '#ef4444'; }
          if (audit.action === 'review_left') { icon = '⭐'; color = '#facc15'; }
          return { icon, color, desc: audit.message, time: new Date(audit.createdAt).toLocaleDateString(), rawDate: audit.createdAt };
        });
        setRecentActivity(activities);

        // Process Top Services
        const servicePerformance = bookingsRes.data.reduce((acc, b) => {
          if (!b.listingId) return acc;
          const id = b.listingId.toString();
          if (!acc[id]) acc[id] = { id, name: servicesRes.data.find(s => s._id === id)?.name, bookings: 0, totalRating: 0, countRating: 0 };
          acc[id].bookings++;
          if (b.rating) {
            acc[id].totalRating += b.rating;
            acc[id].countRating++;
          }
          return acc;
        }, {});
        setTopServices(Object.values(servicePerformance).sort((a, b) => b.bookings - a.bookings).slice(0, 3));

        // Process Chart Data
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        }).reverse();
        const bookingsByDay = bookingsRes.data.reduce((acc, b) => {
          const date = new Date(b.createdAt).toLocaleDateString('en-CA');
          if (!acc[date]) acc[date] = 0;
          acc[date]++;
          return acc;
        }, {});
        setChartData({
          labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Bookings',
            data: last30Days.map(d => bookingsByDay[d] || 0),
            fill: true,
            borderColor: '#6366f1',
            tension: 0.4,
            backgroundColor: 'rgba(99, 102, 241, 0.2)'
          }]
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [user._id]);

  // Show toast if redirected with success
  useEffect(() => {
    if (location.state && location.state.success) {
      setShowToast(true);
      // Remove the state after showing toast
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [location.state]);

  const handleEditProfile = () => {
    navigate("/provider-profile-edit");
  };

  const StatCard = ({ icon, title, value, detail, onClick, color = '#6366f1' }) => (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px #e5e7ef', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.03)' } }}>
      <div style={{ background: `${color}20`, color, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
      <div style={{ color: '#888', fontWeight: 600, fontSize: 16 }}>{title}</div>
      <div style={{ color: '#222', fontWeight: 800, fontSize: 28, margin: '4px 0' }}>{value}</div>
      <div style={{ color: '#888', fontSize: 14 }}>{detail}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f8fd" }}>
      {/* Toast Pop-up */}
      {showToast && (
        <div style={{ position: "fixed", top: 30, right: 30, background: "#22c55e", color: "#fff", padding: "16px 32px", borderRadius: 8, fontWeight: 600, fontSize: 18, zIndex: 9999, boxShadow: "0 2px 12px #e5e7ef" }}>
          Profile updated successfully!
        </div>
      )}
      <main style={{ flex: 1, padding: 40, background: "#f7f8fd" }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 32, margin: 0 }}>Welcome back, {user?.name.split(' ')[0]}!</h1>
            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: 18 }}>Here's a snapshot of your business today.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <FaBell size={24} color="#888" />
            <button onClick={() => navigate("/provider-services/create")} style={{ background: "#6366f1", color: "#fff", fontWeight: 700, border: 0, borderRadius: 10, padding: "12px 24px", fontSize: 16, cursor: "pointer" }}>+ New Service</button>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, marginBottom: 32 }}>
          <StatCard icon={<FaClock size={22} />} title="Pending Bookings" value={stats.pendingBookings} detail="Awaiting your approval" onClick={() => navigate('/provider-bookings')} />
          <StatCard icon={<FaCalendarCheck size={22} />} title="Completed Bookings" value={stats.completedBookings} detail="Jobs well done" color="#22c55e" />
          <StatCard icon={<FaStar size={22} />} title="Average Rating" value={stats.averageRating.toFixed(1)} detail={`From ${stats.reviewCount} reviews`} color="#facc15" />
          <StatCard icon={<FaWrench size={22} />} title="Active Services" value={stats.totalServices} detail="Published on your profile" onClick={() => navigate('/provider-services')} color="#f97316" />
          <StatCard icon={<FaUsers size={22} />} title="Team Members" value={stats.staffCount} detail="Ready to be assigned" onClick={() => navigate('/provider-staff')} color="#38bdf8" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Main column */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #e5e7ef', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Bookings last 30 days</h3>
              <Chart type="line" data={chartData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #e5e7ef' }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Upcoming Bookings</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1' }}>{getInitials(b.customerId?.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{b.customerId?.name}</div>
                          <div style={{ color: '#888', fontSize: 14 }}>{b.customerId?.email}</div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: '#444' }}>{new Date(b.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td><span style={{ background: '#dbeafe', color: '#2563eb', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: "4px 14px" }}>{b.status}</span></td>
                      <td><button onClick={() => navigate('/provider-bookings')} style={{ background: '#eef2ff', color: '#6366f1', border: 0, borderRadius: 6, padding: '8px 12px', fontWeight: 600 }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Right column */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #e5e7ef', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20 }}>Recent Activity</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowAllActivity(true); }} style={{ color: '#6366f1', fontWeight: 600 }}>View all</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentActivity.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: item.color, marginTop: 4 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.desc}</div>
                      <div style={{ color: '#888', fontSize: 13 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #e5e7ef' }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Top Performing Services</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topServices.map(s => (
                  <div key={s.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{s.name}</span>
                      <span>{s.bookings} bookings</span>
                    </div>
                    <div style={{ background: '#f3f4f6', height: 8, borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ background: '#22c55e', width: `${(s.bookings / topServices[0].bookings) * 100}%`, height: '100%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Dialog
        header="All Activity"
        visible={showAllActivity}
        onHide={() => setShowAllActivity(false)}
        style={{ width: '600px', maxWidth: '90vw' }}
      >
        <div style={{ marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ fontWeight: 600 }}>Filter by date:</label>
          <input type="date" value={activityDateFilter.start} onChange={e => setActivityDateFilter(f => ({ ...f, start: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
          <span style={{ fontWeight: 600 }}>to</span>
          <input type="date" value={activityDateFilter.end} onChange={e => setActivityDateFilter(f => ({ ...f, end: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {recentActivity
            .filter(item => {
              if (!activityDateFilter.start && !activityDateFilter.end) return true;
              const t = new Date(item.rawDate);
              if (activityDateFilter.start && t < new Date(activityDateFilter.start)) return false;
              if (activityDateFilter.end && t > new Date(activityDateFilter.end + 'T23:59:59')) return false;
              return true;
            })
            .map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#f9fafb', borderRadius: 10, padding: '16px 18px', boxShadow: '0 1px 4px #e5e7ef' }}>
                <span style={{ fontSize: 28, color: item.color }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>{item.desc}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>{new Date(item.rawDate).toLocaleString()}</div>
                </div>
              </div>
            ))}
          {recentActivity.filter(item => {
            if (!activityDateFilter.start && !activityDateFilter.end) return true;
            const t = new Date(item.rawDate);
            if (activityDateFilter.start && t < new Date(activityDateFilter.start)) return false;
            if (activityDateFilter.end && t > new Date(activityDateFilter.end + 'T23:59:59')) return false;
            return true;
          }).length === 0 && (
            <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No activity found for selected date range.</div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default ProviderDashboard; 