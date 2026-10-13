import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plane,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Bell,
  Edit3,
  MapPin,
  Shield,
  ArrowRight,
  Send
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import flightService from '../../services/flightService';
import notificationService from '../../services/notificationService';

const AdminSchedulesPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    status: 'SCHEDULED',
    departureTime: '',
    arrivalTime: '',
    gate: '',
    broadcastMessage: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const fetchFlights = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await flightService.getAllFlights();
      if (res.success && res.data) {
        setFlights(res.data);
      }
    } catch (err) {
      console.error('Failed to load flight schedules:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleOpenEditModal = (flight) => {
    setEditingFlight(flight);
    setFormData({
      status: flight.status || 'SCHEDULED',
      departureTime: flight.departureTime ? flight.departureTime.substring(0, 16) : '',
      arrivalTime: flight.arrivalTime ? flight.arrivalTime.substring(0, 16) : '',
      gate: flight.gate || '',
      broadcastMessage: '',
    });
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!editingFlight) return;
    setSaving(true);

    try {
      const payload = {
        status: formData.status,
        departureTime: formData.departureTime ? formData.departureTime + ':00' : null,
        arrivalTime: formData.arrivalTime ? formData.arrivalTime + ':00' : null,
        gate: formData.gate,
        broadcastMessage: formData.broadcastMessage,
      };

      const res = await notificationService.updateFlightSchedule(editingFlight.id, payload);
      if (res.success) {
        setToast({
          type: 'success',
          text: `Flight ${editingFlight.flightNumber} schedule updated! Alert broadcasted to all booked passengers.`,
        });
        setEditingFlight(null);
        fetchFlights(true);
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update flight schedule.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredFlights = flights.filter((f) => {
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sourceAirport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destinationAirport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sourceCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">SCHEDULED</span>;
      case 'BOARDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">BOARDING</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">DELAYED</span>;
      case 'DEPARTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">DEPARTED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-sky-600" />
              Flight Schedule Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live operational dispatch, departure gates, schedule adjustments, and passenger broadcast alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchFlights(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toast.text && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{toast.text}</span>
            <button onClick={() => setToast({ type: '', text: '' })} className="font-bold ml-3">
              &times;
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flight number, city, or airport code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {['ALL', 'SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
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

        {/* Schedule Roster Table */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading active flight schedules...
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3.5 px-4">Flight</th>
                    <th className="py-3.5 px-4">Origin &rarr; Destination</th>
                    <th className="py-3.5 px-4">Departure Time</th>
                    <th className="py-3.5 px-4">Arrival Time</th>
                    <th className="py-3.5 px-4">Gate</th>
                    <th className="py-3.5 px-4">Operational Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFlights.map((f) => {
                    const dep = new Date(f.departureTime);
                    const arr = new Date(f.arrivalTime);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-sm text-slate-900 block">
                            {f.flightNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{f.aircraftModel}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-800 block">
                            {f.sourceAirport} &rarr; {f.destinationAirport}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {f.sourceCity} to {f.destinationCity}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">
                            {dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {dep.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">
                            {arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {arr.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {f.gate || 'TBD'}
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(f.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditModal(f)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Adjust Schedule
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Schedule & Operational Adjustment Modal */}
        {editingFlight && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Adjust Schedule: {editingFlight.flightNumber}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingFlight.sourceAirport} &rarr; {editingFlight.destinationAirport} &bull; {editingFlight.aircraftModel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingFlight(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
                {/* Status Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="SCHEDULED">SCHEDULED (On Time)</option>
                    <option value="BOARDING">BOARDING (Gate Open)</option>
                    <option value="DELAYED">DELAYED (Schedule Setback)</option>
                    <option value="DEPARTED">DEPARTED (En Route)</option>
                    <option value="CANCELLED">CANCELLED (Release Seats)</option>
                  </select>
                </div>

                {/* Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Arrival Time</label>
                    <input
                      type="datetime-local"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Departure Gate */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departure Gate</label>
                  <input
                    type="text"
                    placeholder="e.g. T4-B12"
                    value={formData.gate}
                    onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 font-mono"
                  />
                </div>

                {/* Passenger Broadcast Note */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Passenger Notification Broadcast Note (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Sent to all ticketed passengers</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Flight departure delayed by 45 minutes due to air traffic control. Complimentary refreshments available at gate."
                    value={formData.broadcastMessage}
                    onChange={(e) => setFormData({ ...formData, broadcastMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 text-[11px] flex items-start gap-2">
                  <Bell className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Saving this update will immediately broadcast an in-app flight alert to all travelers holding confirmed reservations on flight <strong>{editingFlight.flightNumber}</strong>.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingFlight(null)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {saving ? 'Broadcasting...' : 'Update & Broadcast'}
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

export default AdminSchedulesPage;
