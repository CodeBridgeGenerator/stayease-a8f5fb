import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import client from "../../../services/restClient";
import "./ServicesPage.css";
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaStar, FaBuilding } from 'react-icons/fa';

import Notification from '../../common/Notification';

const mockCategories = [
  "All Services", "Cleaning Services", "Electrical Services", "Plumbing", "Aircond Servicing", "Pool Maintenance", "Pest Control", "Lawn & Garden Care", "Handyman Services", "Interior Design", "Security Systems"
];

const mockLocations = [
  { city: "Kuala Lumpur", providers: 245 },
  { city: "Penang", providers: 128 },
  { city: "Johor Bahru", providers: 96 },
  { city: "Ipoh", providers: 72 },
  { city: "Kota Kinabalu", providers: 54 },
  { city: "Kuching", providers: 48 },
];

const mockFaq = [
  { q: "How do I book a service?", a: "Simply browse our services, select the one you need, choose a service provider based on ratings and reviews, select your preferred date and time, and complete the booking process. You'll receive a confirmation email with all the details." },
  { q: "What if I'm not satisfied with the service?", a: "Contact our support team and we will help resolve any issues with your booking." },
  { q: "Are all service providers verified?", a: "Yes, all providers are verified for quality and reliability." },
  { q: "Can I reschedule or cancel my booking?", a: "Yes, you can manage your bookings from your account dashboard." },
  { q: "How do I pay for services?", a: "You can pay online securely through our platform." },
];

const PAGE_SIZE = 12;

const staticCategories = [
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

const ratingOptions = [5, 4, 3, 2, 1];

const locationOptions = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
];

const ServicesPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState(["All Services"]);
 
  const [selectedRating, setSelectedRating] = useState(0);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [averageRatings, setAverageRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const serviceQuery = {
          $limit: 1000, // Fetch a large number of services for client-side filtering
        };

        if (
          selectedCategories.length > 0 &&
          !(selectedCategories.length === 1 && selectedCategories[0] === "All Services")
        ) {
          serviceQuery.category = { $in: selectedCategories };
        }

        if (selectedRating > 0) {
          const bookings = await client.service("bookings").find({
            query: {
              rating: selectedRating,
              $select: ["listingId"],
            },
          });
          
          if (bookings.data.length === 0) {
            setAllServices([]);
            setAverageRatings({});
            setLoading(false);
            return;
          }

          const listingIds = [...new Set(bookings.data.map((b) => b.listingId).filter(id => id))];
          
          if (listingIds.length === 0) {
            setAllServices([]);
            setAverageRatings({});
            setLoading(false);
            return;
          }
          
          serviceQuery._id = { $in: listingIds };
        }

        const servicesRes = await client.service("listings").find({ query: serviceQuery });

        setAllServices(servicesRes.data || []);

        // Fetch average ratings for all fetched services
        if (servicesRes.data && servicesRes.data.length > 0) {
          const bookingsWithRatings = await client.service("bookings").find({
            query: {
              listingId: { $in: servicesRes.data.map(svc => svc._id) },
              rating: { $ne: null },
              $select: ["listingId", "rating"]
            }
          });
          const ratingsMap = {};
          servicesRes.data.forEach(svc => {
            const ratings = bookingsWithRatings.data.filter(b => b.listingId === svc._id).map(b => b.rating);
            if (ratings.length > 0) {
              const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
              ratingsMap[svc._id] = avg;
            } else {
              ratingsMap[svc._id] = null;
            }
          });
          setAverageRatings(ratingsMap);
        } else {
          setAverageRatings({});
        }
      } catch (err) {
        console.error("Services fetch error:", err);
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategories, selectedRating]);

  // Client-side filtering
  const filteredServices = useMemo(() => {
    return allServices.filter(svc =>
        (!searchTerm || svc.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedLocation || svc.location === selectedLocation)
    );
  }, [allServices, searchTerm, selectedLocation]);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Handle rating selection
  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? 0 : rating;
    setSelectedRating(newRating);
    setPage(1);
  };

  // Handle category selection (multi-select)
  const handleCategoryCheckbox = (category) => {
    setSelectedCategories(prev => {
      if (category === "All Services") {
        return ["All Services"];
      }
      let newSelected = prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev.filter(cat => cat !== "All Services"), category];
      if (newSelected.length === 0) newSelected = ["All Services"];
      return newSelected;
    });
    setPage(1);
  };

  // Pagination controls
  const total = filteredServices.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pageNumbers.push(i);
    } else if (
      (i === page - 3 && page - 3 > 1) ||
      (i === page + 3 && page + 3 < totalPages)
    ) {
      pageNumbers.push("...");
    }
  }

  const paginatedServices = filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // NOTE: A lot of inline styles are used here to achieve the new design without being able to edit CSS files.
  // For a production environment, these should be moved to a dedicated CSS file.
  return (
    <div className="sp-container" style={{ background: '#f8f9fa' }}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header Section */}
      <section className="sp-hero" style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 10px 0' }}>All Services</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>Browse our complete range of home services. Find the perfect solution for your home maintenance and improvement needs.</p>
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '10px', display: 'flex', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', top: '15px', left: '15px', color: '#999' }} />
            <input
              type="text"
              placeholder="Search services by name..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 8, border: 'none', fontSize: 16, color: '#333' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <FaMapMarkerAlt style={{ position: 'absolute', top: '15px', left: '15px', color: '#999' }} />
            <select
              value={selectedLocation}
              onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
              style={{ width: '220px', padding: '12px 12px 12px 40px', borderRadius: 8, border: 'none', fontSize: 16, background: '#f5f5f5', appearance: 'none', color: '#333' }}
            >
              <option value="">All Locations</option>
              {locationOptions.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
      
      <div className="sp-main-layout" style={{ display: 'flex', padding: '40px 20px', gap: '30px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Sidebar */}
        <aside className="sp-sidebar" style={{ width: '280px', flexShrink: 0 }}>
          <div className="sp-filter-group" style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginBottom: 15, fontSize: '1.1rem' }}>Categories</h3>
            {staticCategories.map((cat, i) => (
              <div key={cat} className="category-checkbox-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryCheckbox(cat)}
                  id={`cat-${i}`}
                />
                <label htmlFor={`cat-${i}`} style={{ marginLeft: 8, cursor: 'pointer' }}>{cat}</label>
              </div>
            ))}
          </div>
          <div className="sp-filter-group" style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginBottom: 15, fontSize: '1.1rem' }}>Rating</h3>
            {ratingOptions.map(rating => (
              <div key={rating} className="category-checkbox-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selectedRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  id={`rating-${rating}`}
                />
                <label htmlFor={`rating-${rating}`} style={{ marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                  <span style={{ marginLeft: 6, fontSize: '0.9rem', color: '#666' }}>({rating} star{rating > 1 && 's'})</span>
                </label>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="sp-content" style={{ flex: 1 }}>
          {loading && <div style={{padding: '32px', textAlign: 'center'}}>Loading...</div>}
          {error && <div style={{padding: '32px', color: 'red', textAlign: 'center'}}>{error}</div>}
          {!loading && !error && <>
            <div className="sp-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 600 }}>{total} services found</span>
              <span style={{ color: '#666' }}>Showing {paginatedServices.length ? ((page-1)*PAGE_SIZE+1) : 0}-{(page-1)*PAGE_SIZE+paginatedServices.length} of {total} results</span>
            </div>
            <div className="sp-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {paginatedServices.map((svc) => (
                <div className="sp-service-card" key={svc._id} style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                  <img src={svc.imageUrl || `https://source.unsplash.com/random/300x200?service&sig=${svc._id}`} alt={svc.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>{svc.name}</h4>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center' }}><FaMapMarkerAlt style={{ marginRight: 6 }} /> {svc.location}</div>
                    {averageRatings[svc._id] && (
                      <div style={{ margin: '4px 0 8px 0', display: 'flex', alignItems: 'center' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar key={i} color={i < Math.round(averageRatings[svc._id]) ? '#fbbf24' : '#e5e7eb'} />
                        ))}
                        <span style={{ marginLeft: 6, color: '#555', fontSize: 14, fontWeight: 600 }}>
                          {averageRatings[svc._id].toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                      <button className="sp-view-details-btn" onClick={() => navigate(`/services/${svc._id}`)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#667eea', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                          View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="services-pagination" style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {pageNumbers.map((num, idx) =>
                num === "..." ? (
                  <span key={"ellipsis-"+idx} style={{padding: '8px 12px'}}>...</span>
                ) : (
                  <button
                    key={num}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: num === page ? '#667eea' : 'white', color: num === page ? 'white' : '#333', cursor: 'pointer' }}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                )
              )}
            </div>
          </>}
        </main>
      </div>

      {/* Top Locations Section */}
      <section className="sp-top-locations" style={{ padding: '60px 20px', background: '#ffffff' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: 40, color: '#333' }}>Top Service Locations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', maxWidth: 1200, margin: '0 auto' }}>
              {mockLocations.map(loc => (
                  <div key={loc.city} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                      <FaBuilding style={{ fontSize: 40, marginBottom: 12 }}/>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{loc.city}</h4>
                      <p style={{ opacity: 0.9 }}>{loc.providers} providers</p>
                  </div>
              ))}
          </div>
      </section>

      {/* FAQ Section */}
      <section className="sp-faq" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: 40, color: '#333' }}>Frequently Asked Questions</h2>
          <div className="faq-list">
              {mockFaq.map((faq, index) => (
                  <div key={index} className="faq-item" style={{ borderBottom: '1px solid #eee', marginBottom: 15 }}>
                      <div className="faq-question" onClick={() => toggleFaq(index)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '15px 0' }}>
                          <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{faq.q}</h4>
                          {faqOpen === index ? <FaChevronUp style={{color: '#667eea'}} /> : <FaChevronDown />}
                      </div>
                      {faqOpen === index && (
                          <div className="faq-answer" style={{ padding: '0 0 15px 0', color: '#555', lineHeight: 1.6, animation: 'fadeIn 0.5s' }}>
                              {faq.a}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </section>
    </div>
  );
};

export default ServicesPage; 