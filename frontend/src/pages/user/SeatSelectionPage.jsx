import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, Check, Lock, ArrowRight, ArrowLeft, Shield, AlertCircle, Info } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import flightService from '../../services/flightService';

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, cabinClass, passengersCount, selectedSeats, toggleSeat, setSelectedSeats } = useBooking();

  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFlight) return;

    const loadSeats = async () => {
      setLoading(true);
      try {
        const res = await flightService.getFlightSeats(selectedFlight.id);
        if (res.success && res.data.seats) {
          setSeatMap(res.data.seats);
        }
      } catch (err) {
        setError('Failed to load aircraft seat layout.');
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [selectedFlight]);

  // If no flight selected, prompt user to search
  if (!selectedFlight) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Plane className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Flight Selected</h2>
        <p className="text-xs text-slate-500">
          Please choose a flight from the search results before selecting your aircraft seats.
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

  // Filter seats into Business and Economy groups
  const businessSeats = seatMap.filter((s) => s.seatClass === 'BUSINESS');
  const economySeats = seatMap.filter((s) => s.seatClass === 'ECONOMY');

  // Group seats by row
  const groupSeatsByRow = (seatsList) => {
    const rows = {};
    seatsList.forEach((seat) => {
      if (!rows[seat.rowNumber]) rows[seat.rowNumber] = [];
      rows[seat.rowNumber].push(seat);
    });
    return Object.entries(rows).map(([rowNum, seats]) => ({
      rowNumber: Number(rowNum),
      seats: seats.sort((a, b) => a.columnLetter.localeCompare(b.columnLetter)),
    }));
  };

  const businessRows = groupSeatsByRow(businessSeats);
  const economyRows = groupSeatsByRow(economySeats);

  const unitFare = cabinClass === 'BUSINESS' ? selectedFlight.businessFare : selectedFlight.economyFare;
  const subtotal = unitFare * passengersCount;
  const taxes = subtotal * 0.10;
  const total = subtotal + taxes;

  const isSelectionComplete = selectedSeats.length === passengersCount;

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    // Optional class guidance
    if (seat.seatClass !== cabinClass) {
      if (!window.confirm(`This seat is in ${seat.seatClass} class (₹${Math.round(seat.price).toLocaleString('en-IN')}). You originally selected ${cabinClass} class. Would you like to select this seat?`)) {
        return;
      }
    }

    toggleSeat(seat.seatNumber);
  };

  const handleContinue = () => {
    if (!isSelectionComplete) return;
    navigate('/passenger-details');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </Link>
        <div className="text-xs text-slate-400 font-medium">
          Step 1 of 3: <strong className="text-slate-800">Select Seats</strong> &rarr; Passenger Details &rarr; Payment
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Aircraft Fuselage Visualization */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-600" /> Interactive Seat Selection
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedFlight.aircraftModel} &bull; Flight {selectedFlight.flightNumber}
              </p>
            </div>

            {/* Selection quota badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              isSelectionComplete ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
            }`}>
              Selected {selectedSeats.length} of {passengersCount} {passengersCount === 1 ? 'Seat' : 'Seats'}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg border-2 border-slate-300 bg-white"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sky-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center">
                <Lock className="w-3 h-3" />
              </div>
              <span>Occupied</span>
            </div>
          </div>

          {/* Aircraft Fuselage Container */}
          {loading ? (
            <div className="max-w-md mx-auto bg-slate-50/70 p-6 sm:p-8 rounded-[40px] border-2 border-slate-200/80 animate-pulse space-y-4">
              <div className="w-20 h-10 bg-slate-200 rounded-t-full mx-auto mb-3"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-44 mx-auto mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                    </div>
                    <div className="w-6 h-4 bg-slate-200 rounded-md"></div>
                    <div className="flex gap-1.5">
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                      <div className="w-9 h-10 bg-slate-200 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-slate-50/70 p-6 sm:p-8 rounded-[40px] border-2 border-slate-200/80 shadow-inner relative">
              {/* Airplane Nose Curve */}
              <div className="w-24 h-12 border-t-4 border-l-4 border-r-4 border-slate-300 rounded-t-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-2 bg-slate-300 rounded-full"></div>
              </div>

              {/* Cockpit / Galley Area */}
              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">
                Cockpit &bull; Front of Aircraft
              </div>

              {/* SECTION: Business Class (Rows 1-2, 2x2 layout) */}
              <div className="space-y-3 mb-8">
                <div className="text-center text-[11px] font-extrabold text-purple-700 uppercase tracking-wider bg-purple-50 py-1 rounded-lg border border-purple-100">
                  Business Class (Rows 1 - 2) &bull; ${selectedFlight.businessFare}
                </div>

                <div className="space-y-3 pt-2">
                  {businessRows.map((row) => (
                    <div key={row.rowNumber} className="flex items-center justify-between">
                      {/* Left: Seats A, B */}
                      <div className="flex items-center gap-2">
                        {row.seats.slice(0, 2).map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                                seat.isBooked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105 ring-2 ring-sky-300'
                                  : 'bg-white border-2 border-purple-200 text-purple-900 hover:border-purple-400 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>

                      {/* Aisle Row Number */}
                      <span className="w-8 text-center text-xs font-bold text-slate-400 font-mono">
                        {row.rowNumber}
                      </span>

                      {/* Right: Seats C, D */}
                      <div className="flex items-center gap-2">
                        {row.seats.slice(2, 4).map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                                seat.isBooked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105 ring-2 ring-sky-300'
                                  : 'bg-white border-2 border-purple-200 text-purple-900 hover:border-purple-400 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Economy Class (Rows 3-10, 3x3 layout) */}
              <div className="space-y-3">
                <div className="text-center text-[11px] font-extrabold text-sky-800 uppercase tracking-wider bg-sky-50 py-1 rounded-lg border border-sky-100">
                  Economy Class (Rows 3 - 10) &bull; ${selectedFlight.economyFare}
                </div>

                <div className="space-y-2.5 pt-2">
                  {economyRows.map((row) => (
                    <div key={row.rowNumber} className="flex items-center justify-between">
                      {/* Left: Seats A, B, C */}
                      <div className="flex items-center gap-1.5">
                        {row.seats.slice(0, 3).map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-9 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                                seat.isBooked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105 ring-2 ring-sky-300'
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-sky-400 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>

                      {/* Aisle Row Number */}
                      <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                        {row.rowNumber}
                      </span>

                      {/* Right: Seats D, E, F */}
                      <div className="flex items-center gap-1.5">
                        {row.seats.slice(3, 6).map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-9 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                                seat.isBooked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105 ring-2 ring-sky-300'
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-sky-400 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rear Galley & Restrooms */}
              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 border-t border-slate-200 pt-3">
                Rear Galley &bull; Restrooms &bull; Exit
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Reservation Summary
            </h2>

            {/* Flight Overview Card */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700">{selectedFlight.flightNumber}</span>
                <span className="text-[11px] font-semibold text-slate-500">{selectedFlight.airlineName}</span>
              </div>

              <div className="flex items-center justify-between font-black text-slate-900 text-lg">
                <div>
                  <span>{selectedFlight.sourceAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{selectedFlight.sourceCity}</span>
                </div>
                <span className="text-sky-500 text-sm font-bold">&rarr;</span>
                <div className="text-right">
                  <span>{selectedFlight.destinationAirport}</span>
                  <span className="text-xs font-medium text-slate-400 block">{selectedFlight.destinationCity}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
                <span>Travel Date:</span>
                <strong className="text-slate-800">
                  {new Date(selectedFlight.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </div>
            </div>
          </div>

          {/* Selected Seats Badges */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Selected Seats ({selectedSeats.length}/{passengersCount})
            </label>
            {selectedSeats.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Click on aircraft seats on the left to assign your seats.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Seat {seat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Base Fare ({passengersCount}x ₹{Math.round(unitFare).toLocaleString('en-IN')})</span>
              <span className="font-semibold text-slate-900">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Airport Taxes &amp; GST (10%)</span>
              <span className="font-semibold text-slate-900">₹{Math.round(taxes).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 text-base font-black pt-3 border-t border-slate-100">
              <span>Total Price:</span>
              <span className="text-xl text-sky-700">₹{Math.round(total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Next Step Action */}
          <button
            type="button"
            disabled={!isSelectionComplete}
            onClick={handleContinue}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-slate-900 text-white hover:bg-sky-600 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-slate-900"
          >
            {isSelectionComplete ? (
              <>
                Continue to Passenger Details <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              `Select ${passengersCount - selectedSeats.length} more seat(s)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
