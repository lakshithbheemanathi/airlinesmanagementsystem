import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/public/HomePage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import SeatSelectionPage from './pages/user/SeatSelectionPage';
import PassengerDetailsPage from './pages/user/PassengerDetailsPage';
import PaymentPage from './pages/user/PaymentPage';
import ETicketPage from './pages/user/ETicketPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import ProfilePage from './pages/user/ProfilePage';
import AdminFlightsPage from './pages/admin/AdminFlightsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSchedulesPage from './pages/admin/AdminSchedulesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPassengersPage from './pages/admin/AdminPassengersPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/seat-selection" element={<SeatSelectionPage />} />
                <Route path="/passenger-details" element={<PassengerDetailsPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/e-ticket/:pnr" element={<ETicketPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/flights" element={<AdminFlightsPage />} />
                <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
                <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                <Route path="/admin/passengers" element={<AdminPassengersPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              </Routes>
            </main>
            <footer className="bg-slate-900 border-t border-slate-800 py-10 text-slate-400 text-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">SkyWings</span>
                  <span>&mdash; Modern Airline Reservation & Operations System &copy; 2026</span>
                </div>
                <div className="flex items-center space-x-6 text-slate-400">
                  <span>Java 21 LTS</span>
                  <span>Spring Boot 3</span>
                  <span>MySQL & JPA</span>
                  <span>React & Tailwind CSS</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
