import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Ticket,
  Plane,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

const ProfilePage = () => {
  const { user, isAuthenticated, isAdmin, updateProfile, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  // Travel Stats
  const [bookingStats, setBookingStats] = useState({ total: 0, confirmed: 0, cancelled: 0 });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await bookingService.getMyBookings();
        if (res.success && res.data) {
          const list = res.data;
          setBookingStats({
            total: list.length,
            confirmed: list.filter((b) => b.bookingStatus === 'CONFIRMED').length,
            cancelled: list.filter((b) => b.bookingStatus === 'CANCELLED').length,
          });
        }
      } catch (err) {
        // Quiet fail
      }
    };

    fetchUserStats();
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setNotice({ type: '', text: '' });

    try {
      const res = await updateProfile({ fullName, phone });
      if (res.success) {
        setNotice({ type: 'success', text: 'Personal details updated successfully!' });
      } else {
        setNotice({ type: 'error', text: res.message });
      }
    } catch (err) {
      setNotice({ type: 'error', text: 'Failed to update personal details.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setNotice({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: 'error', text: 'Password confirmation does not match.' });
      return;
    }

    setSavingPassword(true);
    setNotice({ type: '', text: '' });

    try {
      const res = await updateProfile({ newPassword });
      if (res.success) {
        setNotice({ type: 'success', text: 'Security credentials updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setNotice({ type: 'error', text: res.message });
      }
    } catch (err) {
      setNotice({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Profile</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your SkyWings traveler account details, personal security settings, and travel milestones.
        </p>
        <button
          onClick={() => login('passenger@skywings.com', 'user123')}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> 1-Click Passenger Sign In
        </button>
      </div>
    );
  }

  const initials = (user?.fullName || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Profile Header Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-sky-500/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isAdmin ? 'bg-purple-900/80 text-purple-200 border border-purple-700/60' : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
              }`}>
                {isAdmin ? 'Operations Administrator' : 'SkyClub Frequent Flyer'}
              </span>
            </div>
            <p className="text-xs text-slate-300">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-sky-400" /> {user.phone || '+1 (555) 019-2834'}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Account Verified
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/my-bookings"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
          >
            <Ticket className="w-4 h-4 text-sky-400" /> My Bookings
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}
        </div>
      </div>

      {/* Global Feedback Alert */}
      {notice.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
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

      {/* Travel Milestone Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total Reservations</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{bookingStats.total}</span>
            <span className="text-[11px] text-slate-500">All-time SkyWings itineraries</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Active Flights</span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{bookingStats.confirmed}</span>
            <span className="text-[11px] text-slate-500">Guaranteed boarding passes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Cancelled Flights</span>
            <span className="text-2xl font-black text-slate-700 mt-0.5 block">{bookingStats.cancelled}</span>
            <span className="text-[11px] text-slate-500">90% refund policy processed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
              <p className="text-[11px] text-slate-400">Update your passenger profile name and contact number</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Primary SkyWings login identifier &bull; Read-only
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Telephone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>
              <p className="text-[11px] text-slate-400">Change your password to secure account reservations</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Key className="w-3.5 h-3.5 text-purple-600" /> Password Security Guidelines
              </div>
              <p>Must be at least 6 characters. Use letters, numbers, and symbols for best protection.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
