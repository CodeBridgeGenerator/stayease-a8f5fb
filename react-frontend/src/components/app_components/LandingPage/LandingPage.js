import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';

const LandingPage = () => {
  return (
    <div className="bg-white font-sans">
    
      {/* Hero Section */}
      <section className="bg-teal-700 text-white px-8 py-16 text-center md:flex md:items-center md:justify-between">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-4xl font-bold">
            Simplifying Homestay Upkeep—One Service at a Time
          </h2>
          <p className="text-lg">
            Book trusted cleaners, electricians, and more—directly on WhatsApp.
          </p>
          <div className="space-x-4">
            <Button className="p-button-primary" onClick={() => window.location.href = '/services'}>Explore Services</Button>
            <Button className="p-button-outlined" onClick={() => window.location.href = '/register-provider'}>Register as a Provider</Button>
          </div>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <img src="/illustrations/hero-illustration.svg" alt="Hero Illustration" className="w-full max-w-md mx-auto" />
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 px-8">
        <h3 className="text-2xl font-semibold text-center mb-8">Popular Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {[
            ['Cleaning'],
            ['Wiring'],
            ['Pool Services'],
            ['Renovation'],
            ['Pest Control'],
            ['Deal directly']
          ].map(([label, emoji]) => (
            <div key={label} className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works & AI */}
      <section className="px-8 py-12 bg-gray-50 grid md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <ul className="space-y-3 text-gray-700">
            <li> Browse service categories</li>
            <li> Choose your location</li>
            <li> Click "Book on WhatsApp"</li>
            <li> Deal directly with the provider</li>
          </ul>
          <Button className="p-button-primary mt-6" onClick={() => window.location.href = '/get-started'}>Get Started</Button>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">AI Integration</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium">AI Recommendations</h4>
              <p className="text-sm text-gray-600">Based on your Cleaning Service in Kuala Lumpur</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium">Sentiment Analysis</h4>
              <p className="text-sm text-gray-600">Analyze reviews to improve service quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} StayEase. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
