import React, { useEffect, useState } from 'react';
import client from '../../../services/restClient';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';

const palette = {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    gray: '#F3F4F6',
    white: '#FFFFFF',
    darkGray: '#6B7280',
    darkerGray: '#4B5563',
    border: '#E5E7EB',
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
};

const PAGE_SIZE = 5;

const StatusPill = ({ status }) => {
    const s = (status || '').toLowerCase();
    const style = {
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize'
    };
    const colors = {
        pending: { background: palette.yellow, color: palette.white },
        confirmed: { background: palette.green, color: palette.white },
        cancelled: { background: palette.red, color: palette.white },
        completed: { background: palette.blue, color: palette.white },
        'in progress': { background: palette.purple, color: palette.white },
    };
    const currentStyle = colors[s] || { background: palette.gray, color: palette.darkerGray };
    return <span style={{ ...style, ...currentStyle }}>{s}</span>;
};

export default function BookingsManagement() {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [form, setForm] = useState({ listingId: '', customerId: '', providerId: '', bookingDate: '', status: 'pending', notes: '' });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [page]);

    async function fetchData() {
        setLoading(true);
        try {
            const bookingQuery = {
                $limit: PAGE_SIZE,
                $skip: (page - 1) * PAGE_SIZE,
                $sort: { createdAt: -1 },
                $populate: ['listingId', 'customerId', 'providerId']
            };

            const [bookingsRes, usersRes, listingsRes] = await Promise.all([
                client.service('bookings').find({ query: bookingQuery }),
                client.service('users').find({ query: { $limit: 1000 } }),
                client.service('listings').find({ query: { $limit: 1000 } })
            ]);
            
            setBookings(bookingsRes.data || []);
            setTotal(bookingsRes.total || 0);
            setUsers(usersRes.data || []);
            setListings(listingsRes.data || []);
        } catch (err) {
            setError('Failed to fetch data');
        }
        setLoading(false);
    }

    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
        setPage(1);
    }

    function openAddModal() {
        setEditingBooking(null);
        setForm({ listingId: '', customerId: '', providerId: '', bookingDate: '', status: 'pending', notes: '' });
        setShowModal(true);
    }

    function openEditModal(booking) {
        setEditingBooking(booking);
        setForm({
            listingId: booking.listingId?._id || '',
            customerId: booking.customerId?._id || '',
            providerId: booking.providerId?._id || '',
            bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().slice(0, 10) : '',
            status: booking.status || '',
            notes: booking.notes || '',
        });
        setShowModal(true);
    }

    async function handleDelete(bookingId) {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            await client.service('bookings').remove(bookingId);
            fetchData();
        } catch (err) {
            setError('Failed to delete booking.');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!form.listingId || !form.customerId || !form.bookingDate || !form.status) {
            setError('All fields are required');
            return;
        }

        try {
            const payload = { ...form, providerId: listings.find(l => l._id === form.listingId)?.providerId };
            if (editingBooking) {
                await client.service('bookings').patch(editingBooking._id, payload);
            } else {
                await client.service('bookings').create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            const msg = err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'Failed to save booking';
            setError(msg);
        }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    
    const filteredBookings = bookings.filter(b => 
        !searchTerm ||
        (b.customerId?.name && b.customerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.providerId?.name && b.providerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.listingId?.name && b.listingId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: palette.gray }}>
            <AdminSidebar />
            <div style={{ flex: 1, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Bookings Management</h2>
                    <button onClick={openAddModal} style={{ background: palette.purple, color: palette.white, fontWeight: 'bold', border: 0, borderRadius: 8, padding: '12px 20px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <FaPlus /> Add New Booking
                    </button>
                </div>

                <div style={{ marginBottom: 24, position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: 16, top: 14, color: palette.darkGray }} />
                    <input
                        type="text"
                        placeholder="Search by customer, provider, or service..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ width: '100%', padding: '12px 20px 12px 40px', borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 16 }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Loading bookings...</p>
                    ) : filteredBookings.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>No bookings found.</p>
                    ) : (
                        filteredBookings.map(booking => <BookingCard key={booking._id} booking={booking} onEdit={openEditModal} onDelete={handleDelete} />)
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 8 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={paginationButtonStyle}><FaChevronLeft /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                            <button
                                key={pageNumber}
                                onClick={() => setPage(pageNumber)}
                                style={{
                                    ...paginationButtonStyle,
                                    background: page === pageNumber ? palette.purple : palette.white,
                                    color: page === pageNumber ? palette.white : palette.darkerGray,
                                }}
                            >
                                {pageNumber}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={paginationButtonStyle}><FaChevronRight /></button>
                    </div>
                )}
            </div>

            {showModal && <BookingModal booking={editingBooking} form={form} setForm={setForm} error={error} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} users={users} listings={listings}/>}
        </div>
    );
}

