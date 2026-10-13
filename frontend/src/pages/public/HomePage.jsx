import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, ShieldCheck, Clock, Luggage, Wifi, Coffee, Award, Sparkles, ArrowRight, HeartHandshake } from 'lucide-react';
import HeroSearchBox from '../../components/flight/HeroSearchBox';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('DOMESTIC'); // 'DOMESTIC', 'INTERNATIONAL', 'ALL'

  const domesticRoutes = [
    {
      from: 'DEL',
      fromCity: 'New Delhi',
      to: 'BOM',
      toCity: 'Mumbai',
      fare: '₹4,499',
      duration: '2h 15m',
      tag: 'Best Seller',
      type: 'DOMESTIC',
    },
    {
      from: 'BOM',
      fromCity: 'Mumbai',
      to: 'GOI',
      toCity: 'Goa',
      fare: '₹3,299',
      duration: '1h 15m',
      tag: 'Beach Holiday',
      type: 'DOMESTIC',
    },
    {
      from: 'BLR',
      fromCity: 'Bengaluru',
      to: 'DEL',
      toCity: 'New Delhi',
      fare: '₹5,999',
      duration: '2h 45m',
      tag: 'Capital Express',
      type: 'DOMESTIC',
    },
    {
      from: 'CCU',
      fromCity: 'Kolkata',
      to: 'DEL',
      toCity: 'New Delhi',
      fare: '₹4,899',
      duration: '2h 25m',
      tag: 'Cultural Heritage',
      type: 'DOMESTIC',
    },
  ];

  const internationalRoutes = [
    {
      from: 'DEL',
      fromCity: 'New Delhi',
      to: 'DXB',
      toCity: 'Dubai',
      fare: '₹19,499',
      duration: '4h 15m',
      tag: 'Middle East Hub',
      type: 'INTERNATIONAL',
    },
    {
      from: 'BOM',
      fromCity: 'Mumbai',
      to: 'LHR',
      toCity: 'London',
      fare: '₹48,999',
      duration: '9h 30m',
      tag: 'European Flagship',
      type: 'INTERNATIONAL',
    },
    {
      from: 'BLR',
      fromCity: 'Bengaluru',
      to: 'SIN',
      toCity: 'Singapore',
      fare: '₹23,999',
      duration: '4h 30m',
      tag: 'Southeast Asia',
      type: 'INTERNATIONAL',
    },
    {
      from: 'DEL',
      fromCity: 'New Delhi',
      to: 'BKK',
      toCity: 'Bangkok',
      fare: '₹16,999',
      duration: '4h 15m',
      tag: 'Tropical Getaway',
      type: 'INTERNATIONAL',
    },
  ];

  const displayedRoutes =
    activeTab === 'DOMESTIC'
      ? domesticRoutes
      : activeTab === 'INTERNATIONAL'
      ? internationalRoutes
      : [...domesticRoutes, ...internationalRoutes];

  const handleQuickRouteSearch = (from, to, type) => {
    navigate(`/search?source=${from}&destination=${to}&flightType=${type}&passengers=1&cabinClass=ECONOMY`);
  };

  return (
    <div className="w-full space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/60 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>SkyWings Airlines — Fly Domestic across India & International Worldwide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-white">
            Discover India &amp; The World with Effortless Airline Travel
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reserve commercial domestic &amp; international flights, select your preferred aircraft seat in real-time, and download digital boarding passes in seconds.
          </p>

          {/* Embedded Search Widget */}
          <div className="mt-10 max-w-5xl mx-auto text-left text-slate-900">
            <HeroSearchBox />
          </div>
        </div>
      </section>

      {/* Popular Destinations / Routes with Domestic and International Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">Top Travel Deals (INR)</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Flight Routes
            </h2>
          </div>

          {/* Route Category Pills */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('DOMESTIC')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'DOMESTIC'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇮🇳 Domestic (India)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('INTERNATIONAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'INTERNATIONAL'
                    ? 'bg-white text-indigo-800 shadow-sm border border-indigo-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🌐 International
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-sky-800 shadow-sm border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Deals
              </button>
            </div>

            <Link
              to="/search"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group ml-2"
            >
              Explore all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedRoutes.map((route, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-sky-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    route.type === 'DOMESTIC'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {route.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{route.duration}</span>
                </div>

                <div className="flex items-center justify-between font-black text-slate-900 text-lg">
                  <div>
                    <span className="block">{route.from}</span>
                    <span className="text-xs font-medium text-slate-400 block">{route.fromCity}</span>
                  </div>
                  <Plane className="w-5 h-5 text-sky-500 transform rotate-45" />
                  <div className="text-right">
                    <span className="block">{route.to}</span>
                    <span className="text-xs font-medium text-slate-400 block">{route.toCity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Starting from</span>
                  <span className="text-xl font-black text-slate-900">{route.fare}</span>
                </div>
                <button
                  onClick={() => handleQuickRouteSearch(route.from, route.to, route.type)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-sky-600 transition-colors shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose SkyWings */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">Our Commitment</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Fly with SkyWings Airlines?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Modern aviation standards combined with passenger-first hospitality and digital speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <Plane className="w-6 h-6 transform -rotate-45" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">State-of-the-Art Fleet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fly in comfort aboard the fuel-efficient Boeing 787-9 Dreamliner and Airbus A320neo with quiet cabins.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Interactive Seat Map</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose window, aisle, or extra-legroom seats with real-time aircraft seat occupancy visualization.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant Digital E-Tickets</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive verifiable 6-character PNR booking codes and digital printable boarding passes immediately.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Live In-App Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant dashboard notifications if departure times, terminal gates, or flight statuses change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* In-Flight Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">In-Flight Experience</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Comfort, Culinary Delights & Entertainment at 35,000 Feet
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every SkyWings reservation includes complimentary high-speed Wi-Fi, chef-curated dining, and streaming entertainment on your personal device.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-400" />
                <span>High-Speed Satellite Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-sky-400" />
                <span>Complimentary Refreshments</span>
              </div>
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4 text-sky-400" />
                <span>Generous Baggage Limits</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-sky-400" />
                <span>24/7 Dedicated Support</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 text-center md:text-right">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/30 active:scale-95 transition-all"
            >
              Search Flights Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
