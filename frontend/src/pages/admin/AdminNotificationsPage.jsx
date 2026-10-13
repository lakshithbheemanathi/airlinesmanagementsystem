import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plane,
  Users,
  Shield,
  Radio
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import flightService from '../../services/flightService';
import notificationService from '../../services/notificationService';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [formData, setFormData] = useState({
    flightId: '',
    title: '',
    message: '',
    type: 'OPERATIONAL_ALERT',
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [notifsRes, flightsRes] = await Promise.all([
        notificationService.getAllNotifications(),
        flightService.getAllFlights(),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
      if (flightsRes.success && flightsRes.data) {
        setFlights(flightsRes.data);
      }
    } catch (err) {
      console.error('Failed to load notifications or flights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);

    try {
      const payload = {
        flightId: formData.flightId ? parseInt(formData.flightId) : null,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      const res = await notificationService.broadcastNotification(payload);
      if (res.success) {
        setToast({
          type: 'success',
          text: 'Operational alert broadcasted successfully to passengers!',
        });
        setShowBroadcastModal(false);
        setFormData({
          flightId: '',
          title: '',
          message: '',
          type: 'OPERATIONAL_ALERT',
        });
        fetchData(true);
      }
    } catch (err) {
      setToast({
        type: 'error',
        text: err.response?.data?.message || 'Failed to dispatch broadcast alert.',
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.recipientName?.toLowerCase().includes(q) ||
      n.flightNumber?.toLowerCase().includes(q) ||
      n.type?.toLowerCase().includes(q)
    );
  });

  const getAlertBadge = (type) => {
    switch (type) {
      case 'FLIGHT_DELAYED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">DELAY</span>;
      case 'FLIGHT_CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">CANCEL</span>;
      case 'FLIGHT_BOARDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">BOARDING</span>;
      case 'BOOKING_CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">CONFIRMED</span>;
      case 'BOOKING_CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">REFUND</span>;
      case 'GATE_CHANGED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">GATE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">{type}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-sky-600" />
              Airline Broadcasts &amp; Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live transmission log of flight notifications, delay advisories, and system operational broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Broadcast New Alert
            </button>
          </div>
        </div>

        {/* Toast */}
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

        {/* Search */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications by title, recipient, flight, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {/* Notifications Roster */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading broadcast archive...
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
            No notifications found matching your search.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3.5 px-4">Alert Type</th>
                    <th className="py-3.5 px-4">Title &amp; Message</th>
                    <th className="py-3.5 px-4">Flight</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotifs.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getAlertBadge(n.type)}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <span className="font-extrabold text-slate-900 block text-xs">{n.title}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {n.flightNumber ? (
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                            {n.flightNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">System-wide</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 text-xs block">
                          {n.recipientName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(n.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {n.isRead ? (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Read
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-sky-600 flex items-center justify-end gap-1">
                            <Radio className="w-3 h-3 text-sky-500 animate-pulse" /> Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Broadcast Operational Alert</h3>
                    <p className="text-[11px] text-slate-400">
                      Transmit an advisory alert to passengers across the SkyWings network.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Flight Audience</label>
                  <select
                    value={formData.flightId}
                    onChange={(e) => setFormData({ ...formData, flightId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">All SkyWings Passengers (System-Wide Advisory)</option>
                    {flights.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.flightNumber} &mdash; {f.sourceAirport} to {f.destinationAirport} ({f.aircraftModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alert Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="OPERATIONAL_ALERT">Operational Alert</option>
                    <option value="WEATHER_ADVISORY">Weather Advisory</option>
                    <option value="GATE_CHANGED">Gate Change Announcement</option>
                    <option value="FLIGHT_DELAYED">Flight Delay Advisory</option>
                    <option value="SYSTEM_UPDATE">System Update</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alert Headline / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Weather Advisory: Approaching Fog at SFO"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    placeholder="Detail the announcement, passenger instructions, or operational guidelines..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {broadcasting ? 'Transmitting...' : 'Send Broadcast'}
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

export default AdminNotificationsPage;
