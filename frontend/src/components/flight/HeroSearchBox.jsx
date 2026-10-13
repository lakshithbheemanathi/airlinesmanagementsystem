import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, ArrowRightLeft, Search, Shield, ChevronDown } from 'lucide-react';
import flightService from '../../services/flightService';

const HeroSearchBox = ({ initialValues = {} }) => {
  const navigate = useNavigate();

  const [airports, setAirports] = useState([
    { code: 'DEL', city: 'New Delhi (DEL)' },
    { code: 'BOM', city: 'Mumbai (BOM)' },
    { code: 'BLR', city: 'Bengaluru (BLR)' },
    { code: 'GOI', city: 'Goa (GOI)' },
    { code: 'CCU', city: 'Kolkata (CCU)' },
    { code: 'MAA', city: 'Chennai (MAA)' },
    { code: 'HYD', city: 'Hyderabad (HYD)' },
    { code: 'DXB', city: 'Dubai (DXB)' },
    { code: 'LHR', city: 'London (LHR)' },
    { code: 'SIN', city: 'Singapore (SIN)' },
    { code: 'BKK', city: 'Bangkok (BKK)' },
    { code: 'JFK', city: 'New York (JFK)' },
  ]);

  const [flightType, setFlightType] = useState(initialValues.flightType || 'ALL'); // ALL, DOMESTIC, INTERNATIONAL
  const [source, setSource] = useState(initialValues.source || '');
  const [destination, setDestination] = useState(initialValues.destination || '');
  const [date, setDate] = useState(initialValues.date || '');
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [cabinClass, setCabinClass] = useState(initialValues.cabinClass || 'ECONOMY');

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const res = await flightService.getAirports();
        if (res.success && res.data.length > 0) {
          setAirports(res.data);
        }
      } catch (err) {
        // Fallback to initial defaults
      }
    };
    loadAirports();
  }, []);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    if (flightType && flightType !== 'ALL') params.append('flightType', flightType);
    params.append('passengers', passengers);
    params.append('cabinClass', cabinClass);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-5 sm:p-7 rounded-3xl shadow-xl border border-slate-200/90 w-full">
      {/* Category Pills, Class and Passenger Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        {/* Domestic / International Route Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flight Type:</label>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFlightType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                flightType === 'ALL' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Routes
            </button>
            <button
              type="button"
              onClick={() => setFlightType('DOMESTIC')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                flightType === 'DOMESTIC' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🇮🇳 Domestic (India)
            </button>
            <button
              type="button"
              onClick={() => setFlightType('INTERNATIONAL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                flightType === 'INTERNATIONAL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🌐 International
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class:</label>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCabinClass('ECONOMY')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  cabinClass === 'ECONOMY' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Economy
              </button>
              <button
                type="button"
                onClick={() => setCabinClass('BUSINESS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  cabinClass === 'BUSINESS' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Business
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Traveler' : 'Travelers'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Search Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Source Airport */}
        <div className="md:col-span-4 relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            From (Origin)
          </label>
          <div className="relative">
            <input
              type="text"
              list="airports-origin"
              placeholder="e.g. DEL or New Delhi"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
            />
            <datalist id="airports-origin">
              {airports.map((ap) => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code})
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center pt-5">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-500 hover:text-sky-600 flex items-center justify-center shadow-sm transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Airport */}
        <div className="md:col-span-4 relative">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            To (Destination)
          </label>
          <div className="relative">
            <input
              type="text"
              list="airports-dest"
              placeholder="e.g. BOM or Mumbai"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
            />
            <datalist id="airports-dest">
              {airports.map((ap) => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code})
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Departure Date */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Departure Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Real-time availability & instant seat reservation guaranteed</span>
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-600 to-blue-700 text-white hover:from-sky-500 hover:to-blue-600 shadow-lg shadow-sky-600/25 active:scale-95 transition-all flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Search Flights
        </button>
      </div>
    </form>
  );
};

export default HeroSearchBox;
