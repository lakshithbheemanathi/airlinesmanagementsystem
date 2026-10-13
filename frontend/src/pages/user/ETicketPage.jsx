import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plane, Printer, ArrowLeft, CheckCircle2, Calendar, Clock, MapPin, Luggage, Shield, QrCode, CreditCard, Share2, XCircle, AlertCircle } from 'lucide-react';
import bookingService from '../../services/bookingService';

const ETicketPage = () => {
  const { pnr } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation State (Stage 10)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Change of travel plans');
  const [cancelling, setCancelling] = useState(false);
  const [cancelNotice, setCancelNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getBookingByPnr(pnr);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError(res.message || 'Unable to retrieve ticket for this PNR.');
        }
      } catch (err) {
        // Fallback to session storage if just booked
        const saved = sessionStorage.getItem('skywings_confirmed_booking');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.pnrNumber.toUpperCase() === pnr.toUpperCase()) {
              setBooking(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
        setError('Reservation not found for PNR: ' + pnr);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReservation = async () => {
    setCancelling(true);
    try {
      const res = await bookingService.cancelBookingByPnr(pnr, cancellationReason);
      if (res.success && res.data) {
        setBooking(res.data);
        setShowCancelModal(false);
        setCancelNotice({
          type: 'success',
          text: `Booking ${pnr} cancelled successfully. 90% refund (₹${Math.round(res.data.refundAmount || booking.totalAmount * 0.9).toLocaleString('en-IN')}) processed to your payment method. Seats released to airline inventory.`,
        });
      }
    } catch (err) {
      setCancelNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel reservation.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Generating official digital boarding pass...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Plane className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Invalid PNR code provided.'}</p>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go to My Bookings
        </Link>
      </div>
    );
  }

  const flight = booking.flight;
  const departureDate = new Date(flight.departureTime);
  const boardingTime = new Date(departureDate.getTime() - 45 * 60000); // 45 mins before departure

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Action Bar (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go to My Bookings
        </Link>

        <div className="flex items-center gap-3">
          {booking.bookingStatus === 'CONFIRMED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors shadow-xs"
            >
              <XCircle className="w-4 h-4" /> Cancel Booking
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" /> Print / Save E-Ticket (PDF)
          </button>
        </div>
      </div>

      {cancelNotice.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between print:hidden ${
            cancelNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{cancelNotice.text}</span>
          <button onClick={() => setCancelNotice({ type: '', text: '' })} className="font-bold ml-3">
            &times;
          </button>
        </div>
      )}

      {/* Confirmation Success Banner OR Cancellation Alert Banner */}
      {booking.bookingStatus === 'CONFIRMED' ? (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold block">Booking Confirmed &amp; Boarding Pass Issued</span>
              <span>Your reservation is guaranteed. Have your PNR and passport ready at the gate.</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 font-black text-xs border border-emerald-200 font-mono shadow-2xs">
            PNR: {booking.pnrNumber}
          </span>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold block text-sm">Reservation Cancelled &bull; Void Boarding Pass</span>
              <span>
                Cancelled on {booking.cancellationDate ? new Date(booking.cancellationDate).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'} &bull; Reason: {booking.cancellationReason || 'Passenger requested cancellation'}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-white text-red-800 font-black text-xs border border-red-200 font-mono shadow-2xs">
            Refund: ${(booking.refundAmount || booking.totalAmount * 0.9).toFixed(2)} (90%)
          </span>
        </div>
      )}

      {/* Printable Digital Boarding Pass Ticket Card */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200/90 shadow-xl overflow-hidden print:shadow-none print:border-slate-800">
        {/* Ticket Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Plane className="w-6 h-6 text-white transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">SkyWings Airlines</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
                Official Electronic Passenger Ticket &bull; Boarding Pass
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">PNR Record Locator</span>
            <span className="text-2xl font-black text-white tracking-widest font-mono bg-slate-800 px-3 py-1 rounded-xl inline-block border border-slate-700">
              {booking.pnrNumber}
            </span>
          </div>
        </div>

        {/* Flight Journey Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-200">
            {/* Origin */}
            <div className="md:col-span-4">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Origin Airport</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block mt-0.5">{flight.sourceAirport}</span>
              <span className="text-sm font-bold text-slate-700">{flight.sourceCity}</span>
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-bold text-slate-800 block text-sm">
                  {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>{departureDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Flight Path Graphic */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-500 font-mono mb-1">{flight.flightNumber}</span>
              <div className="w-full flex items-center justify-center relative my-1">
                <div className="h-[2px] bg-slate-300 w-full"></div>
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center absolute shadow-sm">
                  <Plane className="w-4 h-4 transform rotate-90" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1">
                {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m &bull; Non-stop
              </span>
            </div>

            {/* Destination */}
            <div className="md:col-span-4 text-left md:text-right">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Destination Airport</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block mt-0.5">{flight.destinationAirport}</span>
              <span className="text-sm font-bold text-slate-700">{flight.destinationCity}</span>
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-bold text-slate-800 block text-sm">
                  {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>{new Date(flight.arrivalTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Boarding Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Flight Category</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">
                {flight.flightType === 'INTERNATIONAL' ? '🌐 International' : '🇮🇳 Domestic'}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{flight.baggageAllowance}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Departure Gate</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block font-mono">
                {flight.gate || 'T2-G14'}
              </span>
              <span className="text-[10px] text-slate-500">Terminal 2</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Aircraft Model</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">
                {flight.aircraftModel}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Reg: {flight.aircraftRegistration}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Booking Status</span>
              {booking.bookingStatus === 'CONFIRMED' ? (
                <>
                  <span className="font-black text-emerald-700 text-sm mt-0.5 block">
                    CONFIRMED
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">&bull; Ticket Issued</span>
                </>
              ) : (
                <>
                  <span className="font-black text-red-700 text-sm mt-0.5 block">
                    CANCELLED
                  </span>
                  <span className="text-[10px] text-red-600 font-semibold">&bull; Ticket Voided</span>
                </>
              )}
            </div>
          </div>

          {/* Passenger & Ticket Manifest */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Passenger Manifest &amp; Assigned Seats
            </h4>
            <div className="space-y-2">
              {booking.passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{p.fullName}</span>
                      <span className="text-[11px] text-slate-400">
                        {p.gender} &bull; Cabin Class: <strong className="text-slate-700">{p.seatClass}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-black text-sm shadow-xs font-mono">
                      Seat {p.seatNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {p.seatClass === 'BUSINESS' ? 'Group 1' : 'Group 2'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Audit Verification */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">
                Total Amount Paid: <strong className="text-slate-900 font-black text-sm">₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</strong>
              </span>
              {booking.transactionId && (
                <span className="text-[11px] text-slate-400 font-mono block">
                  Simulated Transaction ID: <strong>{booking.transactionId}</strong>
                </span>
              )}
            </div>

            {/* Mock Visual Barcode Graphic */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <QrCode className="w-8 h-8 text-slate-800" />
              <div className="font-mono text-[9px] text-slate-500 leading-tight">
                <div>ELECTRONIC TICKET</div>
                <div className="font-bold text-slate-800">{booking.pnrNumber}</div>
                <div>SECURE AIRLINE SYSTEM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Boarding Pass Bottom Stripe */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Please present this digital pass or printed document along with government-issued photo identification at security checkpoints and boarding gates.
        </div>
      </div>

      {/* Cancellation Modal (Stage 10) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Cancel Flight Reservation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                PNR <strong className="font-mono text-slate-800">{booking.pnrNumber}</strong> &bull; Flight {flight.flightNumber}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total Fare Paid:</span>
                <span className="font-bold">₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>Standard Refund (90%):</span>
                <span>₹{Math.round(booking.totalAmount * 0.9).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                Assigned seats will be released back into public airline inventory immediately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Emergency medical circumstances">Emergency medical circumstances</option>
                <option value="Scheduling conflict">Scheduling conflict</option>
                <option value="Booked by mistake">Booked by mistake</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelReservation}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETicketPage;
