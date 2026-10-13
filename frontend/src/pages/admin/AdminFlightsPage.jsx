import React, { useState, useEffect } from 'react';
import {
  Plane,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  Calendar,
  Users,
  Shield,
  Luggage,
  Sparkles,
  ArrowRight,
  Armchair,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import flightService from '../../services/flightService';

const AIRPORT_SUGGESTIONS = [
  { code: 'HYD', city: 'Hyderabad', country: 'India', type: 'DOMESTIC' },
  { code: 'DEL', city: 'New Delhi', country: 'India', type: 'DOMESTIC' },
  { code: 'BOM', city: 'Mumbai', country: 'India', type: 'DOMESTIC' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', type: 'DOMESTIC' },
  { code: 'GOI', city: 'Goa', country: 'India', type: 'DOMESTIC' },
  { code: 'CCU', city: 'Kolkata', country: 'India', type: 'DOMESTIC' },
  { code: 'MAA', city: 'Chennai', country: 'India', type: 'DOMESTIC' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', type: 'INTERNATIONAL' },
  { code: 'LHR', city: 'London', country: 'UK', type: 'INTERNATIONAL' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', type: 'INTERNATIONAL' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', type: 'INTERNATIONAL' },
  { code: 'JFK', city: 'New York', country: 'USA', type: 'INTERNATIONAL' },
];

const AdminFlightsPage = () => {
  const [flights, setFlights] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [flightTypeFilter, setFlightTypeFilter] = useState('ALL');

  // Modal: Add / Edit Flight (CREATE & UPDATE)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    flightNumber: '',
    airlineName: 'SkyWings Airlines',
    aircraftId: '',
    sourceAirport: 'HYD',
    destinationAirport: 'DEL',
    sourceCity: 'Hyderabad',
    destinationCity: 'New Delhi',
    departureTime: '',
    arrivalTime: '',
    economyFare: '',
    businessFare: '',
    gate: 'T1-G01',
    baggageAllowance: '7 kg Cabin, 15 kg Check-in',
    status: 'SCHEDULED',
    flightType: 'DOMESTIC',
  });

  // Modal: View Flight Details (READ)
  const [viewingFlight, setViewingFlight] = useState(null);
  const [flightSeatsData, setFlightSeatsData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Modal: Delete / Deactivate Flight (DELETE)
  const [deletingFlight, setDeletingFlight] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsRes, aircraftRes] = await Promise.all([
        flightService.getAdminFlights(),
        flightService.getAircraftList(),
      ]);

      if (flightsRes.success) setFlights(flightsRes.data);
      if (aircraftRes.success) {
        setAircraftList(aircraftRes.data);
        if (aircraftRes.data.length > 0 && !formData.aircraftId) {
          setFormData((prev) => ({ ...prev, aircraftId: aircraftRes.data[0].id }));
        }
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to load flights roster.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Airport code change with auto-city detection
  const handleSourceAirportChange = (val) => {
    const code = val.toUpperCase();
    const matched = AIRPORT_SUGGESTIONS.find((a) => a.code === code);
    setFormData((prev) => ({
      ...prev,
      sourceAirport: code,
      sourceCity: matched ? matched.city : prev.sourceCity,
      flightType:
        matched?.type === 'INTERNATIONAL' || prev.destinationAirport === 'DXB' || prev.destinationAirport === 'LHR' || prev.destinationAirport === 'SIN' || prev.destinationAirport === 'BKK' || prev.destinationAirport === 'JFK'
          ? 'INTERNATIONAL'
          : 'DOMESTIC',
    }));
  };

  const handleDestAirportChange = (val) => {
    const code = val.toUpperCase();
    const matched = AIRPORT_SUGGESTIONS.find((a) => a.code === code);
    setFormData((prev) => ({
      ...prev,
      destinationAirport: code,
      destinationCity: matched ? matched.city : prev.destinationCity,
      flightType:
        matched?.type === 'INTERNATIONAL' || prev.sourceAirport === 'DXB' || prev.sourceAirport === 'LHR' || prev.sourceAirport === 'SIN' || prev.sourceAirport === 'BKK' || prev.sourceAirport === 'JFK'
          ? 'INTERNATIONAL'
          : 'DOMESTIC',
    }));
  };

  // Open Create Modal
  const openAddModal = () => {
    setEditingFlight(null);
    setFormData({
      flightNumber: '',
      airlineName: 'SkyWings Airlines',
      aircraftId: aircraftList[0]?.id || '',
      sourceAirport: 'HYD',
      destinationAirport: 'DEL',
      sourceCity: 'Hyderabad',
      destinationCity: 'New Delhi',
      departureTime: '',
      arrivalTime: '',
      economyFare: 4499,
      businessFare: 12999,
      gate: 'T1-G08',
      baggageAllowance: '7 kg Cabin, 15 kg Check-in',
      status: 'SCHEDULED',
      flightType: 'DOMESTIC',
    });
    setModalOpen(true);
  };

  // Open Edit Modal (UPDATE)
  const openEditModal = (flight) => {
    setEditingFlight(flight);
    setFormData({
      flightNumber: flight.flightNumber,
      airlineName: flight.airlineName,
      aircraftId: flight.aircraftId,
      sourceAirport: flight.sourceAirport,
      destinationAirport: flight.destinationAirport,
      sourceCity: flight.sourceCity,
      destinationCity: flight.destinationCity,
      departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : '',
      arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : '',
      economyFare: flight.economyFare,
      businessFare: flight.businessFare,
      gate: flight.gate || 'T1-G01',
      baggageAllowance: flight.baggageAllowance || '7 kg Cabin, 15 kg Check-in',
      status: flight.status,
      flightType: flight.flightType || 'DOMESTIC',
    });
    setModalOpen(true);
  };

  // Open View Details Modal (READ)
  const handleOpenViewModal = async (flight) => {
    setViewingFlight(flight);
    setLoadingSeats(true);
    setFlightSeatsData(null);
    try {
      const res = await flightService.getFlightSeats(flight.id);
      if (res.success) {
        setFlightSeatsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load seating map for flight:', err);
    } finally {
      setLoadingSeats(false);
    }
  };

  // Duration calculation helper
  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return null;
    const d = new Date(dep);
    const a = new Date(arr);
    const diffMins = Math.round((a - d) / 60000);
    if (diffMins <= 0) return 'Invalid sequence: Arrival must be after Departure';
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m (${diffMins} mins)`;
  };

  // CREATE or UPDATE submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification({ type: '', message: '' });

    // Validate datetime sequence
    if (new Date(formData.departureTime) >= new Date(formData.arrivalTime)) {
      setNotification({
        type: 'error',
        message: 'Arrival date & time must be strictly after Departure date & time.',
      });
      setSaving(false);
      return;
    }

    try {
      const formatLocalIso = (dt) => {
        if (!dt) return null;
        if (dt.length === 16) return dt + ':00';
        return dt;
      };

      const payload = {
        ...formData,
        flightNumber: formData.flightNumber.trim().toUpperCase(),
        sourceAirport: formData.sourceAirport.trim().toUpperCase(),
        destinationAirport: formData.destinationAirport.trim().toUpperCase(),
        sourceCity: formData.sourceCity.trim(),
        destinationCity: formData.destinationCity.trim(),
        aircraftId: Number(formData.aircraftId),
        economyFare: Number(formData.economyFare),
        businessFare: Number(formData.businessFare),
        departureTime: formatLocalIso(formData.departureTime),
        arrivalTime: formatLocalIso(formData.arrivalTime),
      };

      if (editingFlight) {
        const res = await flightService.updateFlight(editingFlight.id, payload);
        if (res.success) {
          setNotification({ type: 'success', message: `Flight ${res.data.flightNumber} updated successfully!` });
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await flightService.createFlight(payload);
        if (res.success) {
          setNotification({
            type: 'success',
            message: `Flight ${res.data.flightNumber} scheduled & seating layout generated!`,
          });
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving flight. Please verify form values.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // DELETE handler (Safe Cancel vs Permanent Purge)
  const handleConfirmDelete = async (purge = false) => {
    if (!deletingFlight) return;
    setDeleting(true);
    try {
      const res = await flightService.deleteFlight(deletingFlight.id, purge);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || `Flight ${deletingFlight.flightNumber} processed successfully.`,
        });
        setDeletingFlight(null);
        fetchData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete flight.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredFlights = flights.filter((f) => {
    const matchesSearch =
      f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sourceAirport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destinationAirport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sourceCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesType = flightTypeFilter === 'ALL' || (f.flightType && f.flightType.toUpperCase() === flightTypeFilter);
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">SCHEDULED</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">DELAYED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Plane className="w-6 h-6 text-sky-600" /> Commercial Flight Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create, inspect seating layouts, update flight telemetry, or delete commercial flights.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" /> Schedule New Flight
          </button>
        </div>

        {/* Global Alert Notification */}
        {notification.message && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flight no, airport code, city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={flightTypeFilter}
              onChange={(e) => setFlightTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Routes</option>
              <option value="DOMESTIC">🇮🇳 Domestic (India)</option>
              <option value="INTERNATIONAL">🌐 International</option>
            </select>

            <span className="text-xs text-slate-500 font-medium ml-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DELAYED">Delayed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={fetchData}
              title="Refresh Roster"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Flights Table (READ) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Flight</th>
                  <th className="px-5 py-3.5">Route</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Aircraft</th>
                  <th className="px-5 py-3.5">Seats (Avail/Total)</th>
                  <th className="px-5 py-3.5">Fares (INR)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading flight inventory...
                      </div>
                    </td>
                  </tr>
                ) : filteredFlights.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      No flights found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFlights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                            SW
                          </div>
                          <div>
                            <span className="block text-slate-900 font-extrabold">{flight.flightNumber}</span>
                            <span className="text-[10px] text-slate-400">{flight.airlineName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{flight.sourceAirport}</span>
                          <span className="text-sky-500">&rarr;</span>
                          <span>{flight.destinationAirport}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {flight.sourceCity} to {flight.destinationCity}
                        </div>
                        <div className="mt-1">
                          {flight.flightType === 'INTERNATIONAL' ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                              🌐 International
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🇮🇳 Domestic
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(flight.departureTime).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &rarr;{' '}
                          {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{flight.aircraftModel}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{flight.aircraftRegistration}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          <span className="text-emerald-600">{flight.availableSeats}</span> / {flight.totalSeats}
                        </div>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${((flight.availableSeats / (flight.totalSeats || 1)) * 100).toFixed(0)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-mono">
                        <div className="text-slate-800 font-bold">
                          E: <span className="text-sky-600">₹{Math.round(flight.economyFare).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          B: <span className="text-purple-600 font-semibold">₹{Math.round(flight.businessFare).toLocaleString('en-IN')}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(flight.status)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* READ button */}
                          <button
                            onClick={() => handleOpenViewModal(flight)}
                            title="View Flight Details & Seat Map"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* UPDATE button */}
                          <button
                            onClick={() => openEditModal(flight)}
                            title="Edit Flight"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* DELETE button */}
                          <button
                            onClick={() => setDeletingFlight(flight)}
                            title="Delete or Deactivate Flight"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: CREATE & UPDATE FLIGHT */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-600" />
                    {editingFlight ? `Update Flight ${editingFlight.flightNumber}` : 'Schedule New Commercial Flight'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingFlight
                      ? 'Modify flight telemetry, gate, pricing, or status.'
                      : 'Flight seating maps and class layouts are automatically generated.'}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flight Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SW-520"
                      value={formData.flightNumber}
                      onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 uppercase focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aircraft Fleet *</label>
                    <select
                      required
                      value={formData.aircraftId}
                      onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      {aircraftList.map((ac) => (
                        <option key={ac.id} value={ac.id}>
                          {ac.modelName} ({ac.registrationNo}) - {ac.totalSeats} seats
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Origin and Destination */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source Code *</label>
                    <input
                      type="text"
                      required
                      list="admin-airports"
                      placeholder="HYD"
                      maxLength={4}
                      value={formData.sourceAirport}
                      onChange={(e) => handleSourceAirportChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Hyderabad"
                      value={formData.sourceCity}
                      onChange={(e) => setFormData({ ...formData, sourceCity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dest Code *</label>
                    <input
                      type="text"
                      required
                      list="admin-airports"
                      placeholder="DEL"
                      maxLength={4}
                      value={formData.destinationAirport}
                      onChange={(e) => handleDestAirportChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dest City *</label>
                    <input
                      type="text"
                      required
                      placeholder="New Delhi"
                      value={formData.destinationCity}
                      onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Airport Datalist helper */}
                <datalist id="admin-airports">
                  {AIRPORT_SUGGESTIONS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.country})
                    </option>
                  ))}
                </datalist>

                {/* Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Live Duration Preview */}
                {formData.departureTime && formData.arrivalTime && (
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs text-sky-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5" /> Calculated Flight Duration:
                    </span>
                    <span className="font-mono font-bold">
                      {calculateDuration(formData.departureTime, formData.arrivalTime)}
                    </span>
                  </div>
                )}

                {/* Fares, Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flight Category *</label>
                    <select
                      value={formData.flightType}
                      onChange={(e) => setFormData({ ...formData, flightType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="DOMESTIC">🇮🇳 Domestic (India)</option>
                      <option value="INTERNATIONAL">🌐 International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Economy Fare (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="4499"
                      value={formData.economyFare}
                      onChange={(e) => setFormData({ ...formData, economyFare: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Fare (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="12999"
                      value={formData.businessFare}
                      onChange={(e) => setFormData({ ...formData, businessFare: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flight Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="DELAYED">DELAYED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Gate and Baggage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Gate</label>
                    <input
                      type="text"
                      placeholder="T1-G08"
                      value={formData.gate}
                      onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Baggage Allowance Policy</label>
                    <input
                      type="text"
                      placeholder="7 kg Cabin, 15 kg Check-in"
                      value={formData.baggageAllowance}
                      onChange={(e) => setFormData({ ...formData, baggageAllowance: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 active:scale-95 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingFlight ? 'Update Flight' : 'Schedule Flight & Generate Seats'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: READ FLIGHT DETAILS & SEAT MAP */}
        {viewingFlight && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {viewingFlight.flightNumber}
                    </span>
                    {viewingFlight.flightType === 'INTERNATIONAL' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        🌐 International
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🇮🇳 Domestic
                      </span>
                    )}
                    {getStatusBadge(viewingFlight.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{viewingFlight.airlineName}</p>
                </div>
                <button
                  onClick={() => setViewingFlight(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Route Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black">{viewingFlight.sourceAirport}</span>
                  <p className="text-xs text-slate-400">{viewingFlight.sourceCity}</p>
                  <p className="text-[11px] text-sky-400 font-mono mt-1">
                    {new Date(viewingFlight.departureTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {viewingFlight.durationMinutes ? `${Math.floor(viewingFlight.durationMinutes / 60)}h ${viewingFlight.durationMinutes % 60}m` : 'Direct'}
                  </span>
                  <div className="flex items-center gap-2 my-1">
                    <div className="w-8 h-0.5 bg-slate-700"></div>
                    <Plane className="w-4 h-4 text-sky-400" />
                    <div className="w-8 h-0.5 bg-slate-700"></div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Gate {viewingFlight.gate || 'T1-G01'}</span>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black">{viewingFlight.destinationAirport}</span>
                  <p className="text-xs text-slate-400">{viewingFlight.destinationCity}</p>
                  <p className="text-[11px] text-sky-400 font-mono mt-1">
                    {new Date(viewingFlight.arrivalTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Aircraft Fleet</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{viewingFlight.aircraftModel}</span>
                  <span className="text-[10px] font-mono text-slate-500">{viewingFlight.aircraftRegistration}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Economy Fare</span>
                  <span className="text-sm font-black text-sky-700 block mt-0.5">
                    ₹{Math.round(viewingFlight.economyFare).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500">Standard Class</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Fare</span>
                  <span className="text-sm font-black text-purple-700 block mt-0.5">
                    ₹{Math.round(viewingFlight.businessFare).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500">Premium Cabin</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Baggage Policy</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate" title={viewingFlight.baggageAllowance}>
                    {viewingFlight.baggageAllowance}
                  </span>
                  <span className="text-[10px] text-slate-500">Complimentary</span>
                </div>
              </div>

              {/* Seating Map & Fleet Availability Breakdown */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-sky-600" /> Real-time Seating Telemetry
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    <span className="text-emerald-600 font-extrabold">{viewingFlight.availableSeats}</span> Available &bull;{' '}
                    <span className="text-slate-900 font-extrabold">{viewingFlight.bookedSeats}</span> Booked of {viewingFlight.totalSeats}
                  </span>
                </div>

                {/* Load Factor Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round(((viewingFlight.bookedSeats || 0) / (viewingFlight.totalSeats || 1)) * 100))}%`,
                    }}
                  />
                </div>

                {/* Seat Map Layout Preview */}
                {loadingSeats ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching seating layout...
                  </div>
                ) : flightSeatsData?.seats ? (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-bold text-slate-500">
                      <span>Cabin Grid Preview:</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block"></span> Booked
                        </span>
                      </div>
                    </div>

                    <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-8 sm:grid-cols-12 gap-1">
                      {flightSeatsData.seats.map((seat) => (
                        <div
                          key={seat.id}
                          title={`Seat ${seat.seatNumber} (${seat.seatClass}) - ${seat.isBooked ? 'Booked' : 'Available: ₹' + seat.price}`}
                          className={`p-1 text-center rounded text-[10px] font-mono font-bold transition-all ${
                            seat.isBooked
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : seat.seatClass === 'BUSINESS'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {seat.seatNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Footer with Quick Edit & Dismiss */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const f = viewingFlight;
                    setViewingFlight(null);
                    setDeletingFlight(f);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete / Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const f = viewingFlight;
                      setViewingFlight(null);
                      openEditModal(f);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingFlight(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: DELETE OR DEACTIVATE FLIGHT (DELETE) */}
        {deletingFlight && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setDeletingFlight(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delete Flight {deletingFlight.flightNumber}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Route: <strong className="text-slate-800">{deletingFlight.sourceAirport} &rarr; {deletingFlight.destinationAirport}</strong> ({deletingFlight.sourceCity} to {deletingFlight.destinationCity})
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departure:</span>
                    <span className="font-semibold text-slate-800">{new Date(deletingFlight.departureTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Bookings:</span>
                    <span className={`font-bold ${deletingFlight.bookedSeats > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {deletingFlight.bookedSeats} passenger(s) booked
                    </span>
                  </div>
                </div>
              </div>

              {deletingFlight.bookedSeats > 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" /> Notice on Active Reservations:
                  </span>
                  <span>
                    This flight currently has booked passengers. Deactivating it as <strong>CANCELLED</strong> preserves passenger tickets, while <strong>Permanent Delete</strong> purges the flight and its associated records.
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  This flight has 0 passenger bookings. You can cleanly delete it from the database or deactivate it.
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => handleConfirmDelete(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Deactivate & Mark as CANCELLED
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => handleConfirmDelete(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Permanently Delete from Database
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeletingFlight(null)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Keep Flight (Cancel)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFlightsPage;
