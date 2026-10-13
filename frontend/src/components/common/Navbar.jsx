import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, User, Shield, Menu, X, Bell, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification State (Stage 12)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);

  const fetchNotificationData = async () => {
    if (!isAuthenticated) return;
    try {
      const [notifsRes, unreadRes] = await Promise.all([
        notificationService.getUserNotifications(),
        notificationService.getUnreadCount(),
      ]);
      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
      if (unreadRes.success && unreadRes.data) {
        setUnreadCount(unreadRes.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail for guest
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationData();
      const interval = setInterval(fetchNotificationData, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const toggleBell = () => {
    setBellOpen(!bellOpen);
    if (!bellOpen) {
      fetchNotificationData();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <Plane className="w-6 h-6 text-white transform -rotate-45" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-sky-300">
              SkyWings
            </span>
            <span className="text-[10px] block text-sky-400 font-semibold tracking-wider">AIRLINE MANAGEMENT</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive('/search') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Search Flights
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-bookings"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/my-bookings') ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Notification Bell Dropdown (Stage 12) */}
              <div className="relative">
                <button
                  onClick={toggleBell}
                  className="relative w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                  title="Flight Alerts & Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white font-mono font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-xs">Flight Alerts &amp; Updates</span>
                      </div>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No notification alerts yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkSingleRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                              !n.isRead ? 'bg-sky-50/60' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900 line-clamp-1">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-sky-600 flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                              {n.flightNumber && (
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {n.flightNumber}
                                </span>
                              )}
                              <span>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => setBellOpen(false)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-1.5 pl-3">
                <Link to="/profile" className="text-right hover:opacity-90 transition-opacity" title="View Profile">
                  <div className="text-xs font-bold text-white leading-tight">{user.fullName}</div>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                    isAdmin ? 'bg-purple-900/80 text-purple-200' : 'bg-sky-900/80 text-sky-200'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Passenger'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="w-9 h-9 rounded-xl bg-slate-700/80 hover:bg-red-900/60 hover:text-red-300 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Search Flights
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              My Bookings
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              My Profile &amp; Settings
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-300 hover:bg-purple-950"
            >
              Admin Portal
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3">
                  <div className="text-sm font-bold text-white">{user.fullName}</div>
                  <div className="text-xs text-sky-400">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center rounded-xl text-sm font-semibold bg-slate-800 text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center rounded-xl text-sm font-semibold bg-sky-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
