import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import HeroSearchBox from '../../components/flight/HeroSearchBox';
import FlightCard from '../../components/flight/FlightCard';
import flightService from '../../services/flightService';
import { useBooking } from '../../context/BookingContext';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chooseFlight } = useBooking();

  const searchParams = new URLSearchParams(location.search);
  const sourceParam = searchParams.get('source') || '';
  const destinationParam = searchParams.get('destination') || '';
  const dateParam = searchParams.get('date') || '';
  const passengersParam = Number(searchParams.get('passengers')) || 1;
  const cabinClassParam = searchParams.get('cabinClass') || 'ECONOMY';
  const flightTypeParam = searchParams.get('flightType') || 'ALL';

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Filters
  const [flightType, setFlightType] = useState(flightTypeParam); // ALL, DOMESTIC, INTERNATIONAL
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('ALL'); // ALL, MORNING, AFTERNOON, EVENING
  const [sortBy, setSortBy] = useState('PRICE_ASC'); // PRICE_ASC, DURATION_ASC, TIME_ASC
  const [selectedClass, setSelectedClass] = useState(cabinClassParam);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const res = await flightService.searchFlights({
        source: sourceParam,
        destination: destinationParam,
        date: dateParam || undefined,
        passengers: passengersParam,
        cabinClass: selectedClass,
        flightType: flightType !== 'ALL' ? flightType : undefined,
      });

      if (res.success) {
        setFlights(res.data);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedClass(cabinClassParam);
    setFlightType(flightTypeParam);
    fetchSearchResults();
  }, [location.search]);

  // Handle flight selection
  const handleSelectFlight = (flight) => {
    chooseFlight(flight, selectedClass, passengersParam);
    navigate('/seat-selection');
  };

  // Filter & Sort Logic
  const filteredFlights = flights
    .filter((f) => {
      // Flight type filter (Domestic vs International)
      if (flightType !== 'ALL' && f.flightType && f.flightType !== flightType) {
        return false;
      }

      const fare = selectedClass === 'BUSINESS' ? f.businessFare : f.economyFare;
      if (fare > maxPrice) return false;

      if (selectedTimeOfDay !== 'ALL') {
        const hour = new Date(f.departureTime).getHours();
        if (selectedTimeOfDay === 'MORNING' && (hour < 6 || hour >= 12)) return false;
        if (selectedTimeOfDay === 'AFTERNOON' && (hour < 12 || hour >= 18)) return false;
        if (selectedTimeOfDay === 'EVENING' && (hour < 18 || hour >= 24)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const fareA = selectedClass === 'BUSINESS' ? a.businessFare : a.economyFare;
      const fareB = selectedClass === 'BUSINESS' ? b.businessFare : b.economyFare;

      if (sortBy === 'PRICE_ASC') return fareA - fareB;
      if (sortBy === 'DURATION_ASC') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'TIME_ASC') return new Date(a.departureTime) - new Date(b.departureTime);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Search Query Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white mb-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              Flight Search Results
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{sourceParam || 'Any Origin'}</span>
              <span className="text-sky-400">&rarr;</span>
              <span>{destinationParam || 'Any Destination'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {dateParam ? new Date(dateParam).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible Dates'} &bull; {passengersParam} {passengersParam === 1 ? 'Traveler' : 'Travelers'} &bull; {selectedClass} Class
            </p>
          </div>

          <button
            onClick={() => setShowModifySearch(!showModifySearch)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors shadow-sm"
          >
            {showModifySearch ? 'Hide Search Options' : 'Modify Search'}
          </button>
        </div>

        {/* Collapsible Search Form */}
        {showModifySearch && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <HeroSearchBox
              initialValues={{
                source: sourceParam,
                destination: destinationParam,
                date: dateParam,
                passengers: passengersParam,
                cabinClass: selectedClass,
              }}
            />
          </div>
        )}
      </div>

      {/* Main Grid: Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-600" /> Filters
            </h3>
            <button
              onClick={() => {
                setFlightType('ALL');
                setMaxPrice(100000);
                setSelectedTimeOfDay('ALL');
                setSelectedClass('ECONOMY');
              }}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
            >
              Reset
            </button>
          </div>

          {/* Route Category: Domestic vs International */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Flight Category
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'ALL', label: 'All Routes' },
                { id: 'DOMESTIC', label: '🇮🇳 Domestic (India)' },
                { id: 'INTERNATIONAL', label: '🌐 International' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFlightType(cat.id)}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    flightType === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cabin Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cabin Class
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedClass('ECONOMY')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedClass === 'ECONOMY'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Economy
              </button>
              <button
                type="button"
                onClick={() => setSelectedClass('BUSINESS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedClass === 'BUSINESS'
                    ? 'bg-purple-50 border-purple-400 text-purple-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Business
              </button>
            </div>
          </div>

          {/* Price Range Slider in INR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Price (INR)</label>
              <span className="text-xs font-black text-slate-900">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={100000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>₹2,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Departure Time Slots */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Departure Time
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'ALL', label: 'Anytime' },
                { id: 'MORNING', label: 'Morning (06:00 - 12:00)' },
                { id: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
                { id: 'EVENING', label: 'Evening (18:00 - 24:00)' },
              ].map((time) => (
                <label
                  key={time.id}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    selectedTimeOfDay === time.id ? 'bg-sky-50 text-sky-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="timeOfDay"
                    checked={selectedTimeOfDay === time.id}
                    onChange={() => setSelectedTimeOfDay(time.id)}
                    className="accent-sky-600"
                  />
                  <span>{time.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Flight Results List */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sort Controls Bar */}
          <div className="bg-white p-3.5 px-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700">
              {filteredFlights.length} {filteredFlights.length === 1 ? 'Flight available' : 'Flights available'}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="PRICE_ASC">Lowest Price</option>
                <option value="DURATION_ASC">Shortest Duration</option>
                <option value="TIME_ASC">Earliest Departure</option>
              </select>
            </div>
          </div>

          {/* Flight Cards Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="h-4 bg-slate-200 rounded-lg w-28"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-7 bg-slate-200 rounded-lg w-16"></div>
                        <div className="h-3 bg-slate-100 rounded w-24"></div>
                      </div>
                      <div className="flex-1 px-4 space-y-1 text-center">
                        <div className="h-2 bg-slate-100 rounded w-16 mx-auto"></div>
                        <div className="h-[2px] bg-slate-200 w-full"></div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-7 bg-slate-200 rounded-lg w-16 ml-auto"></div>
                        <div className="h-3 bg-slate-100 rounded w-24 ml-auto"></div>
                      </div>
                    </div>
                    <div className="md:col-span-4 md:border-l border-slate-100 md:pl-6 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="h-7 bg-slate-200 rounded-lg w-20"></div>
                        <div className="h-3 bg-slate-100 rounded w-14"></div>
                      </div>
                      <div className="h-9 bg-slate-200 rounded-xl w-28"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No flights found matching your search</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try widening your price range, choosing flexible departure dates, or searching for nearby major airports like JFK, LAX, or ORD.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  cabinClass={selectedClass}
                  onSelect={handleSelectFlight}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