const BookingCard = ({ booking, onEdit, onDelete }) => (
    <div style={{ background: palette.white, borderRadius: 12, padding: 24, boxShadow: `0 4px 12px rgba(0,0,0,0.05)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h3 style={{ margin: 0, fontWeight: 'bold', color: palette.darkerGray, fontSize: 18 }}>{booking.listingId?.name || 'Service Not Found'}</h3>
                <p style={{ margin: '4px 0', color: palette.darkGray }}>
                    Customer: <span style={{ fontWeight: 'bold' }}>{booking.customerId?.name || 'N/A'}</span>
                </p>
                <p style={{ margin: '4px 0', color: palette.darkGray }}>
                    Provider: <span style={{ fontWeight: 'bold' }}>{booking.providerId?.name || 'N/A'}</span>
                </p>
            </div>
            <div style={{textAlign: 'right'}}>
                <StatusPill status={booking.status} />
                <p style={{ margin: '8px 0 0', fontWeight: 'bold', fontSize: 20, color: palette.purple }}>
                    RM{booking.listingId?.pricerange || '0.00'}
                </p>
            </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.darkGray }}>
                <FaCalendarAlt />
                <span>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'No Date'}</span>
            </div>
            <div>
                <button onClick={() => onEdit(booking)} style={{ background: 'none', border: 'none', color: palette.blue, fontSize: 18, cursor: 'pointer', marginRight: 12 }}><FaEdit /></button>
                <button onClick={() => onDelete(booking._id)} style={{ background: 'none', border: 'none', color: palette.red, fontSize: 18, cursor: 'pointer' }}><FaTrash /></button>
            </div>
        </div>
    </div>
);

const BookingModal = ({ booking, form, setForm, error, onSubmit, onCancel, users, listings }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <form onSubmit={onSubmit} style={{ background: palette.white, borderRadius: 12, padding: 32, width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: 22, margin: '0 0 8px 0', color: palette.darkerGray }}>{booking ? 'Edit Booking' : 'Add New Booking'}</h3>
            {error && <div style={{ color: palette.red, background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: 8, fontWeight: 'bold' }}>{error}</div>}
            
            <select value={form.listingId} onChange={e => setForm(f => ({ ...f, listingId: e.target.value }))} style={inputStyle}>
                <option value="" disabled>Select a Service</option>
                {listings.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>

            <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} style={inputStyle}>
                <option value="" disabled>Select a Customer</option>
                {users.filter(u => u.role === 'customer').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>

            <input type="date" value={form.bookingDate} onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))} style={inputStyle} />
            
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{...inputStyle, height: 80, resize: 'vertical'}}></textarea>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: palette.gray, color: palette.darkerGray }}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, background: palette.purple, color: palette.white }}>{booking ? 'Update Booking' : 'Add Booking'}</button>
            </div>
        </form>
    </div>
);

const inputStyle = { padding: '12px 16px', borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 16, width: '100%' };
const buttonStyle = { fontWeight: 'bold', border: 0, borderRadius: 8, padding: '12px 20px', fontSize: 16, cursor: 'pointer' };
const paginationButtonStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: `1px solid ${palette.border}`,
    background: palette.white,
    color: palette.darkerGray,
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}; 