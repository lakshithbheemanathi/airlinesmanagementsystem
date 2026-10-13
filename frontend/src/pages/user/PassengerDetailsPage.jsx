import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, User, Mail, Phone, Calendar, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, LogIn, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import bookingService from '../../services/bookingService';

const PassengerDetailsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const { selectedFlight, cabinClass, selectedSeats } = useBooking();

  const [passengers, setPassengers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize traveler forms based on selected seats
  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0) return;

    const initialList = selectedSeats.map((seatNumber, index) => {
      // Pre-fill first passenger if user is logged in
      if (index === 0 && user) {
        return {
          seatNumber,
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: '1995-06-15',
          gender: 'MALE',
          passportNumber: 'A12345678',
        };
      }
      return {
        seatNumber,
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '1998-03-20',
        gender: 'FEMALE',
        passportNumber: 'B87654321',
      };
    });

    setPassengers(initialList);
  }, [selectedSeats, user]);

  if (!selectedFlight || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Plane className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Please Select Your Seats First</h2>
        <p className="text-xs text-slate-500">
          You need to select your aircraft seats before entering passenger information.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Flight Search
        </Link>
      </div>
    );
  }

  const handleInputChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setError('');
  };

  const handleQuickDemoLogin = async () => {
    await login('passenger@skywings.com', 'user123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in to proceed with your booking.');
      return;
    }

    // Validate that all full names are provided
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].fullName.trim()) {
        setError(`Please enter the full legal name for Passenger ${i + 1} (Seat ${passengers[i].seatNumber}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        flightId: selectedFlight.id,
        cabinClass,
        passengers: passengers.map((p) => ({
          fullName: p.fullName.trim(),
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          passportNumber: p.passportNumber,
          email: p.email ? p.email.trim() : user.email,
          phone: p.phone ? p.phone.trim() : user.phone,
          seatNumber: p.seatNumber,
        })),
      };

      const res = await bookingService.createBooking(payload);
      if (res.success && res.data) {
        // Save confirmed booking in session storage for Payment & E-ticket
        sessionStorage.setItem('skywings_current_booking', JSON.stringify(res.data));
        navigate('/payment');
      } else {
        setError(res.message || 'Failed to create booking.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const unitFare = cabinClass === 'BUSINESS' ? selectedFlight.businessFare : selectedFlight.economyFare;
  const subtotal = unitFare * selectedSeats.length;
  const taxes = subtotal * 0.10;
  const total = subtotal + taxes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/seat-selection"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Seat Selection
        </Link>
        <div className="text-xs text-slate-400 font-medium">
          Step 2 of 3: Select Seats &rarr; <strong className="text-slate-800">Passenger Details</strong> &rarr; Payment
        </div>
      </div>

      {/* Auth Banner if guest */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Sign In Required to Reserve Ticket</span>
              <span>You need a passenger account so we can link your boarding pass and PNR.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5" /> 1-Click Passenger Sign In
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Traveler Forms */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" /> Passenger Information
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Please enter names exactly as they appear on official government ID or passport.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {passengers.map((passenger, idx) => (
                <div key={passenger.seatNumber} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Passenger {idx + 1}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-xs">
                      Assigned Seat: {passenger.seatNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Johnathan Smith"
                        value={passenger.fullName}
                        onChange={(e) => handleInputChange(idx, 'fullName', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handleInputChange(idx, 'gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => handleInputChange(idx, 'dateOfBirth', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Passport / Gov ID Number</label>
                      <input
                        type="text"
                        placeholder="P12345678"
                        value={passenger.passportNumber}
                        onChange={(e) => handleInputChange(idx, 'passportNumber', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={passenger.phone}
                        onChange={(e) => handleInputChange(idx, 'phone', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting || !isAuthenticated}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 text-white hover:bg-sky-600 active:scale-[0.99] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming Reservation & Seat Lock...
                    </>
                  ) : (
                    <>
                      Confirm & Proceed to Payment <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Booking Itinerary
            </h2>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700">{selectedFlight.flightNumber}</span>
                <span className="text-[11px] font-semibold text-slate-500">{selectedFlight.aircraftModel}</span>
              </div>

              <div className="flex items-center justify-between font-black text-slate-900 text-lg">
                <div>
                  <span>{selectedFlight.sourceAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{selectedFlight.sourceCity}</span>
                </div>
                <span className="text-sky-500 text-sm font-bold">&rarr;</span>
                <div className="text-right">
                  <span>{selectedFlight.destinationAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{selectedFlight.destinationCity}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
                <span>Class:</span>
                <strong className="text-slate-800 uppercase">{cabinClass}</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Reserved Seats
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Seat {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Fares ({selectedSeats.length}x ₹{Math.round(unitFare).toLocaleString('en-IN')})</span>
              <span className="font-semibold text-slate-900">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Taxes &amp; Airport Surcharges (10%)</span>
              <span className="font-semibold text-slate-900">₹{Math.round(taxes).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 text-base font-black pt-3 border-t border-slate-100">
              <span>Due for Payment:</span>
              <span className="text-xl text-sky-700">₹{Math.round(total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Simulated payment test mode enabled &mdash; no real charges will be made.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
