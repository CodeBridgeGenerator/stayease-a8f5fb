import React, { useEffect, useState } from 'react';
import client from '../../../services/restClient';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaStore, FaTag, FaMoneyBillWave } from 'react-icons/fa';
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
};

const PAGE_SIZE = 6;

export default function ShopsManagement() {
    const [shops, setShops] = useState([]);
    const [providers, setProviders] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [form, setForm] = useState({ providerId: '', category: '', name: '', description: '', pricerange: '', location: '', whatsappLink: '', imageUrl: '' });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [page]);

    async function fetchData() {
        setLoading(true);
        const query = {
            $limit: PAGE_SIZE,
            $skip: (page - 1) * PAGE_SIZE,
            $sort: { createdAt: -1 },
            $populate: ['providerId']
        };

        try {
            const res = await client.service("listings").find({ query });
            setShops(res.data);
            setTotal(res.total || 0);
            setProviders(res.providers || []);
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
        setEditingShop(null);
        setForm({ providerId: '', category: '', name: '', description: '', pricerange: '', location: '', whatsappLink: '', imageUrl: '' });
        setShowModal(true);
    }

    function openEditModal(shop) {
        setEditingShop(shop);
        setForm({
            providerId: shop.providerId?._id || '',
            category: shop.category || '',
            name: shop.name || '',
            description: shop.description || '',
            pricerange: shop.pricerange || '',
            location: shop.location || '',
            whatsappLink: shop.whatsappLink || '',
            imageUrl: shop.imageUrl || '',
        });
        setShowModal(true);
    }

    async function handleDelete(shopId) {
        if (!window.confirm('Are you sure you want to delete this shop listing?')) return;
        try {
            await client.service('listings').remove(shopId);
            fetchData();
        } catch (err) {
            setError('Failed to delete shop.');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        const requiredFields = ['providerId', 'category', 'name', 'pricerange', 'location', 'imageUrl'];
        if (requiredFields.some(field => !form[field])) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            const payload = { ...form };
            if (editingShop) {
                await client.service('listings').patch(editingShop._id, payload);
            } else {
                await client.service('listings').create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            const msg = err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'Failed to save shop';
            setError(msg);
        }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const filteredShops = shops.filter(shop =>
        !searchTerm ||
        (shop.name && shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shop.category && shop.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: palette.gray }}>
            <AdminSidebar />
            <div style={{ flex: 1, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0 }}>Shops Management</h2>
                    <button onClick={openAddModal} style={{ background: palette.purple, color: palette.white, fontWeight: 'bold', border: 0, borderRadius: 8, padding: '12px 20px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <FaPlus /> Add New Shop
                    </button>
                </div>

                <div style={{ marginBottom: 24, position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: 16, top: 14, color: palette.darkGray }} />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ width: '100%', padding: '12px 20px 12px 40px', borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 16 }}
                    />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Loading Shops...</p>
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop) => (
                            <ShopCard
                                key={shop._id}
                                shop={shop}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No shops found.</p>
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

            {showModal && <ShopModal shop={editingShop} form={form} setForm={setForm} error={error} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} providers={providers} />}
        </div>
    );
}

const ShopCard = ({ shop, onEdit, onDelete }) => (
    <div style={{ background: palette.white, borderRadius: 12, boxShadow: `0 4px 12px rgba(0,0,0,0.05)`, display: 'flex', flexDirection: 'column' }}>
        <img src={shop.imageUrl || `https://via.placeholder.com/400x200?text=${shop.name}`} alt={shop.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
        <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: 18, color: palette.darkerGray }}>{shop.name}</h3>
            <p style={{ margin: '0 0 12px 0', color: palette.darkGray, display: 'flex', alignItems: 'center', gap: 6 }}><FaStore /> {shop.providerId?.name || 'Unknown Provider'}</p>
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: palette.gray, padding: '4px 8px', borderRadius: 6, fontSize: 12 }}><FaTag /> {shop.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: palette.gray, padding: '4px 8px', borderRadius: 6, fontSize: 12 }}><FaMoneyBillWave /> RM {shop.pricerange}</span>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${palette.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => onEdit(shop)} style={{ ...buttonStyle, background: palette.blue, color: palette.white }}><FaEdit /></button>
                <button onClick={() => onDelete(shop._id)} style={{ ...buttonStyle, background: palette.red, color: palette.white }}><FaTrash /></button>
            </div>
        </div>
    </div>
);

const ShopModal = ({ shop, form, setForm, error, onSubmit, onCancel, providers }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <form onSubmit={onSubmit} style={{ background: palette.white, borderRadius: 12, padding: 32, width: 450, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: 22, margin: '0 0 8px 0', color: palette.darkerGray }}>{shop ? 'Edit Shop' : 'Add New Shop'}</h3>
            {error && <div style={{ color: palette.red, background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: 8, fontWeight: 'bold' }}>{error}</div>}
            
            <select value={form.providerId} onChange={e => setForm(f => ({ ...f, providerId: e.target.value }))} style={inputStyle}>
                <option value="" disabled>Select a Provider</option>
                {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input type="text" placeholder="Shop Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Price Range (e.g., 50-100)" value={form.pricerange} onChange={e => setForm(f => ({ ...f, pricerange: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={inputStyle} />
            <input type="text" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{...inputStyle, height: 80, resize: 'vertical'}}></textarea>
            <input type="text" placeholder="WhatsApp Link" value={form.whatsappLink} onChange={e => setForm(f => ({ ...f, whatsappLink: e.target.value }))} style={inputStyle} />
            
            <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: palette.gray, color: palette.darkerGray }}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, background: palette.purple, color: palette.white }}>{shop ? 'Update Shop' : 'Add Shop'}</button>
            </div>
        </form>
    </div>
);

const inputStyle = { padding: '12px 16px', borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 16, width: '100%', boxSizing: 'border-box' };
const buttonStyle = { fontWeight: 'bold', border: 0, borderRadius: 8, padding: '10px 16px', fontSize: 16, cursor: 'pointer' };
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