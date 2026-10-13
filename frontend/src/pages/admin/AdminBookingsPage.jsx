import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Search,
  RefreshCw,
  Eye,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Plane,
  Users,
  CreditCard,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import notificationService from '../../services/notificationService';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewingBooking, setViewingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Administrative operational adjustment');
  const [messagingBooking, setMessagingBooking] = useState(null);
  const [messageData, setMessageData] = useState({ title: '', message: '', type: 'OPERATIONAL_ALERT' });

  const [processing, setProcessing] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState('');
  const [toast, setToast] = useState({ type: '', text: '' });

  const fetchBookings = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminService.getAllBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to load booking reservations.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCopyPnr = (pnr) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(''), 2000);
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    setProcessing(true);

    try {
      const res = await adminService.cancelBookingAsAdmin(cancellingBooking.id, cancelReason);
      if (res.success) {
        setToast({
          type: 'success',
          text: `Reservation ${cancellingBooking.pnrNumber} cancelled. 90% refund (₹${Math.round(res.data.refundAmount || cancellingBooking.totalAmount * 0.9).toLocaleString('en-IN')}) issued and seats released.`,
        });
        setCancellingBooking(null);
        fetchBookings(true);
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel reservation.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messagingBooking) return;
    setProcessing(true);

    try {
      const payload = {
        flightId: messagingBooking.flight?.id || null,
        title: messageData.title,
        message: messageData.message,
        type: messageData.type,
      };

      const res = await notificationService.broadcastNotification(payload);
      if (res.success) {
        setToast({
          type: 'success',
          text: `Message dispatched successfully to passenger (${messagingBooking.passengerEmail})!`,
        });
        setMessagingBooking(null);
        setMessageData({ title: '', message: '', type: 'OPERATIONAL_ALERT' });
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send message to passenger.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openMessageModal = (b) => {
    setMessagingBooking(b);
    setMessageData({
      title: `Operational Notice for PNR ${b.pnrNumber}`,
      message: `Dear ${b.passengerName || 'Passenger'}, regarding your flight ${b.flight?.flightNumber || ''} (${b.flight?.sourceAirport} to ${b.flight?.destinationAirport}), please be advised of the following update: `,
      type: 'OPERATIONAL_ALERT',
    });
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      b.pnrNumber?.toLowerCase().includes(q) ||
      b.passengerName?.toLowerCase().includes(q) ||
      b.passengerEmail?.toLowerCase().includes(q) ||
      b.flight?.flightNumber?.toLowerCase().includes(q) ||
      b.flight?.sourceAirport?.toLowerCase().includes(q) ||
      b.flight?.destinationAirport?.toLowerCase().includes(q) ||
      b.flight?.sourceCity?.toLowerCase().includes(q) ||
      b.flight?.destinationCity?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;
  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-sky-600" /> Bookings &amp; PNR Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search passenger records by PNR, inspect tickets, manage cancellations, and send direct alerts.
            </p>
          </div>

          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Records'}
          </button>
        </div>

        {/* Global Toast Alert */}
        {toast.text && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{toast.text}</span>
            </div>
            <button onClick={() => setToast({ type: '', text: '' })}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{bookings.length}</span>
            <span className="text-[11px] text-slate-500">Reservations logged</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Confirmed</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{confirmedCount}</span>
            <span className="text-[11px] text-slate-500">Active tickets</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider block">Cancelled</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{cancelledCount}</span>
            <span className="text-[11px] text-slate-500">Released to inventory</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">Gross Confirmed</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">Net passenger volume</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PNR, passenger, email, flight..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              {['ALL', 'CONFIRMED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">PNR Number</th>
                  <th className="px-5 py-3.5">Lead Passenger</th>
                  <th className="px-5 py-3.5">Flight &amp; Route</th>
                  <th className="px-5 py-3.5">Seats</th>
                  <th className="px-5 py-3.5">Amount (INR)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Booking Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading passenger reservations...
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      No reservations match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* PNR with copy */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/e-ticket/${b.pnrNumber}`}
                            target="_blank"
                            title="Open digital boarding pass"
                            className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
                          >
                            {b.pnrNumber}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopyPnr(b.pnrNumber)}
                            title="Copy PNR to clipboard"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          >
                            {copiedPnr === b.pnrNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Passenger */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{b.passengerName || 'Traveler'}</span>
                        <span className="text-[11px] text-slate-400 block">{b.passengerEmail}</span>
                      </td>

                      {/* Flight */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {b.flight?.flightNumber} &bull; {b.flight?.sourceAirport} &rarr; {b.flight?.destinationAirport}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {b.flight?.sourceCity} to {b.flight?.destinationCity}
                        </span>
                      </td>

                      {/* Seats */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {b.passengers?.map((p, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-mono font-bold border border-sky-100"
                            >
                              {p.seatNumber}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount in INR */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        ₹{Math.round(b.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {b.bookingStatus === 'CONFIRMED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> CANCELLED
                          </span>
                        )}
                      </td>

                      {/* Booking Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {b.bookingDate
                          ? new Date(b.bookingDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingBooking(b)}
                            title="View Full Booking Itinerary"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openMessageModal(b)}
                            title="Send Alert / Message to this Passenger"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {b.bookingStatus === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => setCancellingBooking(b)}
                              title="Cancel Reservation"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: VIEW FULL BOOKING DETAILS */}
        {viewingBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      PNR: {viewingBooking.pnrNumber}
                    </span>
                    {viewingBooking.bookingStatus === 'CONFIRMED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        CONFIRMED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                        CANCELLED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Booked on {viewingBooking.bookingDate ? new Date(viewingBooking.bookingDate).toLocaleString() : 'Recently'}
                  </p>
                </div>
                <button
                  onClick={() => setViewingBooking(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Itinerary Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black">{viewingBooking.flight?.sourceAirport}</span>
                  <p className="text-xs text-slate-400">{viewingBooking.flight?.sourceCity}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-sky-400 font-bold">
                    {viewingBooking.flight?.flightNumber}
                  </span>
                  <Plane className="w-4 h-4 text-sky-400 my-1" />
                  <span className="text-[10px] text-slate-400">Direct Flight</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">{viewingBooking.flight?.destinationAirport}</span>
                  <p className="text-xs text-slate-400">{viewingBooking.flight?.destinationCity}</p>
                </div>
              </div>

              {/* Passenger Roster */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" /> Booked Travelers &amp; Assigned Seats
                </h4>
                <div className="space-y-2">
                  {viewingBooking.passengers?.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.email || viewingBooking.passengerEmail} &bull; {p.phone || 'Contact on file'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded bg-sky-100 text-sky-800 font-mono font-bold text-xs">
                          Seat {p.seatNumber} ({p.seatClass || 'Standard'})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Payment Method &amp; Transaction ID:</span>
                  <span className="font-mono text-slate-800 font-bold block mt-0.5">
                    {viewingBooking.transactionId || 'TXN-PAID-SUCCESS'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Total Fare Paid:</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    ₹{Math.round(viewingBooking.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <Link
                  to={`/e-ticket/${viewingBooking.pnrNumber}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Digital Boarding Pass
                </Link>

                <button
                  type="button"
                  onClick={() => setViewingBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CANCEL RESERVATION */}
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setCancellingBooking(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cancel Reservation {cancellingBooking.pnrNumber}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Passenger: <strong className="text-slate-800">{cancellingBooking.passengerName}</strong> ({cancellingBooking.passengerEmail})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route: {cancellingBooking.flight?.sourceAirport} &rarr; {cancellingBooking.flight?.destinationAirport}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">Refund &amp; Seat Release Policy:</span>
                <span>
                  Cancelling this reservation releases assigned seats back to commercial inventory and triggers a 90% refund (
                  <strong>₹{Math.round(cancellingBooking.totalAmount * 0.9).toLocaleString('en-IN')}</strong>) to the original payment method.
                </span>
              </div>

              <form onSubmit={handleCancelBooking} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Reason</label>
                  <input
                    type="text"
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {processing && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Confirm Cancellation &amp; Issue Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Keep Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: SEND DIRECT MESSAGE / ALERT TO PASSENGER */}
        {messagingBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setMessagingBooking(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Send Operational Alert to Passenger
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Recipient: <strong className="text-slate-800">{messagingBooking.passengerName}</strong> ({messagingBooking.passengerEmail}) &bull; PNR {messagingBooking.pnrNumber}
                </p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Category</label>
                  <select
                    value={messageData.type}
                    onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="OPERATIONAL_ALERT">Operational Alert (General)</option>
                    <option value="FLIGHT_DELAYED">Flight Delayed Notice</option>
                    <option value="FLIGHT_CANCELLED">Flight Cancelled Notice</option>
                    <option value="GATE_CHANGED">Gate Change Alert</option>
                    <option value="SCHEDULE_CHANGED">Schedule Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={messageData.title}
                    onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMessagingBooking(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {processing && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <Send className="w-3.5 h-3.5" /> Dispatch Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
