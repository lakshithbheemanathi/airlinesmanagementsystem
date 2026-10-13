package com.skywings.airline.service.impl;

import com.skywings.airline.dto.request.FlightRequest;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.entity.Aircraft;
import com.skywings.airline.entity.Flight;
import com.skywings.airline.entity.Seat;
import com.skywings.airline.repository.AircraftRepository;
import com.skywings.airline.repository.FlightRepository;
import com.skywings.airline.repository.BookingPassengerRepository;
import com.skywings.airline.repository.BookingRepository;
import com.skywings.airline.repository.NotificationRepository;
import com.skywings.airline.repository.PaymentRepository;
import com.skywings.airline.repository.SeatRepository;
import com.skywings.airline.entity.Booking;
import com.skywings.airline.entity.Notification;
import com.skywings.airline.service.FlightService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingPassengerRepository bookingPassengerRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public FlightServiceImpl(FlightRepository flightRepository,
                             AircraftRepository aircraftRepository,
                             SeatRepository seatRepository,
                             BookingRepository bookingRepository,
                             BookingPassengerRepository bookingPassengerRepository,
                             PaymentRepository paymentRepository,
                             NotificationRepository notificationRepository) {
        this.flightRepository = flightRepository;
        this.aircraftRepository = aircraftRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingPassengerRepository = bookingPassengerRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlightResponse> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::mapToFlightResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + id));
        return mapToFlightResponse(flight);
    }

    @Override
    @Transactional
    public FlightResponse createFlight(FlightRequest request) {
        Aircraft aircraft = aircraftRepository.findById(request.getAircraftId())
                .orElseThrow(() -> new RuntimeException("Aircraft not found with ID: " + request.getAircraftId()));

        int duration = request.getDurationMinutes() != null && request.getDurationMinutes() > 0
                ? request.getDurationMinutes()
                : (int) Math.max(1, Duration.between(request.getDepartureTime(), request.getArrivalTime()).toMinutes());

        Flight flight = new Flight(
                request.getFlightNumber().trim().toUpperCase(),
                request.getAirlineName() != null ? request.getAirlineName() : "SkyWings Airlines",
                aircraft,
                request.getSourceAirport().trim().toUpperCase(),
                request.getDestinationAirport().trim().toUpperCase(),
                request.getSourceCity().trim(),
                request.getDestinationCity().trim(),
                request.getDepartureTime(),
                request.getArrivalTime(),
                duration,
                request.getEconomyFare(),
                request.getBusinessFare(),
                request.getStatus() != null ? request.getStatus() : "SCHEDULED",
                request.getGate() != null ? request.getGate() : "T1-G01",
                request.getBaggageAllowance() != null ? request.getBaggageAllowance() : "7 kg Cabin, 20 kg Check-in",
                request.getFlightType() != null ? request.getFlightType() : "DOMESTIC"
        );

        Flight savedFlight = flightRepository.save(flight);

        // Automatically generate aircraft seat layout
        generateSeatsForFlight(savedFlight);

        return mapToFlightResponse(savedFlight);
    }

    @Override
    @Transactional
    public FlightResponse updateFlight(Long id, FlightRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + id));

        String oldStatus = flight.getStatus();
        LocalDateTime oldDepTime = flight.getDepartureTime();
        String oldGate = flight.getGate();

        if (request.getAircraftId() != null && !flight.getAircraft().getId().equals(request.getAircraftId())) {
            Aircraft aircraft = aircraftRepository.findById(request.getAircraftId())
                    .orElseThrow(() -> new RuntimeException("Aircraft not found with ID: " + request.getAircraftId()));
            flight.setAircraft(aircraft);
        }

        flight.setFlightNumber(request.getFlightNumber().trim().toUpperCase());
        if (request.getAirlineName() != null) flight.setAirlineName(request.getAirlineName());
        flight.setSourceAirport(request.getSourceAirport().trim().toUpperCase());
        flight.setDestinationAirport(request.getDestinationAirport().trim().toUpperCase());
        flight.setSourceCity(request.getSourceCity().trim());
        flight.setDestinationCity(request.getDestinationCity().trim());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());

        int duration = request.getDurationMinutes() != null && request.getDurationMinutes() > 0
                ? request.getDurationMinutes()
                : (int) Math.max(1, Duration.between(request.getDepartureTime(), request.getArrivalTime()).toMinutes());
        flight.setDurationMinutes(duration);

        flight.setEconomyFare(request.getEconomyFare());
        flight.setBusinessFare(request.getBusinessFare());
        if (request.getStatus() != null) flight.setStatus(request.getStatus());
        if (request.getGate() != null) flight.setGate(request.getGate());
        if (request.getBaggageAllowance() != null) flight.setBaggageAllowance(request.getBaggageAllowance());
        if (request.getFlightType() != null) flight.setFlightType(request.getFlightType());

        // If status became CANCELLED, release seats back to inventory
        if ("CANCELLED".equalsIgnoreCase(flight.getStatus()) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
            List<Seat> seats = seatRepository.findByFlightIdOrderByRowNumberAscColumnLetterAsc(id);
            for (Seat s : seats) {
                s.setIsBooked(false);
                seatRepository.save(s);
            }
        }

        Flight updatedFlight = flightRepository.save(flight);

        // Notify affected passengers if schedule, status, delay, cancellation, or gate changed
        boolean statusChanged = request.getStatus() != null && !request.getStatus().equalsIgnoreCase(oldStatus);
        boolean timeChanged = request.getDepartureTime() != null && !request.getDepartureTime().isEqual(oldDepTime);
        boolean gateChanged = request.getGate() != null && !request.getGate().equalsIgnoreCase(oldGate);

        if (statusChanged || timeChanged || gateChanged) {
            notifyAffectedPassengers(updatedFlight, oldStatus, statusChanged, timeChanged, gateChanged);
        }

        return mapToFlightResponse(updatedFlight);
    }

    @Override
    @Transactional
    public void deleteFlight(Long id) {
        deleteFlight(id, false);
    }

    @Override
    @Transactional
    public String deleteFlight(Long id, boolean purge) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + id));

        List<Booking> bookings = bookingRepository.findByFlightId(id);

        if (bookings.isEmpty() || purge) {
            // If purge is requested and bookings exist, clean up passengers, payments, and bookings
            if (!bookings.isEmpty()) {
                for (Booking b : bookings) {
                    paymentRepository.findByBookingId(b.getId()).ifPresent(paymentRepository::delete);
                    bookingPassengerRepository.deleteAll(bookingPassengerRepository.findByBookingId(b.getId()));
                    bookingRepository.delete(b);
                }
            }

            // Remove notifications referencing this flight
            List<Notification> notifs = notificationRepository.findAll().stream()
                    .filter(n -> n.getFlight() != null && n.getFlight().getId().equals(id))
                    .collect(Collectors.toList());
            if (!notifs.isEmpty()) {
                notificationRepository.deleteAll(notifs);
            }

            // Delete generated seat layout
            List<Seat> seats = seatRepository.findByFlightIdOrderByRowNumberAscColumnLetterAsc(id);
            seatRepository.deleteAll(seats);

            // Permanently remove the flight entity
            flightRepository.delete(flight);
            return "Flight " + flight.getFlightNumber() + " and its seating layout have been permanently deleted from the database.";
        } else {
            // Soft delete: flight has passenger bookings, mark as CANCELLED to preserve reservation history
            flight.setStatus("CANCELLED");
            Flight saved = flightRepository.save(flight);

            // Notify affected passengers of cancellation
            notifyAffectedPassengers(saved, "SCHEDULED", true, false, false);
            return "Flight " + flight.getFlightNumber() + " has " + bookings.size() + " existing booking(s). It has been safely marked as CANCELLED and all affected passengers have been notified.";
        }
    }

    private void notifyAffectedPassengers(Flight flight, String oldStatus, boolean statusChanged, boolean timeChanged, boolean gateChanged) {
        String alertType = "SCHEDULE_CHANGED";
        String alertTitle = "Flight Schedule Updated: " + flight.getFlightNumber();

        if ("DELAYED".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_DELAYED";
            alertTitle = "Flight Delay Notice: " + flight.getFlightNumber();
        } else if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_CANCELLED";
            alertTitle = "Flight Cancellation Notice: " + flight.getFlightNumber();
        } else if ("BOARDING".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_BOARDING";
            alertTitle = "Now Boarding: Flight " + flight.getFlightNumber();
        } else if (gateChanged) {
            alertType = "GATE_CHANGED";
            alertTitle = "Departure Gate Changed: " + flight.getFlightNumber();
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("hh:mm a, MMM dd");
        StringBuilder sb = new StringBuilder();
        sb.append("Operational Update for Flight ").append(flight.getFlightNumber())
          .append(" (").append(flight.getSourceAirport()).append(" to ").append(flight.getDestinationAirport()).append("): ");

        if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
            sb.append("This flight has been CANCELLED by SkyWings airline operations. A 90% refund has been initiated to your original payment method.");
        } else if ("DELAYED".equalsIgnoreCase(flight.getStatus())) {
            sb.append("Flight is DELAYED. New Departure: ").append(flight.getDepartureTime() != null ? flight.getDepartureTime().format(fmt) : "TBD");
            if (flight.getGate() != null) sb.append(", Gate: ").append(flight.getGate());
        } else {
            sb.append("Flight status is now ").append(flight.getStatus());
            if (flight.getDepartureTime() != null) sb.append(". Departure: ").append(flight.getDepartureTime().format(fmt));
            if (flight.getGate() != null) sb.append(". Gate: ").append(flight.getGate());
        }

        String message = sb.toString();
        List<Booking> bookings = bookingRepository.findByFlightId(flight.getId());
        Set<Long> notifiedUserIds = new HashSet<>();

        for (Booking b : bookings) {
            if ("CONFIRMED".equalsIgnoreCase(b.getBookingStatus()) && b.getUser() != null) {
                Long uid = b.getUser().getId();
                if (!notifiedUserIds.contains(uid)) {
                    notifiedUserIds.add(uid);
                    notificationRepository.save(new Notification(
                            b.getUser(),
                            flight,
                            alertTitle,
                            message,
                            alertType
                    ));
                }
            }
        }

        // Also save broadcast notification for operational feed
        notificationRepository.save(new Notification(
                null,
                flight,
                alertTitle,
                message,
                alertType
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Aircraft> getAllAircraft() {
        return aircraftRepository.findAll();
    }

    private void generateSeatsForFlight(Flight flight) {
        List<Seat> seats = new ArrayList<>();

        // Rows 1-2: Business Class (4 seats per row: A, B, C, D)
        for (int r = 1; r <= 2; r++) {
            for (String col : List.of("A", "B", "C", "D")) {
                seats.add(new Seat(flight, r + col, "BUSINESS", false, r, col));
            }
        }

        // Rows 3-10: Economy Class (6 seats per row: A, B, C, D, E, F)
        for (int r = 3; r <= 10; r++) {
            for (String col : List.of("A", "B", "C", "D", "E", "F")) {
                seats.add(new Seat(flight, r + col, "ECONOMY", false, r, col));
            }
        }

        seatRepository.saveAll(seats);
    }

    private FlightResponse mapToFlightResponse(Flight flight) {
        FlightResponse resp = new FlightResponse();
        resp.setId(flight.getId());
        resp.setFlightNumber(flight.getFlightNumber());
        resp.setAirlineName(flight.getAirlineName());
        resp.setAircraftId(flight.getAircraft().getId());
        resp.setAircraftModel(flight.getAircraft().getModelName());
        resp.setAircraftRegistration(flight.getAircraft().getRegistrationNo());
        resp.setSourceAirport(flight.getSourceAirport());
        resp.setDestinationAirport(flight.getDestinationAirport());
        resp.setSourceCity(flight.getSourceCity());
        resp.setDestinationCity(flight.getDestinationCity());
        resp.setDepartureTime(flight.getDepartureTime());
        resp.setArrivalTime(flight.getArrivalTime());
        resp.setDurationMinutes(flight.getDurationMinutes());
        resp.setEconomyFare(flight.getEconomyFare());
        resp.setBusinessFare(flight.getBusinessFare());
        resp.setStatus(flight.getStatus());
        resp.setGate(flight.getGate());
        resp.setBaggageAllowance(flight.getBaggageAllowance());
        resp.setFlightType(flight.getFlightType() != null ? flight.getFlightType() : "DOMESTIC");

        long available = seatRepository.countByFlightIdAndIsBookedFalse(flight.getId());
        long booked = seatRepository.countByFlightIdAndIsBookedTrue(flight.getId());
        resp.setAvailableSeats((int) available);
        resp.setBookedSeats((int) booked);
        resp.setTotalSeats((int) (available + booked));

        return resp;
    }
}
