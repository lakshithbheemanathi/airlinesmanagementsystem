import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Lock, Smartphone, Building, Sparkles } from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentPage = () => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, UPI, NET_BANKING

  // Card Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI / Net Banking Fields
  const [upiId, setUpiId] = useState('alex.morgan@oksbi');
  const [selectedBank, setSelectedBank] = useState('CHASE');

  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('skywings_current_booking');
    if (saved) {
      try {
        setBooking(JSON.parse(saved));
      } catch {
        setBooking(null);
      }
    }
  }, []);

  const handleDemoCardFill = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder('Alex Morgan');
    setExpiry('12/28');
    setCvv('888');
    setError('');
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setExpiry(val);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setError('');
    setProcessing(true);
    setProcessStep('Connecting to simulated payment network...');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setProcessStep('Verifying 3D Secure credentials...');
      await new Promise((r) => setTimeout(r, 700));

      const payload = {
        bookingId: booking.id,
        pnrNumber: booking.pnrNumber,
        paymentMethod,
        amount: booking.totalAmount,
        cardLastFour: cardNumber.slice(-4) || '4242',
      };

      const res = await paymentService.simulatePayment(payload);

      if (res.success && res.data) {
        setProcessStep('Payment approved! Generating official boarding pass...');
        await new Promise((r) => setTimeout(r, 600));

        // Update stored booking with payment status and txn ID
        const updatedBooking = {
          ...booking,
          paymentStatus: 'SUCCESS',
          transactionId: res.data.transactionId,
        };
        sessionStorage.setItem('skywings_confirmed_booking', JSON.stringify(updatedBooking));

        // Redirect to E-ticket page
        navigate(`/e-ticket/${booking.pnrNumber}`);
      } else {
        setError(res.message || 'Payment simulation failed.');
        setProcessing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment gateway simulation error.');
      setProcessing(false);
    }
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Plane className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Pending Payment Found</h2>
        <p className="text-xs text-slate-500">
          You don't have an active booking waiting for checkout.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Flight Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/passenger-details"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Passenger Details
        </Link>
        <div className="text-xs text-slate-400 font-medium">
          Step 3 of 3: Select Seats &rarr; Passenger Details &rarr; <strong className="text-slate-800">Payment Checkout</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Simulated Payment Module */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" /> Secure Payment Checkout
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                PNR Reservation: <strong className="text-slate-800 font-mono">{booking.pnrNumber}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </div>
          </div>

          {/* Academic Simulation Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Safe Academic Payment Simulation</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed pl-6">
              This application runs a realistic payment simulation designed for portfolio and project evaluation. No real bank accounts or credit cards will be billed.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm ring-1 ring-sky-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'NET_BANKING'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm ring-1 ring-purple-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4 text-purple-600" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* CARD TAB */}
          {paymentMethod === 'CARD' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Demo card quick-fill button */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Want to test quickly?
                </span>
                <button
                  type="button"
                  onClick={handleDemoCardFill}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 transition-colors shadow-xs"
                >
                  Autofill Demo Test Card
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 tracking-wider focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 tracking-widest focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-sky-600 to-blue-700 text-white hover:from-sky-500 hover:to-blue-600 active:scale-[0.99] transition-all shadow-lg shadow-sky-600/25 flex flex-col items-center justify-center disabled:opacity-50"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{processStep}</span>
                    </div>
                  ) : (
                    <span>Pay Securely ₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* UPI TAB */}
          {paymentMethod === 'UPI' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs">
                Enter your Virtual Payment Address (UPI ID) or scan the simulated QR code to approve.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  required
                  placeholder="alex.morgan@oksbi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <span>Verify & Pay ₹{Math.round(booking.totalAmount).toLocaleString('en-IN')} via UPI</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* NET BANKING TAB */}
          {paymentMethod === 'NET_BANKING' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra'].map((bank) => (
                    <label
                      key={bank}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-2 ${
                        selectedBank === bank ? 'bg-purple-50 border-purple-400 text-purple-900' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bank"
                        checked={selectedBank === bank}
                        onChange={() => setSelectedBank(bank)}
                        className="accent-purple-600"
                      />
                      <span>{bank}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-purple-700 hover:bg-purple-800 text-white active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{processStep}</span>
                    </>
                  ) : (
                    <span>Authenticate via {selectedBank} & Pay ₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 font-mono">
                {booking.pnrNumber}
              </span>
            </h2>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700">{booking.flight.flightNumber}</span>
                <span className="text-[11px] font-semibold text-slate-500">{booking.flight.aircraftModel}</span>
              </div>

              <div className="flex items-center justify-between font-black text-slate-900 text-lg">
                <div>
                  <span>{booking.flight.sourceAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{booking.flight.sourceCity}</span>
                </div>
                <span className="text-sky-500 text-sm font-bold">&rarr;</span>
                <div className="text-right">
                  <span>{booking.flight.destinationAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{booking.flight.destinationCity}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
                <span>Date:</span>
                <strong className="text-slate-800">
                  {new Date(booking.flight.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Assigned Tickets
            </label>
            <div className="space-y-2">
              {booking.passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">{p.fullName}</span>
                    <span className="text-[10px] text-slate-400">{p.seatClass} Class</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-extrabold text-xs">
                    Seat {p.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Due:</span>
            <span className="text-2xl font-black text-sky-700">₹{Math.round(booking.totalAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
