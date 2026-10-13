import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Send,
  Plane,
  Ticket,
  ExternalLink,
  Copy,
  Check,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  X,
  UserCheck,
  Crown,
  MapPin,
  Clock,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import notificationService from '../../services/notificationService';

const AdminPassengersPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [flightFilter, setFlightFilter] = useState('ALL');

  // Modals state
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [messagingTarget, setMessagingTarget] = useState(null);
  const [messageData, setMessageData] = useState({
    title: '',
    message: '',
    type: 'OPERATIONAL_ALERT',
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  const [copiedItem, setCopiedItem] = useState('');
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
      setToast({ type: 'error', text: 'Failed to load passenger manifests from server.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(''), 2000);
  };

  // Flatten bookings into individual passenger manifest records
  const passengerManifest = useMemo(() => {
    const list = [];
    bookings.forEach((booking) => {
      const flight = booking.flight || {};
      const bookingPassengers = Array.isArray(booking.passengers) ? booking.passengers : [];

      if (bookingPassengers.length === 0) {
        // Fallback if passenger breakdown is empty
        list.push({
          id: `b-${booking.id}-primary`,
          bookingId: booking.id,
          pnrNumber: booking.pnrNumber,
          bookingStatus: booking.bookingStatus || 'CONFIRMED',
          bookingDate: booking.bookingDate,
          fullName: booking.passengerName || 'Guest Passenger',
          email: booking.passengerEmail || 'passenger@skywings.com',
          phone: 'N/A',
          gender: 'N/A',
          passportNumber: 'N/A',
          dateOfBirth: 'N/A',
          seatNumber: 'General',
          seatClass: 'Economy',
          fare: booking.totalAmount || 0,
          flightId: flight.id,
          flightNumber: flight.flightNumber || 'SW-000',
          airline: flight.airline || 'SkyWings',
          originCode: flight.originAirportCode || flight.sourceAirport || 'DEL',
          originCity: flight.originCity || 'Delhi',
          destCode: flight.destinationAirportCode || flight.destinationAirport || 'BOM',
          destCity: flight.destinationCity || 'Mumbai',
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          flightStatus: flight.status || 'SCHEDULED',
          gate: flight.gate || 'TBD',
        });
      } else {
        bookingPassengers.forEach((p, idx) => {
          list.push({
            id: `b-${booking.id}-p-${p.passengerId || idx}`,
            passengerId: p.passengerId,
            bookingId: booking.id,
            pnrNumber: booking.pnrNumber,
            bookingStatus: booking.bookingStatus || 'CONFIRMED',
            bookingDate: booking.bookingDate,
            fullName: p.fullName || booking.passengerName || 'Guest Passenger',
            email: p.email || booking.passengerEmail || 'passenger@skywings.com',
            phone: p.phone || 'N/A',
            gender: p.gender || 'N/A',
            passportNumber: p.passportNumber || 'N/A',
            dateOfBirth: p.dateOfBirth || 'N/A',
            seatNumber: p.seatNumber || 'Unassigned',
            seatClass: p.seatClass || 'Economy',
            fare: p.fare || (booking.totalAmount ? booking.totalAmount / bookingPassengers.length : 0),
            flightId: flight.id,
            flightNumber: flight.flightNumber || 'SW-000',
            airline: flight.airline || 'SkyWings',
            originCode: flight.originAirportCode || flight.sourceAirport || 'DEL',
            originCity: flight.originCity || 'Delhi',
            destCode: flight.destinationAirportCode || flight.destinationAirport || 'BOM',
            destCity: flight.destinationCity || 'Mumbai',
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            flightStatus: flight.status || 'SCHEDULED',
            gate: flight.gate || 'TBD',
          });
        });
      }
    });
    return list;
  }, [bookings]);

  // Unique flight numbers for filtering
  const uniqueFlightNumbers = useMemo(() => {
    const set = new Set();
    passengerManifest.forEach((p) => {
      if (p.flightNumber) set.add(p.flightNumber);
    });
    return Array.from(set).sort();
  }, [passengerManifest]);

  // Filtered passenger manifest
  const filteredManifest = useMemo(() => {
    return passengerManifest.filter((p) => {
      // Status filter
      if (statusFilter !== 'ALL' && p.bookingStatus !== statusFilter) return false;

      // Class filter
      if (classFilter !== 'ALL') {
        if (classFilter === 'BUSINESS' && !p.seatClass.toUpperCase().includes('BUSINESS')) return false;
        if (classFilter === 'ECONOMY' && !p.seatClass.toUpperCase().includes('ECONOMY')) return false;
      }

      // Flight filter
      if (flightFilter !== 'ALL' && p.flightNumber !== flightFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.fullName?.toLowerCase().includes(q);
        const matchesEmail = p.email?.toLowerCase().includes(q);
        const matchesPhone = p.phone?.toLowerCase().includes(q);
        const matchesPnr = p.pnrNumber?.toLowerCase().includes(q);
        const matchesSeat = p.seatNumber?.toLowerCase().includes(q);
        const matchesFlight = p.flightNumber?.toLowerCase().includes(q);
        const matchesOrigin = p.originCity?.toLowerCase().includes(q) || p.originCode?.toLowerCase().includes(q);
        const matchesDest = p.destCity?.toLowerCase().includes(q) || p.destCode?.toLowerCase().includes(q);

        return matchesName || matchesEmail || matchesPhone || matchesPnr || matchesSeat || matchesFlight || matchesOrigin || matchesDest;
      }

      return true;
    });
  }, [passengerManifest, statusFilter, classFilter, flightFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = passengerManifest.length;
    const confirmed = passengerManifest.filter((p) => p.bookingStatus === 'CONFIRMED').length;
    const cancelled = passengerManifest.filter((p) => p.bookingStatus === 'CANCELLED').length;
    const business = passengerManifest.filter((p) => p.seatClass.toUpperCase().includes('BUSINESS')).length;
    const economy = passengerManifest.filter((p) => p.seatClass.toUpperCase().includes('ECONOMY')).length;

    return { total, confirmed, cancelled, business, economy };
  }, [passengerManifest]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredManifest.length === 0) {
      setToast({ type: 'error', text: 'No passenger records to export.' });
      return;
    }

    const headers = [
      'PNR',
      'Passenger Name',
      'Gender',
      'Email',
      'Phone',
      'Flight Number',
      'Origin',
      'Destination',
      'Departure Time',
      'Seat',
      'Cabin Class',
      'Fare (INR)',
      'Status',
    ];

    const rows = filteredManifest.map((p) => [
      p.pnrNumber,
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.gender,
      p.email,
      p.phone,
      p.flightNumber,
      `${p.originCity} (${p.originCode})`,
      `${p.destCity} (${p.destCode})`,
      p.departureTime || 'TBD',
      p.seatNumber,
      p.seatClass,
      Math.round(p.fare),
      p.bookingStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skywings-passenger-manifest-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', text: `Exported manifest for ${filteredManifest.length} passengers.` });
  };

  // Open Message Modal with predefined templates
  const handleOpenMessageModal = (p) => {
    setMessagingTarget(p);
    setMessageData({
      title: `Operational Notice for Flight ${p.flightNumber}`,
      message: `Dear ${p.fullName},\n\nThis is an official communication regarding your upcoming flight ${p.flightNumber} (${p.originCode} -> ${p.destCode}) on PNR ${p.pnrNumber}.\n\nPlease ensure you report to the gate 45 minutes prior to scheduled departure.`,
      type: 'OPERATIONAL_ALERT',
    });
  };

  const handleApplyTemplate = (type) => {
    if (!messagingTarget) return;
    const p = messagingTarget;

    switch (type) {
      case 'DELAY':
        setMessageData({
          title: `Flight Delay Notice: ${p.flightNumber}`,
          message: `Dear ${p.fullName},\n\nWe regret to inform you that SkyWings Flight ${p.flightNumber} to ${p.destCity} (${p.destCode}) has encountered an operational delay. Please monitor the airport departure boards for revised boarding updates. We apologize for any inconvenience.`,
          type: 'FLIGHT_DELAYED',
        });
        break;
      case 'GATE':
        setMessageData({
          title: `Departure Gate Change: ${p.flightNumber}`,
          message: `Dear ${p.fullName},\n\nPlease note that the departure gate for Flight ${p.flightNumber} has been updated. Kindly proceed to Gate ${p.gate || 'assigned at terminal'} for boarding.`,
          type: 'GATE_CHANGED',
        });
        break;
      case 'BOARDING':
        setMessageData({
          title: `Now Boarding: Flight ${p.flightNumber}`,
          message: `Dear ${p.fullName},\n\nBoarding has commenced for Flight ${p.flightNumber} from ${p.originCity} to ${p.destCity}. Please have your Boarding Pass and Photo ID ready for Seat ${p.seatNumber}.`,
          type: 'FLIGHT_BOARDING',
        });
        break;
      case 'RESCHEDULE':
        setMessageData({
          title: `Schedule Adjustment: Flight ${p.flightNumber}`,
          message: `Dear ${p.fullName},\n\nYour flight schedule for ${p.flightNumber} (PNR: ${p.pnrNumber}) has been adjusted. Please review your updated itinerary on the SkyWings portal or via your digital e-ticket.`,
          type: 'SCHEDULE_CHANGED',
        });
        break;
      default:
        break;
    }
  };

  // Send Direct Operational Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messagingTarget) return;
    setSendingMessage(true);

    try {
      const payload = {
        flightId: messagingTarget.flightId || null,
        title: messageData.title.trim(),
        message: messageData.message.trim(),
        type: messageData.type,
      };

      const res = await notificationService.broadcastNotification(payload);
      if (res.success || res.status === 'OK') {
        setToast({
          type: 'success',
          text: `Operational message sent to passengers on Flight ${messagingTarget.flightNumber} (including ${messagingTarget.fullName}).`,
        });
        setMessagingTarget(null);
      } else {
        setToast({ type: 'error', text: res.message || 'Failed to dispatch passenger message.' });
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send message to passenger.',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'TBD';
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast Alert */}
        {toast.text && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-semibold">{toast.text}</span>
            </div>
            <button
              onClick={() => setToast({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100">
              <Users className="w-3.5 h-3.5" />
              Passenger Manifest & Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Passenger Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live manifest roster, seat assignments, traveler contacts, and real-time operational communications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Manifest'}
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Manifest (CSV)
            </button>
          </div>
        </div>

        {/* Analytics KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Travelers</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Bookings</p>
              <p className="text-2xl font-extrabold text-emerald-600">{stats.confirmed}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Class</p>
              <p className="text-2xl font-extrabold text-purple-600">{stats.business}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Economy Class</p>
              <p className="text-2xl font-extrabold text-amber-600">{stats.economy}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by passenger name, email, phone, PNR, flight number, seat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>

            {/* Cabin Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Cabins</option>
              <option value="BUSINESS">Business Class</option>
              <option value="ECONOMY">Economy Class</option>
            </select>

            {/* Flight Filter */}
            <select
              value={flightFilter}
              onChange={(e) => setFlightFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Flights</option>
              {uniqueFlightNumbers.map((fn) => (
                <option key={fn} value={fn}>
                  Flight {fn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Passenger Manifest Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Retrieving operational passenger manifests...</p>
            </div>
          ) : filteredManifest.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Passengers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No travelers matched your search query or filter selection. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Passenger Details</th>
                    <th className="py-3.5 px-4">Contact Information</th>
                    <th className="py-3.5 px-4">Flight & Routing</th>
                    <th className="py-3.5 px-4">Seat & Cabin</th>
                    <th className="py-3.5 px-4">PNR / Fare</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredManifest.map((p) => {
                    const isBusiness = p.seatClass.toUpperCase().includes('BUSINESS');
                    const isCancelled = p.bookingStatus === 'CANCELLED';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Passenger Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                                isBusiness
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-sky-100 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {p.fullName ? p.fullName.slice(0, 2) : 'PA'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {p.fullName}
                                {isBusiness && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{p.gender || 'Traveler'}</span>
                                {p.passportNumber && p.passportNumber !== 'N/A' && (
                                  <>
                                    <span>•</span>
                                    <span>Pass: {p.passportNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Information */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[160px]">{p.email}</span>
                              <button
                                onClick={() => handleCopy(p.email, `email-${p.id}`)}
                                title="Copy Email"
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {copiedItem === `email-${p.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {p.phone && p.phone !== 'N/A' && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{p.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Flight & Routing */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <Plane className="w-3.5 h-3.5 text-sky-600" />
                              <span>{p.flightNumber}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({p.originCode} &rarr; {p.destCode})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {p.originCity} to {p.destCity}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(p.departureTime)}
                            </div>
                          </div>
                        </td>

                        {/* Seat & Cabin */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs tracking-wider">
                              {p.seatNumber}
                            </span>
                            <div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isBusiness
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {p.seatClass}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* PNR / Fare */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center gap-1 font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 w-fit">
                              <span>{p.pnrNumber}</span>
                              <button
                                onClick={() => handleCopy(p.pnrNumber, `pnr-${p.id}`)}
                                title="Copy PNR"
                                className="text-sky-600 hover:text-sky-900 transition-colors"
                              >
                                {copiedItem === `pnr-${p.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-slate-800 font-extrabold text-[11px] mt-1">
                              ₹{Math.round(p.fare).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isCancelled
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isCancelled ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {p.bookingStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Profile */}
                            <button
                              onClick={() => setSelectedPassenger(p)}
                              title="View Passenger Profile & Ticket"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* View E-Ticket */}
                            <Link
                              to={`/e-ticket/${p.pnrNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Passenger Digital Boarding Pass"
                              className="p-1.5 rounded-lg border border-slate-200 text-sky-600 hover:bg-sky-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {/* Direct Message */}
                            <button
                              onClick={() => handleOpenMessageModal(p)}
                              title="Dispatch Operational Alert / Message"
                              className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Passenger Detailed Profile */}
        {selectedPassenger && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                    {selectedPassenger.fullName ? selectedPassenger.fullName.slice(0, 2) : 'PA'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedPassenger.fullName}</h3>
                    <p className="text-xs text-slate-400">
                      Booking Reference PNR: <span className="font-mono font-bold text-sky-700">{selectedPassenger.pnrNumber}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPassenger(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal Details</p>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="font-semibold text-slate-500">Gender:</span> {selectedPassenger.gender || 'Not specified'}</p>
                    <p><span className="font-semibold text-slate-500">Date of Birth:</span> {selectedPassenger.dateOfBirth || 'N/A'}</p>
                    <p><span className="font-semibold text-slate-500">Passport / Gov ID:</span> {selectedPassenger.passportNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Information</p>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedPassenger.email}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedPassenger.phone}</p>
                    <p><span className="font-semibold text-slate-500">Booking Date:</span> {formatDateTime(selectedPassenger.bookingDate)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Flight & Routing</p>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p className="font-bold text-slate-900">{selectedPassenger.flightNumber} ({selectedPassenger.airline})</p>
                    <p>{selectedPassenger.originCity} ({selectedPassenger.originCode}) &rarr; {selectedPassenger.destCity} ({selectedPassenger.destCode})</p>
                    <p><span className="font-semibold text-slate-500">Departure:</span> {formatDateTime(selectedPassenger.departureTime)}</p>
                    <p><span className="font-semibold text-slate-500">Gate:</span> {selectedPassenger.gate || 'TBD'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seat & Fare</p>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p><span className="font-semibold text-slate-500">Seat Number:</span> <span className="font-mono font-bold text-slate-900">{selectedPassenger.seatNumber}</span></p>
                    <p><span className="font-semibold text-slate-500">Cabin Class:</span> <span className="font-bold text-indigo-700">{selectedPassenger.seatClass}</span></p>
                    <p><span className="font-semibold text-slate-500">Ticket Fare:</span> <span className="font-extrabold text-emerald-700">₹{Math.round(selectedPassenger.fare).toLocaleString('en-IN')}</span></p>
                    <p><span className="font-semibold text-slate-500">Status:</span> <span className="font-bold text-slate-900">{selectedPassenger.bookingStatus}</span></p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  to={`/e-ticket/${selectedPassenger.pnrNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Digital Boarding Pass
                </Link>
                <button
                  onClick={() => {
                    const p = selectedPassenger;
                    setSelectedPassenger(null);
                    handleOpenMessageModal(p);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Dispatch Operational Message / Passenger Alert */}
        {messagingTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-1">
                    <Send className="w-3 h-3" /> Direct Operational Communication
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message Passenger & Flight</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: <span className="font-bold text-slate-800">{messagingTarget.fullName}</span> ({messagingTarget.email}) &bull; Flight {messagingTarget.flightNumber}
                  </p>
                </div>
                <button
                  onClick={() => setMessagingTarget(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Alert Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('DELAY')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Delay Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('GATE')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    Gate Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('BOARDING')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    Boarding Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('RESCHEDULE')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notification Category</label>
                  <select
                    value={messageData.type}
                    onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPERATIONAL_ALERT">Operational Alert (General)</option>
                    <option value="FLIGHT_DELAYED">Flight Delay Notice</option>
                    <option value="SCHEDULE_CHANGED">Schedule Adjustment</option>
                    <option value="GATE_CHANGED">Gate Change Advisory</option>
                    <option value="FLIGHT_BOARDING">Gate Boarding Notice</option>
                    <option value="FLIGHT_CANCELLED">Flight Cancellation Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Header</label>
                  <input
                    type="text"
                    required
                    value={messageData.title}
                    onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This notification will be instantly logged in the passenger's account alerts and the flight operations registry.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMessagingTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingMessage ? 'Transmitting Alert...' : 'Transmit Message'}
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

export default AdminPassengersPage;
