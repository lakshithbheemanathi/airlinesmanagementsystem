import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedFlight, setSelectedFlight] = useState(() => {
    try {
      const saved = sessionStorage.getItem('skywings_selected_flight');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cabinClass, setCabinClass] = useState(() => {
    return sessionStorage.getItem('skywings_cabin_class') || 'ECONOMY';
  });

  const [passengersCount, setPassengersCount] = useState(() => {
    return Number(sessionStorage.getItem('skywings_passengers_count')) || 1;
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);

  const chooseFlight = (flight, chosenClass = 'ECONOMY', count = 1) => {
    setSelectedFlight(flight);
    setCabinClass(chosenClass);
    setPassengersCount(count);
    setSelectedSeats([]);
    setPassengerDetails([]);

    sessionStorage.setItem('skywings_selected_flight', JSON.stringify(flight));
    sessionStorage.setItem('skywings_cabin_class', chosenClass);
    sessionStorage.setItem('skywings_passengers_count', count.toString());
  };

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        if (prev.length < passengersCount) {
          return [...prev, seatNumber];
        } else {
          // Replace oldest if exceeded
          return [...prev.slice(1), seatNumber];
        }
      }
    });
  };

  const clearBooking = () => {
    setSelectedFlight(null);
    setSelectedSeats([]);
    setPassengerDetails([]);
    sessionStorage.removeItem('skywings_selected_flight');
    sessionStorage.removeItem('skywings_cabin_class');
    sessionStorage.removeItem('skywings_passengers_count');
  };

  const unitFare = selectedFlight
    ? cabinClass === 'BUSINESS'
      ? selectedFlight.businessFare
      : selectedFlight.economyFare
    : 0;

  const totalFare = unitFare * passengersCount;

  return (
    <BookingContext.Provider
      value={{
        selectedFlight,
        cabinClass,
        passengersCount,
        selectedSeats,
        passengerDetails,
        totalFare,
        unitFare,
        chooseFlight,
        toggleSeat,
        setSelectedSeats,
        setPassengerDetails,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
