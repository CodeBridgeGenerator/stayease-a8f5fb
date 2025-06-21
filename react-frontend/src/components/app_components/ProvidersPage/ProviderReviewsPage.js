import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import client from '../../../services/restClient';
import { FaStar } from 'react-icons/fa';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ProviderReviewsPage() {
    const user = useSelector(state => state.auth.user);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(0);

    useEffect(() => {
        if (!user?._id) return;
        setLoading(true);
        client.service('bookings').find({
            query: {
                providerId: user._id,
                rating: { $ne: null },
                $limit: 200,
                $sort: { createdAt: -1 },
                $populate: [{ path: 'customerId', service: 'users', select: ['name'] }, { path: 'listingId', service: 'listings', select: ['name'] }]
            }
        }).then(res => {
            setReviews(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user?._id]);

    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: 0, count: 0, dist: [0,0,0,0,0], highest: null };
        const total = reviews.reduce((acc, r) => acc + r.rating, 0);
        const dist = [0,0,0,0,0];
        reviews.forEach(r => { dist[5 - r.rating]++; });
        const services = reviews.reduce((acc, r) => {
            const id = r.listingId?._id;
            if (!acc[id]) acc[id] = { total: 0, count: 0, name: r.listingId?.name };
            acc[id].total += r.rating;
            acc[id].count++;
            return acc;
        }, {});
        const highest = Object.values(services).sort((a,b) => (b.total/b.count) - (a.total/a.count))[0];
        return {
            avg: (total / reviews.length).toFixed(1),
            count: reviews.length,
            dist: dist.reverse(),
            highest: highest ? `${highest.name} (${(highest.total / highest.count).toFixed(1)} ★)` : 'N/A'
        };
    }, [reviews]);

    const chartData = {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
            label: 'Review Count',
            data: stats.dist,
            backgroundColor: ['#ef4444', '#f97316', '#facc15', '#a3e635', '#22c55e'],
        }]
    };

    const chartOptions = {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };
    
    const filterOptions = [
        { label: 'All Reviews', value: 0 },
        { label: '5 Stars', value: 5 },
        { label: '4 Stars', value: 4 },
        { label: '3 Stars', value: 3 },
        { label: '2 Stars', value: 2 },
        { label: '1 Star', value: 1 },
    ];

    const filteredReviews = reviews.filter(r => filter === 0 || r.rating === filter);

    return (
        <main style={{ flex: 1, padding: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: 32, color: '#222' }}>Reviews & Ratings</h2>
            <p style={{ color: '#666', fontSize: 18, marginBottom: 32 }}>An overview of your customer feedback and service performance.</p>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginBottom: 32 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px #e5e7ef' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#6366f1' }}>Average Rating</div>
                    <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>{stats.avg} <span style={{ color: '#fbbf24' }}>★</span></div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px #e5e7ef' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#6366f1' }}>Total Reviews</div>
                    <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>{stats.count}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px #e5e7ef' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#6366f1' }}>Highest Rated Service</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: '#22c55e' }}>{stats.highest}</div>
                </div>
            </div>

            {/* Chart and Reviews */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 28 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px #e5e7ef' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Rating Distribution</h3>
                    <Chart type="bar" data={chartData} options={chartOptions} />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 20 }}>Customer Reviews</h3>
                        <Dropdown value={filter} options={filterOptions} onChange={(e) => setFilter(e.value)} placeholder="Filter by rating" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxHeight: 600, overflowY: 'auto', paddingRight: 12 }}>
                        {loading ? <p>Loading reviews...</p> : filteredReviews.map(review => (
                            <div key={review._id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px #e5e7ef' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1' }}>
                                        {getInitials(review.customerId?.name)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{review.customerId?.name || 'Customer'}</div>
                                        <div style={{ color: '#888', fontSize: 14 }}>{review.listingId?.name || 'Service'} on {new Date(review.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                                        {[1,2,3,4,5].map(i => <FaStar key={i} color={i <= review.rating ? '#fbbf24' : '#e5e7eb'} />)}
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: '#444' }}>{review.comment || 'No comment left.'}</p>
                            </div>
                        ))}
                        {!loading && filteredReviews.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No reviews match your filter.</p>}
                    </div>
                </div>
            </div>
        </main>
    );
} 