import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import client from '../../../services/restClient';
import './ServiceDetailsPage.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaStar, FaUserCircle, FaClock, FaCheckCircle, FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    setError("");

    const fetchAllDetails = async () => {
      try {
        // Fetch service details
        const serviceData = await client.service("listings").get(id, {
          query: { $populate: ['providerId'] }
        });
        setService(serviceData);

        // Set provider from populated data
        if (serviceData.providerId) {
          setProvider(serviceData.providerId);
        }

        // Fetch reviews from the bookings collection
        const bookingsWithReviews = await client.service("bookings").find({
          query: {
            listingId: id,
            rating: { $ne: null },
            comment: { $ne: null, $ne: "" },
            $limit: 10,
            $sort: { createdAt: -1 },
            $populate: ['customerId']
          }
        });
        setReviews(bookingsWithReviews.data);
        
        // To calculate the average rating, we need all rated bookings
        const allRatedBookings = await client.service("bookings").find({
            query: {
                listingId: id,
                rating: { $ne: null }
            }
        });
        
        if (allRatedBookings.total > 0) {
            const totalRating = allRatedBookings.data.reduce((sum, booking) => sum + booking.rating, 0);
            setAverageRating(totalRating / allRatedBookings.total);
        }

        // Fetch similar services
        const similarServicesRes = await client.service("listings").find({
          query: {
            category: serviceData.category,
            _id: { $ne: id },
            $limit: 3
          }
        });
        setSimilarServices(similarServicesRes.data);
        
      } catch (err) {
        console.error("Error loading service details:", err);
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDetails();
  }, [id]);

  useEffect(() => {
    if (user && searchParams.get('bookNow') === '1') {
      setShowBookingModal(true);
    }
  }, [user, searchParams]);

  const handleBookNow = () => {
    if (!user) {
      setShowLoginMessage(true);
      setTimeout(() => {
        setShowLoginMessage(false);
        navigate(`/login?fromBookNow=1&fromServiceId=${id}`);
      }, 1500);
    } else {
      setShowBookingModal(true);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading service details...</div>;
  if (error) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!service) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>Service not found.</div>;

  // Format availability days
  const availableDays = Object.entries(service.availability || {})
    .filter(([day, available]) => available)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
    .join(', ');

  return (
    <div className="sd-container" style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {showLoginMessage && (
        <div className="login-toast-message">You need to login first</div>
      )}

      {/* Header with Background Image */}
      <header className="sd-hero" style={{ 
          height: '400px', 
          background: `url(${service.imageUrl || `https://source.unsplash.com/random/1600x900?service&sig=${service._id}`}) no-repeat center center/cover`, 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'flex-end', 
          padding: '40px' 
        }}>
        <div className="sd-hero-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
        <div className="sd-hero-content" style={{ position: 'relative', color: 'white', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <span style={{ background: '#3b82f6', padding: '6px 12px', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600 }}>{service.category}</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '10px 0' }}>{service.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaStar color="#facc15" /> <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaMapMarkerAlt /> <span>{service.location}</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="sd-main-layout" style={{ maxWidth: 1200, margin: '40px auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        {/* Left Column */}
        <div className="sd-main-content">
          <InfoCard title="About This Service">
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.6 }}>{service.description}</p>
          </InfoCard>

          {provider && (
            <InfoCard title="Service Provider">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {provider.imageUrl ? 
                  <img src={provider.imageUrl} alt={provider.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} /> :
                  <FaUserCircle size={60} color="#ccc" />
                }
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{provider.name}</h4>
                  <p style={{ margin: '4px 0 0', color: '#555' }}>Member since {new Date(provider.createdAt).toLocaleDateString()}</p>
                  <a href={`/provider/${provider._id}`} style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View Profile</a>
                </div>
              </div>
            </InfoCard>
          )}

          <InfoCard title="Availability">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaCalendarAlt color="#3b82f6" size={20} />
                <div>
                  <h5 style={{ margin: 0, fontWeight: 600 }}>Available Days</h5>
                  <p style={{ margin: 0, color: '#555' }}>{availableDays || 'Not specified'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaClock color="#3b82f6" size={20} />
                <div>
                  <h5 style={{ margin: 0, fontWeight: 600 }}>Service Hours</h5>
                  <p style={{ margin: 0, color: '#555' }}>{service.startTime || 'N/A'} - {service.endTime || 'N/A'}</p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title={`Reviews (${reviews.length})`}>
            {reviews.length > 0 ? (
              reviews.map(review => <ReviewItem key={review._id} review={review} />)
            ) : (
              <p style={{ color: '#555' }}>No reviews yet for this service.</p>
            )}
          </InfoCard>

        </div>
        
        {/* Right Column (Sidebar) */}
        <aside className="sd-sidebar">
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', padding: 28, position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '2rem' }}>RM{service.pricerange}</span>
              <span style={{ color: '#555', fontSize: '1rem' }}>/service</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 600, marginBottom: 16 }}>
              <FaCheckCircle /> Available for booking
            </div>
            <button style={{ width: '100%', background: '#3b82f6', color: '#fff', fontWeight: 700, border: 0, borderRadius: 8, padding: '16px 0', fontSize: '1.1rem', cursor: 'pointer' }} onClick={handleBookNow}>Book Now</button>
            <div style={{ marginTop: 16, textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>Fast response times!</div>
          </div>
          
          <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', padding: 20 }}>
            <h5 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '1rem' }}>Share this service</h5>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <SocialShareIcon icon={<FaFacebook />} />
              <SocialShareIcon icon={<FaTwitter />} />
              <SocialShareIcon icon={<FaWhatsapp />} />
              <SocialShareIcon icon={<FaLink />} />
            </div>
          </div>
        </aside>
      </div>

      {similarServices.length > 0 && (
          <section className="sd-similar-services" style={{ padding: '40px 0', background: '#eef2ff' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 30 }}>Similar Services</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {similarServices.map(s => (
                        <div key={s._id} onClick={() => navigate(`/services/${s._id}`)} style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', cursor: 'pointer' }}>
                            <img src={s.imageUrl || `https://source.unsplash.com/random/300x200?service&sig=${s._id}`} alt={s.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                            <div style={{ padding: 16 }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '1rem' }}>{s.name}</h4>
                                <p style={{ color: '#555', margin: 0, fontSize: '0.9rem' }}>{s.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {showBookingModal && <BookingInquiryModal service={service} onClose={() => setShowBookingModal(false)} />}
    </div>
  );
}

const InfoCard = ({ title, children }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
    <h3 style={{ margin: '0 0 16px', fontSize: '1.4rem', fontWeight: 700, borderBottom: '1px solid #eee', paddingBottom: 12 }}>{title}</h3>
    {children}
  </div>
);

const ReviewItem = ({ review }) => (
  <div style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      {review.customerId?.image ? 
        <img src={review.customerId.image} alt={review.customerId.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> :
        <FaUserCircle size={40} color="#ccc" />
      }
      <div>
        <h5 style={{ margin: 0, fontWeight: 600 }}>{review.customerId?.name || 'Anonymous'}</h5>
        <div style={{ display: 'flex', gap: 2, color: '#facc15' }}>
          {[...Array(5)].map((_, i) => <FaStar key={i} color={i < review.rating ? '#facc15' : '#e5e7eb'} />)}
        </div>
      </div>
    </div>
    <p style={{ color: '#555', margin: 0 }}>{review.comment}</p>
  </div>
);

const SocialShareIcon = ({ icon }) => (
  <a href="#" style={{ color: '#555', background: '#f0f0f0', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>{icon}</a>
);

// Booking Inquiry Modal Component
function BookingInquiryModal({ service, onClose }) {
  const user = useSelector(state => state.auth.user);
  const [selectedService, setSelectedService] = useState(service.name || "");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProceed = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    // 1. Check for duplicate booking
    try {
      const existing = await client.service('bookings').find({
        query: {
          customerId: user?._id,
          listingId: service._id,
          bookingDate: new Date(date)
        }
      });
      if (existing.total > 0) {
        setError('You have already made a booking for this service on this date.');
        setLoading(false);
        return;
      }
      // 2. Prepare booking data for backend schema
      const bookingData = {
        listingId: service._id,
        customerId: user?._id,
        providerId: service.providerId,
        bookingDate: new Date(date),
        status: 'pending',
        notes,
        createdBy: user._id,
        updatedBy: user._id
      };
      await client.service('bookings').create(bookingData);
      setSuccess('Booking created! Redirecting to WhatsApp...');
      setTimeout(() => {
        const message = `Booking Inquiry:%0AService: ${selectedService}%0ALocation: ${location}%0ADate: ${date}%0ANotes: ${notes}`;
        const phone = service.whatsappLink.replace(/[^\d]/g, '');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        setLoading(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-content">
        <button className="booking-modal-close" onClick={onClose}>×</button>
        <h2>Quick Booking Inquiry</h2>
        <p>Please answer a few quick questions to help the service provider assist you better.</p>
        <div className="booking-modal-form-group">
          <label>Which service do you need?*</label>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)} required>
            <option value="">Select a service</option>
            <option value={service.name}>{service.name}</option>
          </select>
        </div>
        <div className="booking-modal-form-group">
          <label>Where is your homestay located?*</label>
          <input type="text" placeholder="e.g., Bangi, Selangor" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div className="booking-modal-form-group">
          <label>Preferred date of service*</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="booking-modal-form-group">
          <label>Additional notes (optional)</label>
          <textarea placeholder="e.g., Urgent post-guest cleanup" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
        <button className="booking-modal-whatsapp-btn" onClick={handleProceed} disabled={loading}>
          {loading ? 'Saving booking...' : <><span role="img" aria-label="whatsapp">🟢</span> Proceed to WhatsApp</>}
        </button>
      </div>
    </div>
  );
} 