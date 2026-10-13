import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Ticket, Calendar, Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, RefreshCw, LogIn, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, CANCELLED

  // Quick cancel state for Stage 10 integration
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Change of travel plans');
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleQuickDemoLogin = async () => {
    await login('passenger@skywings.com', 'user123');
  };

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancellationReason('Change of travel plans');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(cancellingBooking.id, cancellationReason);
      if (res.success) {
        setNotice({
          type: 'success',
          text: `Booking ${cancellingBooking.pnrNumber} cancelled. Refund of ₹${Math.round(res.data.refundAmount || (cancellingBooking.totalAmount * 0.9)).toLocaleString('en-IN')} processed to original payment method.`,
        });
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Failed to cancel reservation.' });
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Ticket className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Bookings</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your digital tickets, manage upcoming flights, or view past reservations.
        </p>
        <button
          onClick={handleQuickDemoLogin}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> 1-Click Passenger Sign In
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.bookingStatus === 'CONFIRMED';
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-sky-600" /> My Flight Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your scheduled itineraries, download digital tickets, and review cancellations.
          </p>
        </div>

        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md"
        >
          <Plane className="w-4 h-4" /> Book Another Flight
        </Link>
      </div>

      {notice.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice({ type: '', text: '' })} className="font-bold ml-3">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Bookings', count: bookings.length },
          { id: 'UPCOMING', label: 'Upcoming Flights', count: bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length },
          { id: 'CANCELLED', label: 'Cancelled', count: bookings.filter((b) => b.bookingStatus === 'CANCELLED').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-slate-800 text-sky-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Feed */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Retrieving your reservations...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No bookings in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any reservations under the "{activeTab.toLowerCase()}" tab.
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
            >
              Search Flights Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-sky-300 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    PNR: {b.pnrNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    Booked on {new Date(b.bookingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    b.flight?.flightType === 'INTERNATIONAL'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {b.flight?.flightType === 'INTERNATIONAL' ? '🌐 International' : '🇮🇳 Domestic'}
                  </span>
                  {b.bookingStatus === 'CONFIRMED' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> CANCELLED
                    </span>
                  )}
                </div>
              </div>

              {/* Journey Itinerary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{b.flight.sourceAirport}</span>
                    <span className="text-xs text-slate-400 block font-medium">{b.flight.sourceCity}</span>
                    <span className="text-xs font-bold text-slate-700 mt-1 block">
                      {new Date(b.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex-1 px-4 text-center">
                    <span className="text-[11px] font-bold text-slate-500 font-mono block mb-1">
                      {b.flight.flightNumber}
                    </span>
                    <div className="w-full flex items-center justify-center relative">
                      <div className="h-[2px] bg-slate-200 w-full"></div>
                      <Plane className="w-4 h-4 text-sky-600 absolute bg-white px-0.5" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">{b.flight.destinationAirport}</span>
                    <span className="text-xs text-slate-400 block font-medium">{b.flight.destinationCity}</span>
                    <span className="text-xs font-bold text-slate-700 mt-1 block">
                      {new Date(b.flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Passenger manifest summary */}
                <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Travelers ({b.passengers.length})
                  </span>
                  <div className="space-y-1">
                    {b.passengers.map((p, i) => (
                      <div key={i} className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>{p.fullName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-mono font-bold">
                          Seat {p.seatNumber} ({p.seatClass})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fare & Quick Actions */}
                <div className="md:col-span-3 text-left md:text-right border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paid Total</span>
                    <span className="text-xl font-black text-slate-900">₹{Math.round(b.totalAmount).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                    <Link
                      to={`/e-ticket/${b.pnrNumber}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> View E-Ticket
                    </Link>

                    {b.bookingStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleOpenCancelModal(b)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        Cancel Flight
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancellation & Refund Detail Banner (Stage 10) */}
              {b.bookingStatus === 'CANCELLED' && (
                <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200/90 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-red-900 block">Flight Cancelled &amp; Seats Released</span>
                      <span className="text-[11px] text-red-700">
                        Reason: {b.cancellationReason || 'Passenger requested cancellation'} &bull; {b.cancellationDate ? new Date(b.cancellationDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-red-600 uppercase font-extrabold block tracking-wider">
                      Refund Issued (90%)
                    </span>
                    <span className="text-base font-black text-red-900 font-mono">
                      ${(b.refundAmount || b.totalAmount * 0.9).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal (Integrated for Stage 10) */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Cancel Flight Reservation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                PNR <strong className="font-mono text-slate-800">{cancellingBooking.pnrNumber}</strong> &bull; Flight {cancellingBooking.flight.flightNumber}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span>Original Fare Paid:</span>
                <span className="font-bold">₹{Math.round(cancellingBooking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>Standard Refund (90%):</span>
                <span>₹{Math.round(cancellingBooking.totalAmount * 0.9).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                Seats will be released back into public airline inventory immediately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Emergency medical circumstances">Emergency medical circumstances</option>
                <option value="Scheduling conflict">Scheduling conflict</option>
                <option value="Booked by mistake">Booked by mistake</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
