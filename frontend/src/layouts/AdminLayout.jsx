import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, LayoutDashboard, Calendar, Users, Ticket, Bell, Shield, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Flights Roster', path: '/admin/flights', icon: Plane },
    { label: 'Schedules', path: '/admin/schedules', icon: Calendar },
    { label: 'Bookings & PNR', path: '/admin/bookings', icon: Ticket },
    { label: 'Passengers', path: '/admin/passengers', icon: Users },
    { label: 'Flight Alerts', path: '/admin/notifications', icon: Bell },
  ];

  // If not logged in as Admin, show clean authorization screen
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Airline Management Control Center is restricted to administrative staff. Please sign in with an Administrator account.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Go to Login (Use Quick Admin Demo)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path) =>
    location.pathname === path || (path === '/admin/dashboard' && location.pathname === '/admin');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800 p-4 space-y-6">
        <div className="px-3 pt-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800/60 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Operations Control
          </div>
          <h2 className="text-base font-bold text-white mt-2">Flight Operations</h2>
          <p className="text-[11px] text-slate-400">SkyWings Admin Console</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800 px-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Passenger View
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
