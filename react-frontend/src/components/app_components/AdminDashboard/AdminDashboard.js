import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../../services/restClient';
import { Chart, registerables } from 'chart.js';
import 'chart.js/auto';
import './AdminDashboard.css';
import AdminSidebar from './AdminSidebar';
import { FaUsers, FaUserTie, FaUserCheck, FaBook, FaCalendarDay, FaStore, FaStar, FaBell, FaTrophy, FaChartLine } from 'react-icons/fa';
import { Dialog } from 'primereact/dialog';

Chart.register(...registerables);

const palette = {
  purple: '#8B5CF6',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  gray: '#F3F4F6',
  white: '#FFFFFF',
  darkGray: '#6B7280',
  darkerGray: '#4B5563',
  border: '#E5E7EB',
};

const StatCard = ({ icon, title, value, color, loading }) => (
  <div style={{ flex: 1, background: palette.white, borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: `0 4px 12px rgba(0,0,0,0.05)` }}>
    <div style={{ background: color, color: palette.white, borderRadius: '50%', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: palette.darkGray, fontSize: 14 }}>{title}</p>
      <p style={{ margin: 0, color: palette.darkerGray, fontSize: 28, fontWeight: 'bold' }}>{loading ? '...' : value}</p>
    </div>
  </div>
);

