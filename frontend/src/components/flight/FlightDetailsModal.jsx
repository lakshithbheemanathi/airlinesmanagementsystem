import React from 'react';
import { Plane, X, Clock, Luggage, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const FlightDetailsModal = ({ flight, isOpen, onClose, onSelect, cabinClass = 'ECONOMY' }) => {
  if (!isOpen || !flight) return null;

  const fare = cabinClass === 'BUSINESS' ? flight.businessFare : flight.economyFare;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {flight.airlineName} — {flight.flightNumber}
              </h3>
              <p className="text-xs text-slate-500">Commercial Itinerary & Aircraft Specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flight Journey Details */}
        <div className="mt-6 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900">{flight.sourceAirport}</span>
                <span className="text-xs text-slate-500 block font-medium">{flight.sourceCity}</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">
                  {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(flight.departureTime).toLocaleDateString()}
                </span>
              </div>

              <div className="flex-1 px-4 flex flex-col items-center">
                <span className="text-[11px] font-bold text-sky-700 mb-1">
                  {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                </span>
                <div className="w-full flex items-center justify-center relative">
                  <div className="h-[2px] bg-slate-300 w-full"></div>
                  <Plane className="w-4 h-4 text-sky-600 absolute bg-slate-50 px-0.5" />
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1">Non-stop Flight</span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{flight.destinationAirport}</span>
                <span className="text-xs text-slate-500 block font-medium">{flight.destinationCity}</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">
                  {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(flight.arrivalTime).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Departure Gate: <strong className="text-slate-800">{flight.gate || 'T2-G10'}</strong></span>
              <span>Available Seats: <strong className="text-emerald-700 font-bold">{flight.availableSeats} of {flight.totalSeats}</strong></span>
            </div>
          </div>

          {/* Aircraft Specifications */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Aircraft Equipment</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{flight.aircraftModel}</span>
              <span className="text-[10px] text-slate-500 font-mono">Reg: {flight.aircraftRegistration}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block font-medium">Baggage Allowance</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{flight.baggageAllowance}</span>
              <span className="text-[10px] text-emerald-600 font-medium">Complimentary included</span>
            </div>
          </div>

          {/* Fare Summary & Booking Action */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-sky-900 block">
                Total Fare per Passenger &bull; {flight.flightType === 'INTERNATIONAL' ? '🌐 International' : '🇮🇳 Domestic'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-sky-900">₹{Math.round(fare).toLocaleString('en-IN')}</span>
                <span className="text-xs text-sky-700 uppercase font-semibold">({cabinClass})</span>
              </div>
            </div>

            <button
              onClick={() => onSelect(flight)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              Select Seats <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsModal;
