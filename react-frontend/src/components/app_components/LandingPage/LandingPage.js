import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const services = [
  {
    title: 'Cleaning Services',
    description: 'General cleaning, deep cleaning, and post-stay cleaning to keep your homestay spotless.',
    icon: 'service-cleaning',
  },
  {
    title: 'Electrical Services',
    description: 'Fix air conditioning, lights, fans, and other electrical issues in your homestay.',
    icon: 'service-electrical',
  },
  {
    title: 'Pool Maintenance',
    description: 'Keep your homestay pool clean, balanced, and ready for guests to enjoy.',
    icon: 'service-pool',
  },
  {
    title: 'Interior Design',
    description: 'Upgrade your homestay\'s look with professional interior design services.',
    icon: 'service-interior',
  },
  {
    title: 'Pest Control',
    description: 'Eliminate ants, termites, mosquitoes, and other pests from your property.',
    icon: 'service-pest',
  },
  {
    title: 'Security Systems',
    description: 'Install CCTV, smart locks, and security systems to protect your homestay.',
    icon: 'service-security',
  },
];

const testimonials = [
  {
    name: 'Ahmad Rizal',
    location: 'Homestay Owner in Penang',
    text: 'StayEase has made managing my three homestays so much easier. I can quickly find reliable service providers and book them instantly through WhatsApp. Highly recommended!',
    initial: 'A',
  },
  {
    name: 'Sarah Tan',
    location: 'Homestay Owner in Kuala Lumpur',
    text: 'The WhatsApp booking feature is brilliant! It saves me so much time compared to calling each service provider individually. The quality of service providers on StayEase is excellent.',
    initial: 'S',
  },
  {
    name: 'Raj Kumar',
    location: 'Homestay Owner in Johor Bahru',
    text: 'I had an emergency plumbing issue at my homestay, and within minutes I was able to find and book a reliable plumber through StayEase. The service saved my weekend bookings!',
    initial: 'R',
  },
];

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleWhatsAppBooking = (serviceType) => {
    const message = `Hi, I'm a homestay owner. I would like to book your ${serviceType} for my homestay.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="lp-root">
      
      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <h1>Homestay Services<br />Made Simple</h1>
            <p>Find trusted cleaning, maintenance, and renovation services for your homestay in Malaysia. Book directly through WhatsApp with just a few clicks.</p>
            <div className="lp-hero-actions">
              <button className="lp-btn lp-btn-primary" onClick={() => navigate('/services')}>Explore Services</button>
              <button className="lp-btn lp-btn-outline" onClick={() => navigate('/register-provider')}>Become a Provider</button>
            </div>
        </div>
          <div className="lp-hero-right">
            <div className="lp-hero-card">
              <div className="lp-hero-house"></div>
              <div className="lp-hero-card-content">
                <h3>Manage your homestay with ease</h3>
                <p>Connect with service providers instantly</p>
                    </div>
              <span className="lp-hero-whatsapp"> <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#25D366" d="M12 2C6.477 2 2 6.477 2 12c0 1.657.402 3.22 1.11 4.6L2 22l5.553-1.454A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.007-.372-.009-.57-.009-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.21 5.077 4.377.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg></span>
                </div>
            </div>
        </div>
    </section>

      {/* SERVICES */}
      <section id="services" className="lp-section lp-services">
        <div className="lp-section-title">
          <h2>Our Services</h2>
          <p>Everything you need to keep your homestay in perfect condition for your guests</p>
            </div>
        <div className="lp-services-grid">
          {services.map((service, i) => (
            <div className="lp-service-card" key={i}>
              <div className={`lp-service-icon ${service.icon}`}></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button className="lp-btn lp-btn-wa" onClick={() => handleWhatsAppBooking(service.title)}>
                Book via WhatsApp <span className="lp-btn-wa-icon"></span>
                    </button>
            </div>
          ))}
            </div>
        <div className="lp-services-viewall">
          <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate('/services')}>View All Services <span className="lp-btn-arrow">→</span></button>
        </div>
    </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section lp-howitworks">
        <div className="lp-section-title">
          <h2>How It Works</h2>
          <p>Book services for your homestay in just three simple steps</p>
        </div>
        <div className="lp-hiw-steps">
          <div className="lp-hiw-step"><span>1</span><h3>Browse Services</h3><p>Explore our wide range of homestay services and find what you need.</p></div>
          <div className="lp-hiw-step"><span>2</span><h3>Select Provider</h3><p>Choose from our trusted service providers based on ratings and reviews.</p></div>
          <div className="lp-hiw-step"><span>3</span><h3>Book via WhatsApp</h3><p>Connect directly with service providers through WhatsApp to book your service.</p></div>
        </div>
        <div className="lp-hiw-demo-row">
          <div className="lp-hiw-demo-left">
            <h3>WhatsApp Booking Demo</h3>
            <p>When you click \"Book via WhatsApp,\" we'll automatically open WhatsApp with a pre-filled message to the service provider.</p>
            <div className="lp-hiw-demo-sample">
              <span>Sample Message:</span>
              <p><em>\"Hi, I'm a homestay owner. I would like to book your Cleaning Service for [Homestay Name].\"</em></p>
            </div>
                </div>
          <div className="lp-hiw-demo-right">
            <div className="lp-hiw-chat">
              <div className="lp-hiw-chat-header"><span className="lp-hiw-chat-waicon"></span> WhatsApp</div>
              <div className="lp-hiw-chat-body">
                <div className="lp-hiw-chat-msg lp-hiw-chat-msg-user">
                  <span className="lp-hiw-chat-avatar">CS</span>
                  <div className="lp-hiw-chat-bubble">Hi, I'm a homestay owner. I would like to book your Cleaning Service for Villa Serenity.</div>
                </div>
                <div className="lp-hiw-chat-msg lp-hiw-chat-msg-provider">
                  <div className="lp-hiw-chat-bubble">Thank you for your interest! When would you like to schedule the cleaning?</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-section lp-testimonials">
        <div className="lp-section-title">
          <h2>What Our Users Say</h2>
          <p>Hear from homestay owners who have simplified their service management with StayEase</p>
            </div>
        <div className="lp-testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="lp-testimonial-card" key={i}>
              <div className="lp-testimonial-header">
                <span className="lp-testimonial-avatar">{t.initial}</span>
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.location}</span>
                </div>
                        </div>
              <div className="lp-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
                        </div>
              <blockquote>“{t.text}”</blockquote>
            </div>
          ))}
        </div>
    </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <div className="lp-cta-left">
            <h2>Ready to simplify your homestay management?</h2>
            <p>Join StayEase today and connect with trusted service providers for all your homestay needs.</p>
                </div>
          <div className="lp-cta-right">
            <a href="/login" className="lp-btn lp-btn-white">Get Started Now</a>
            </div>
        </div>
    </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-col lp-footer-brand">
            <div className="lp-logo-icon"></div>
            <div className="lp-logo-text">StayEase</div>
            <div className="lp-footer-desc">Homestay Services Made Simple</div>
            <div className="lp-footer-socials">
              <a href="#"><span className="lp-footer-social-icon">f</span></a>
              <a href="#"><span className="lp-footer-social-icon">i</span></a>
              <a href="#"><span className="lp-footer-social-icon">g</span></a>
                    </div>
                </div>
          <div className="lp-footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#">Cleaning</a></li>
              <li><a href="#">Electrical</a></li>
              <li><a href="#">Plumbing</a></li>
              <li><a href="#">Pool Maintenance</a></li>
              <li><a href="#">Interior Design</a></li>
                    </ul>
                </div>
          <div className="lp-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Testimonials</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
          <div className="lp-footer-col">
            <h4>Contact</h4>
            <ul>
              <li><span className="lp-footer-contact-icon">📍</span> 123 Jalan Bukit Bintang, Kuala Lumpur, Malaysia</li>
              <li><span className="lp-footer-contact-icon">✉️</span> info@stayease.my</li>
              <li><span className="lp-footer-contact-icon">📞</span> +60 12-345-6789</li>
                    </ul>
                </div>
            </div>
        <div className="lp-footer-bottom">
          <span>© 2023 StayEase. All rights reserved.</span>
          <div className="lp-footer-policies">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
            </div>
        </div>
    </footer>
    </div>
  );
};

export default LandingPage;