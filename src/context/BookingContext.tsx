import React, { createContext, useState, useContext } from 'react';

export type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
};

export type Passenger = {
  firstName: string;
  lastName: string;
  passport: string;
};

type BookingContextData = {
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
  passengerDetails: Passenger | null;
  setPassengerDetails: (passenger: Passenger | null) => void;
  resetBooking: () => void;
};

const BookingContext = createContext<BookingContextData>({} as BookingContextData);

export const BookingProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<Passenger | null>(null);

  const resetBooking = () => {
    setSelectedFlight(null);
    setSelectedSeats([]);
    setPassengerDetails(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedFlight, setSelectedFlight,
      selectedSeats, setSelectedSeats,
      passengerDetails, setPassengerDetails,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
