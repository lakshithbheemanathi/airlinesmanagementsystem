import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Plane,
  Users,
  Ticket,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  RefreshCw,
  Percent,
  Layers,
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Booking search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Admin Quick Cancel Modal
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Administrative operational adjustment');
  const [cancelling, setCancelling] = useState(false);
  const [actionNotice, setActionNotice] = useState({ type: '', text: '' });

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await adminService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to retrieve analytics data.');
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.response?.data?.message || 'Server error loading operational analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAdminCancel = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);
    try {
      const res = await adminService.cancelBookingAsAdmin(cancellingBooking.id, cancelReason);
      if (res.success) {
        setActionNotice({
          type: 'success',
          text: `Reservation PNR ${cancellingBooking.pnrNumber} cancelled successfully. Seats released back to fleet inventory.`,
        });
        setCancellingBooking(null);
        fetchStats(true);
      }
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel reservation.',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Filter recent bookings
  const filteredBookings = (stats?.recentBookings || []).filter((b) => {
    const matchesStatus =
      statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.pnrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flight?.flightNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flight?.sourceAirport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flight?.destinationAirport?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <LayoutDashboard className="w-6 h-6 text-sky-600" />
              Operations Dashboard &amp; Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time commercial fleet telemetry, load factors, revenue metrics, and reservation management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <Link
              to="/admin/flights"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule Flight
            </Link>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {actionNotice.text && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{actionNotice.text}</span>
            <button onClick={() => setActionNotice({ type: '', text: '' })} className="font-bold ml-3">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold">Aggregating real-time fleet analytics and reservation records...</p>
          </div>
        ) : stats ? (
          <>
            {/* Primary KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Gross Revenue */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <span>Net: ₹{(stats.netRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {stats.totalRefunds > 0 && (
                      <span className="text-red-500">(-₹{(stats.totalRefunds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} refunds)</span>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Bookings</span>
                  <span className="font-extrabold text-slate-700">{stats.totalBookings} records</span>
                </div>
              </div>

              {/* 2. Seat Load Factor */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Load Factor</span>
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {stats.loadFactor?.toFixed(1) || '0.0'}%
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {stats.bookedSeats} booked of {stats.totalSeats} seats
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.loadFactor || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* 3. Flight Operations */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flight Operations</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {stats.activeFlights} Active
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {stats.totalFlights} total scheduled itineraries
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cancelled Flights</span>
                  <span className={`font-extrabold ${stats.cancelledFlights > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {stats.cancelledFlights} flights
                  </span>
                </div>
              </div>

              {/* 4. Reservations & Health */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Health</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {stats.confirmedBookings} Confirmed
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cancellation rate: {stats.cancellationRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cancelled PNRs</span>
                  <span className="font-extrabold text-red-600">{stats.cancelledBookings} cancelled</span>
                </div>
              </div>
            </div>

            {/* Secondary Operational Quick Metrics Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <span className="text-xs text-sky-300 font-bold uppercase tracking-wider block">Commercial Fleet</span>
                  <span className="text-xl font-black text-white">{stats.fleetSize} Active Aircraft</span>
                  <span className="text-[11px] text-slate-300 block">Boeing 737, 787-9 &amp; Airbus A320neo</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <span className="text-xs text-sky-300 font-bold uppercase tracking-wider block">Registered Passengers</span>
                  <span className="text-xl font-black text-white">{stats.totalPassengers} Passenger Accounts</span>
                  <span className="text-[11px] text-slate-300 block">SkyWings Member Directory</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/admin/flights"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Manage Roster <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Recent Passenger Reservations Management */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-sky-600" /> Recent Passenger Reservations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live manifest of passenger bookings across all SkyWings flight routes.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search PNR, name, route..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {['ALL', 'CONFIRMED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          statusFilter === st
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No reservations match the specified search or filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-3">PNR</th>
                        <th className="py-3 px-3">Passenger &amp; Email</th>
                        <th className="py-3 px-3">Flight &amp; Route</th>
                        <th className="py-3 px-3">Seats</th>
                        <th className="py-3 px-3">Total Fare</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-black text-slate-900">
                            {b.pnrNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">{b.passengerName || 'Traveler'}</span>
                            <span className="text-[11px] text-slate-400 block">{b.passengerEmail}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">
                              {b.flight?.flightNumber} &bull; {b.flight?.sourceAirport} &rarr; {b.flight?.destinationAirport}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {b.flight?.sourceCity} to {b.flight?.destinationCity}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {b.passengers?.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-mono font-bold"
                                >
                                  {p.seatNumber}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                            ₹{Math.round(b.totalAmount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            {b.bookingStatus === 'CONFIRMED' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> CANCELLED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(b.bookingDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <Link
                              to={`/e-ticket/${b.pnrNumber}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Ticket
                            </Link>

                            {b.bookingStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => setCancellingBooking(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Upcoming Flights Operations Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-600" /> Active Flight Operations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Next upcoming scheduled departures, aircraft allocation, and current passenger load.
                  </p>
                </div>
                <Link
                  to="/admin/flights"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  View All Flights <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(stats.upcomingFlights || []).map((f) => {
                  const depDate = new Date(f.departureTime);
                  const load = f.totalSeats > 0 ? (f.bookedSeats / f.totalSeats) * 100 : 0;
                  return (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all space-y-3 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                          {f.flightNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {f.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-lg font-black text-slate-900">{f.sourceAirport}</span>
                          <span className="text-[11px] text-slate-400 block">{f.sourceCity}</span>
                        </div>
                        <div className="flex-1 px-3 text-center">
                          <Plane className="w-3.5 h-3.5 text-sky-600 mx-auto" />
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {Math.floor(f.durationMinutes / 60)}h {f.durationMinutes % 60}m
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">{f.destinationAirport}</span>
                          <span className="text-[11px] text-slate-400 block">{f.destinationCity}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Departure:</span>
                          <span className="font-bold text-slate-700">
                            {depDate.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                            {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Aircraft:</span>
                          <span className="font-semibold text-slate-700">{f.aircraftModel}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Load:</span>
                          <span className="font-bold text-slate-800">
                            {f.bookedSeats} / {f.totalSeats} ({load.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {/* Admin Quick Cancellation Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Cancel Reservation as Admin</h3>
                <p className="text-xs text-slate-500 mt-1">
                  PNR <strong className="font-mono text-slate-800">{cancellingBooking.pnrNumber}</strong> &bull; Passenger: {cancellingBooking.passengerName}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Fare Paid:</span>
                  <span className="font-bold">${cancellingBooking.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>Refund Initiated (90%):</span>
                  <span>${(cancellingBooking.totalAmount * 0.9).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  Assigned seats will be immediately returned to commercial flight inventory.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="Administrative operational adjustment">Administrative operational adjustment</option>
                  <option value="Customer service telephone request">Customer service telephone request</option>
                  <option value="Flight route re-accommodation">Flight route re-accommodation</option>
                  <option value="Fraud prevention / Duplicate booking">Fraud prevention / Duplicate booking</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleAdminCancel}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