const ChartContainer = ({ title, children, actionLink }) => (
  <div style={{ background: palette.white, borderRadius: 12, padding: 24, boxShadow: `0 4px 12px rgba(0,0,0,0.05)` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ margin: 0, color: palette.darkerGray, fontSize: 18, fontWeight: 'bold' }}>{title}</h3>
      {actionLink}
    </div>
    {children}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalCustomers: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalShops: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activityDateFilter, setActivityDateFilter] = useState({ start: '', end: '' });

  const userChartRef = useRef(null);
  const bookingsChartRef = useRef(null);
  const servicesChartRef = useRef(null);

  const userChartInstance = useRef(null);
  const bookingsChartInstance = useRef(null);
  const servicesChartInstance = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch users
        const usersRes = await client.service('users').find({ query: { $limit: 1000 } });
        const users = usersRes.data || [];
        const sellers = users.filter(u => u.role === 'provider');
        const customers = users.filter(u => u.role === 'customer');

        // Fetch providers
        const providersRes = await client.service('providers').find({ query: { $limit: 1000 } });
        const providers = providersRes.data || [];

        // Fetch recent activity from audits, ensuring all necessary fields are populated
        const auditsRes = await client.service('audits').find({ 
          query: { 
            $limit: 100, // Fetch more to ensure we have enough data after filtering
            $sort: { createdAt: -1 }, 
            $populate: [
              { path: 'customerId', service: 'users', select: ['name'] }, 
              { path: 'listingId', service: 'listings', select: ['name'] }, 
              { path: 'providerId', service: 'users', select: ['name'] }
            ] 
          } 
        });
        const recentActivity = auditsRes.data || [];

        // Process Recent Activity from Audits
        const activities = recentActivity
          .map(audit => {
            let icon = null; // Start with no icon
            let color = '#888';
            let desc = audit.message || 'An unknown action occurred.'; // Default message

            const customerName = audit.customerId?.name || 'A customer';
            const listingName = audit.listingId?.name || 'a service';

            switch (audit.action) {
              case 'new_booking':
                icon = '🆕';
                color = '#6366f1';
                desc = `${customerName} booked a new service: ${listingName}.`;
                break;
              case 'status_change':
                const status = audit.meta?.to || 'updated';
                if (status === 'completed') { icon = '✅'; color = '#22c55e'; }
                else if (status === 'cancelled') { icon = '❌'; color = '#ef4444'; }
                else { icon = '🔄'; color = '#f59e0b'; }
                desc = `Booking for ${listingName} was marked as ${status}.`;
                break;
              case 'review_left':
                icon = '⭐';
                color = '#facc15';
                desc = `${customerName} left a ${audit.meta?.rating}-star review for ${listingName}.`;
                break;
              default:
                // Keep default icon and color for unhandled actions
                break;
            }
            return { ...audit, icon, color, desc, time: new Date(audit.createdAt).toLocaleDateString(), rawDate: audit.createdAt };
          })
          .filter(activity => activity.icon); // Only include activities that have an icon assigned

        // Fetch bookings with ratings
        const bookingsRes = await client.service('bookings').find({ query: { $sort: { bookingDate: -1 }, $limit: 1000, $populate: ['customerId', 'listingId', 'providerId'] } });
        const bookings = bookingsRes.data || [];
        const today = new Date().toISOString().slice(0, 10);
        const todayBookings = bookings.filter(b => b.bookingDate && b.bookingDate.slice(0, 10) === today);

        // Fetch shops (listings)
        const shopsRes = await client.service('listings').find();
        const shops = shopsRes.data || [];
        
        // Calculate top performers using providers and bookings data
        const providerStats = {};
        
        // Initialize provider stats from the users who are providers
        sellers.forEach(seller => {
          const providerInfo = providers.find(p => p.providerId === seller._id);
          providerStats[seller._id] = {
            provider: seller, // The user object
            totalBookings: 0,
            totalReviews: 0,
            averageRating: 0,
            totalRating: 0,
            performanceScore: 0,
            businessName: providerInfo?.businessName || seller.name,
            imageUrl: providerInfo?.imageUrl || seller.image
          };
        });

        // Calculate booking stats and ratings from bookings collection
        bookings.forEach(booking => {
          // A booking's providerId is the user ID of the provider
          const providerUserId = booking.providerId?._id || booking.providerId;
          if (providerUserId && providerStats[providerUserId]) {
            providerStats[providerUserId].totalBookings++;
            
            // Add rating if available
            if (booking.rating && booking.rating > 0) {
              providerStats[providerUserId].totalReviews++;
              providerStats[providerUserId].totalRating += booking.rating;
            }
          }
        });

        // Calculate average ratings and performance scores
        Object.values(providerStats).forEach(stats => {
          if (stats.totalReviews > 0) {
            stats.averageRating = (stats.totalRating / stats.totalReviews).toFixed(1);
          }
          
          // Performance score calculation:
          // 40% - Average Rating (0-5 scale, normalized to 0-1)
          // 30% - Booking Volume (normalized by max bookings)
          // 30% - Review Engagement (normalized by max reviews)
          const maxBookings = Math.max(...Object.values(providerStats).map(p => p.totalBookings), 1);
          const maxReviews = Math.max(...Object.values(providerStats).map(p => p.totalReviews), 1);
          
          stats.performanceScore = (
            (parseFloat(stats.averageRating) / 5 * 0.4) + 
            (stats.totalBookings / maxBookings * 0.3) + 
            (stats.totalReviews / maxReviews * 0.3)
          );
        });

        // Sort by performance score and get top 5
        const topPerformersList = Object.values(providerStats)
          .filter(stats => stats.totalBookings > 0)
          .sort((a, b) => b.performanceScore - a.performanceScore)
          .slice(0, 5);

        setStats({
          totalUsers: users.filter(u => u.role !== 'admin').length,
          totalSellers: sellers.length,
          totalCustomers: customers.length,
          totalBookings: bookings.length,
          todayBookings: todayBookings.length,
          totalShops: shops.length,
        });
        setRecentBookings(bookings.slice(0, 5));
        setLatestUsers(users.filter(u => u.role !== 'admin').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        setRecentNotifications(activities);
        setTopPerformers(topPerformersList);

        // Chart Data
        // User Distribution
        if (userChartRef.current) {
          if (userChartInstance.current) {
            userChartInstance.current.destroy();
          }
          userChartInstance.current = new Chart(userChartRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Sellers', 'Customers'],
              datasets: [{
                data: [sellers.length, customers.length],
                backgroundColor: [palette.purple, palette.blue],
              }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }

        // Bookings Trend (Last 7 Days)
        if (bookingsChartRef.current) {
          if (bookingsChartInstance.current) {
            bookingsChartInstance.current.destroy();
          }
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().slice(0, 10);
          }).reverse();
          
          const bookingsByDay = last7Days.map(day => 
            bookings.filter(b => b.bookingDate && b.bookingDate.slice(0, 10) === day).length
          );

          bookingsChartInstance.current = new Chart(bookingsChartRef.current, {
            type: 'line',
            data: {
              labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
              datasets: [{
                label: 'Bookings',
                data: bookingsByDay,
                borderColor: palette.green,
                tension: 0.3,
                fill: false,
              }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }

        // Services/Listings per Category
        if (servicesChartRef.current) {
          if (servicesChartInstance.current) {
            servicesChartInstance.current.destroy();
          }
          const categories = shops.reduce((acc, shop) => {
            const category = shop.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {});

          servicesChartInstance.current = new Chart(servicesChartRef.current, {
            type: 'bar',
            data: {
              labels: Object.keys(categories),
              datasets: [{
                label: 'Number of Services',
                data: Object.values(categories),
                backgroundColor: palette.red,
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
          });
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: palette.gray }}>
      <AdminSidebar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: `linear-gradient(90deg, ${palette.blue} 0%, ${palette.purple} 100%)`, color: palette.white, padding: '24px 32px' }}>
          <h1 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Admin Dashboard</h1>
          <p style={{marginTop: 4, opacity: 0.9}}>Welcome back, here's what's happening.</p>
        </div>
        <div style={{ padding: 32 }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
            <StatCard icon={<FaUsers size={24} />} title="Total Users" value={stats.totalUsers} color={palette.purple} loading={loading} />
            <StatCard icon={<FaUserTie size={24} />} title="Total Sellers" value={stats.totalSellers} color={palette.red} loading={loading} />
            <StatCard icon={<FaUserCheck size={24} />} title="Total Customers" value={stats.totalCustomers} color={palette.blue} loading={loading} />
            <StatCard icon={<FaBook size={24} />} title="Total Bookings" value={stats.totalBookings} color={palette.yellow} loading={loading} />
            <StatCard icon={<FaCalendarDay size={24} />} title="Today's Bookings" value={stats.todayBookings} color={palette.green} loading={loading} />
            <StatCard icon={<FaStore size={24} />} title="Total Shops" value={stats.totalShops} color={palette.red} loading={loading} />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
            <ChartContainer title="User Distribution">
              <div style={{ height: 300 }}><canvas ref={userChartRef}></canvas></div>
            </ChartContainer>
            <ChartContainer title="Booking Trend (Last 7 Days)">
              <div style={{ height: 300 }}><canvas ref={bookingsChartRef}></canvas></div>
            </ChartContainer>
            <ChartContainer title="Services by Category">
              <div style={{ height: 300 }}><canvas ref={servicesChartRef}></canvas></div>
            </ChartContainer>
          </div>

          {/* Recent Activities */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: 24 }}>
            <ChartContainer title="Recent Bookings">
              <DataTable 
                headers={['Customer', 'Service', 'Date', 'Amount', 'Status']}
                data={recentBookings}
                renderRow={(b) => (
                  <tr key={b._id}>
                    <td>{b.customerId?.name || 'N/A'}</td>
                    <td>{b.listingId?.name || 'N/A'}</td>
                    <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '-'}</td>
                    <td>{b.listingId?.pricerange || '-'}</td>
                    <td><StatusPill status={b.status} /></td>
                  </tr>
                )}
              />
            </ChartContainer>

            <div style={{ background: palette.white, borderRadius: 12, padding: 24, boxShadow: `0 4px 12px rgba(0,0,0,0.05)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>Recent Activity</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowAllActivity(true); }} style={{ color: '#6366f1', fontWeight: 600 }}>View all</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recentNotifications.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {item.icon && <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>}
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.desc}</div>
                      <div style={{ color: '#888', fontSize: 13 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div style={{marginTop: 24}}>
            <ChartContainer 
              title="Latest Users"
              actionLink={
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }} style={{ color: palette.purple, fontWeight: 600, fontSize: 14 }}>
                  View all users
                </a>
              }
            >
              <DataTable 
                headers={['', 'Name', 'Role', 'Joined']}
                data={latestUsers}
                renderRow={(u) => (
                  <tr key={u._id}>
                    <td><UserAvatar user={u} /></td>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                )}
              />
            </ChartContainer>
          </div>

          <div style={{marginTop: 24}}>
            <ChartContainer title="Top Performers">
              <DataTable 
                headers={['Rank', 'Provider', 'Rating', 'Business', 'Reviews', 'Performance']}
                data={topPerformers}
                renderRow={(performer, index) => (
                  <tr key={performer.provider._id}>
                    <td><PerformanceRank rank={index + 1} /></td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <UserAvatar user={{name: performer.provider.name, image: performer.imageUrl}} />
                        <div>
                          <div style={{fontWeight: 'bold'}}>{performer.provider.name}</div>
                          <div style={{fontSize: 12, color: palette.darkGray}}>{performer.provider.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                        <StarRating rating={parseFloat(performer.averageRating)} />
                        <span style={{fontWeight: 'bold', marginLeft: 4}}>{performer.averageRating}</span>
                      </div>
                    </td>
                    <td style={{fontWeight: 'bold', color: palette.blue}}>{performer.businessName}</td>
                    <td style={{fontWeight: 'bold', color: palette.purple}}>{performer.totalReviews}</td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <div style={{
                          width: 60,
                          height: 8,
                          background: palette.gray,
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${performer.performanceScore * 100}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${palette.green} 0%, ${palette.yellow} 100%)`,
                            borderRadius: 4
                          }} />
                        </div>
                        <span style={{fontSize: 12, fontWeight: 'bold', color: palette.darkerGray}}>
                          {(performer.performanceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </ChartContainer>
          </div>
        </div>
      </div>

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
          {recentNotifications
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
          {recentNotifications.filter(item => {
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

const DataTable = ({ headers, data, renderRow }) => (
  <div style={{overflowX: 'auto'}}>
    <table style={{ width: '100%', borderCollapse: 'collapse', }}>
      <thead>
        <tr>
          {headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: palette.darkGray, background: palette.gray, borderBottom: `2px solid ${palette.border}` }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? data.map(renderRow) : (
          <tr><td colSpan={headers.length} style={{textAlign: 'center', padding: 32, color: palette.darkGray}}>No data available.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const StatusPill = ({ status }) => {
  const style = {
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  };
  const colors = {
    pending: { background: '#FEF3C7', color: '#D97706'},
    confirmed: { background: '#D1FAE5', color: '#059669'},
    cancelled: { background: '#FEE2E2', color: '#DC2626'},
    completed: { background: '#D1FAE5', color: '#059669'},
    'in progress': { background: '#DBEAFE', color: '#1D4ED8'},
  };
  const s = status ? status.toLowerCase() : 'pending';
  return <span style={{...style, ...colors[s]}}>{s}</span>
};

const UserAvatar = ({ user }) => (
  user?.image
    ? <img src={user.image} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
    : <div style={{
      width: 36, height: 36, borderRadius: '50%', background: palette.blue, color: palette.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14
    }}>
      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
    </div>
);

const StarRating = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2, color: palette.yellow }}>
    {[...Array(5)].map((_, i) => <FaStar key={i} color={i < rating ? palette.yellow : palette.border} />)}
  </div>
);

const ActivityIcon = ({ action, meta }) => {
  const getIconAndColor = (action, meta) => {
    switch (action) {
      case 'new_booking': return { icon: '🆕', color: palette.blue };
      case 'status_change':
        if (meta?.to === 'completed') return { icon: '✅', color: palette.green };
        if (meta?.to === 'cancelled') return { icon: '❌', color: palette.red };
        return { icon: '🔄', color: palette.yellow };
      case 'review_left': return { icon: '⭐', color: palette.yellow };
      case 'payment_received': return { icon: '💰', color: palette.green };
      case 'service_completed': return { icon: '✅', color: palette.green };
      default: return { icon: '🔔', color: palette.darkGray };
    }
  };
  
  const { icon, color } = getIconAndColor(action, meta);
  
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', 
      background: `${color}20`, 
      color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16
    }}>
      {icon}
    </div>
  );
};

const PerformanceRank = ({ rank }) => {
  const colors = {
    1: { background: '#FFD700', color: '#000' }, // Gold
    2: { background: '#C0C0C0', color: '#000' }, // Silver
    3: { background: '#CD7F32', color: '#fff' }, // Bronze
  };
  
  const rankColor = colors[rank] || { background: palette.gray, color: palette.darkerGray };
  
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: rankColor.background,
      color: rankColor.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: 14
    }}>
      {rank}
    </div>
  );
}; 