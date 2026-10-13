import React, { useState } from 'react';
import { Plane, Clock, Info, Check, ArrowRight } from 'lucide-react';
import FlightDetailsModal from './FlightDetailsModal';

const FlightCard = ({ flight, cabinClass = 'ECONOMY', onSelect }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fare = cabinClass === 'BUSINESS' ? flight.businessFare : flight.economyFare;
  const isLowSeats = flight.availableSeats <= 10;

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-sky-300 hover:shadow-lg transition-all duration-200 group">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-sky-500/20">
              SW
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm">{flight.flightNumber}</span>
              <span className="text-xs text-slate-400 block font-medium">{flight.airlineName} &bull; {flight.aircraftModel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              flight.flightType === 'INTERNATIONAL'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {flight.flightType === 'INTERNATIONAL' ? '🌐 International' : '🇮🇳 Domestic'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {flight.baggageAllowance || '7 kg Cabin, 15 kg Check-in'}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              cabinClass === 'BUSINESS' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
            }`}>
              {cabinClass}
            </span>
          </div>
        </div>

        {/* Flight Journey Timing Grid */}
        <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Origin */}
          <div className="sm:col-span-4">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm font-extrabold text-slate-800 mt-1">{flight.sourceAirport}</div>
            <div className="text-xs text-slate-400 font-medium">{flight.sourceCity}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {new Date(flight.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
          </div>

          {/* Route Arrow & Duration */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center px-2">
            <span className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
            </span>
            <div className="w-full flex items-center justify-center relative">
              <div className="h-[2px] bg-slate-200 w-full"></div>
              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center absolute shadow-xs">
                <Plane className="w-3.5 h-3.5 text-sky-600 transform rotate-90" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5">
              Direct &bull; Non-stop
            </span>
          </div>

          {/* Destination */}
          <div className="sm:col-span-4 text-left sm:text-right">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm font-extrabold text-slate-800 mt-1">{flight.destinationAirport}</div>
            <div className="text-xs text-slate-400 font-medium">{flight.destinationCity}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {new Date(flight.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
          </div>
        </div>

        {/* Bottom Actions & Price */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
              isLowSeats ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {flight.availableSeats} seats left
            </span>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <Info className="w-3.5 h-3.5" /> Flight details
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Fare from</span>
              <span className="text-2xl font-black text-slate-900">₹{Math.round(fare).toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              onClick={() => onSelect(flight)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-sky-600 active:scale-95 transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5"
            >
              Select Flight <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <FlightDetailsModal
        flight={flight}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onSelect={onSelect}
        cabinClass={cabinClass}
      />
    </>
  );
};

export default FlightCard;
