package com.skywings.airline.service.impl;

import com.skywings.airline.dto.request.BookingRequest;
import com.skywings.airline.dto.request.PassengerRequest;
import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.entity.*;
import com.skywings.airline.repository.*;
import com.skywings.airline.security.UserDetailsImpl;
import com.skywings.airline.service.BookingService;
import com.skywings.airline.service.FlightService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingPassengerRepository bookingPassengerRepository;
    private final PassengerRepository passengerRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final FlightService flightService;

    private static final String PNR_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public BookingServiceImpl(BookingRepository bookingRepository,
                              BookingPassengerRepository bookingPassengerRepository,
                              PassengerRepository passengerRepository,
                              FlightRepository flightRepository,
                              SeatRepository seatRepository,
                              UserRepository userRepository,
                              PaymentRepository paymentRepository,
                              NotificationRepository notificationRepository,
                              FlightService flightService) {
        this.bookingRepository = bookingRepository;
        this.bookingPassengerRepository = bookingPassengerRepository;
        this.passengerRepository = passengerRepository;
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.flightService = flightService;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User account not found"));

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + request.getFlightId()));

        if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
            throw new RuntimeException("Cannot book seats on a cancelled flight.");
        }

        // Validate all requested seats are available
        List<Seat> seatsToBook = new ArrayList<>();
        double subtotal = 0.0;

        for (PassengerRequest pReq : request.getPassengers()) {
            Seat seat = seatRepository.findByFlightIdAndSeatNumber(flight.getId(), pReq.getSeatNumber().trim().toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Seat " + pReq.getSeatNumber() + " does not exist on this flight."));

            if (seat.getIsBooked()) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already occupied. Please choose another seat.");
            }

            seatsToBook.add(seat);
            double seatFare = "BUSINESS".equalsIgnoreCase(seat.getSeatClass()) ? flight.getBusinessFare() : flight.getEconomyFare();
            subtotal += seatFare;
        }

        // Add 10% taxes and regulatory airport fees
        double taxes = subtotal * 0.10;
        double totalAmount = subtotal + taxes;

        String pnr = generateUniquePnr();

        Booking booking = new Booking(
                pnr,
                user,
                flight,
                totalAmount,
                "CONFIRMED",
                LocalDateTime.now()
        );
        booking = bookingRepository.save(booking);

        // Save passengers and link to booking
        for (int i = 0; i < request.getPassengers().size(); i++) {
            PassengerRequest pReq = request.getPassengers().get(i);
            Seat seat = seatsToBook.get(i);

            Passenger passenger = new Passenger(
                    pReq.getFullName().trim(),
                    pReq.getDateOfBirth(),
                    pReq.getGender(),
                    pReq.getPassportNumber(),
                    pReq.getEmail() != null ? pReq.getEmail().trim() : user.getEmail(),
                    pReq.getPhone() != null ? pReq.getPhone().trim() : user.getPhone()
            );
            passenger = passengerRepository.save(passenger);

            double fare = "BUSINESS".equalsIgnoreCase(seat.getSeatClass()) ? flight.getBusinessFare() : flight.getEconomyFare();

            BookingPassenger bp = new BookingPassenger(
                    booking,
                    passenger,
                    seat,
                    seat.getSeatClass(),
                    fare
            );
            bookingPassengerRepository.save(bp);

            // Mark seat as booked
            seat.setIsBooked(true);
            seatRepository.save(seat);
        }

        // Create an in-app notification for the passenger
        notificationRepository.save(new Notification(
                user,
                flight,
                "Booking Confirmed: PNR " + pnr,
                "Your reservation on flight " + flight.getFlightNumber() + " (" + flight.getSourceAirport() + " to " + flight.getDestinationAirport() + ") is confirmed.",
                "BOOKING_CONFIRMED"
        ));

        return mapToBookingResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByPnr(String pnrNumber) {
        Booking booking = bookingRepository.findByPnrNumber(pnrNumber.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Reservation not found for PNR: " + pnrNumber));

        return mapToBookingResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingDateDesc().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String reason) {
        return cancelBooking(bookingId, reason, null);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String reason, UserDetailsImpl userDetails) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        return processCancellation(booking, reason, userDetails);
    }

    @Override
    @Transactional
    public BookingResponse cancelBookingByPnr(String pnrNumber, String reason, UserDetailsImpl userDetails) {
        Booking booking = bookingRepository.findByPnrNumber(pnrNumber.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Reservation not found for PNR: " + pnrNumber));
        return processCancellation(booking, reason, userDetails);
    }

    private BookingResponse processCancellation(Booking booking, String reason, UserDetailsImpl userDetails) {
        if (userDetails != null) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && !booking.getUser().getId().equals(userDetails.getId())) {
                throw new RuntimeException("Unauthorized: You can only cancel your own reservations.");
            }
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new RuntimeException("This booking is already cancelled.");
        }

        booking.setBookingStatus("CANCELLED");
        booking.setCancellationDate(LocalDateTime.now());
        booking.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Passenger requested cancellation");
        booking.setRefundAmount(booking.getTotalAmount() * 0.90); // 90% refund policy

        // Release seats back to flight inventory
        List<BookingPassenger> passengers = bookingPassengerRepository.findByBookingId(booking.getId());
        for (BookingPassenger bp : passengers) {
            Seat seat = bp.getSeat();
            if (seat != null) {
                seat.setIsBooked(false);
                seatRepository.save(seat);
            }
        }

        Booking saved = bookingRepository.save(booking);

        // Notify user
        notificationRepository.save(new Notification(
                booking.getUser(),
                booking.getFlight(),
                "Booking Cancelled: PNR " + booking.getPnrNumber(),
                "Your booking has been cancelled. A refund of ₹" + Math.round(booking.getRefundAmount()) + " has been initiated to your original payment method.",
                "BOOKING_CANCELLED"
        ));

        return mapToBookingResponse(saved);
    }

    private String generateUniquePnr() {
        String pnr;
        do {
            StringBuilder sb = new StringBuilder();
            sb.append("SW"); // SkyWings prefix
            for (int i = 0; i < 4; i++) {
                sb.append(PNR_CHARS.charAt(RANDOM.nextInt(PNR_CHARS.length())));
            }
            pnr = sb.toString();
        } while (bookingRepository.findByPnrNumber(pnr).isPresent());

        return pnr;
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse resp = new BookingResponse();
        resp.setId(booking.getId());
        resp.setPnrNumber(booking.getPnrNumber());
        resp.setTotalAmount(booking.getTotalAmount());
        resp.setBookingStatus(booking.getBookingStatus());
        resp.setBookingDate(booking.getBookingDate());
        resp.setPassengerEmail(booking.getUser().getEmail());
        resp.setPassengerName(booking.getUser().getFullName());
        resp.setFlight(flightService.getFlightById(booking.getFlight().getId()));
        resp.setRefundAmount(booking.getRefundAmount());
        resp.setCancellationDate(booking.getCancellationDate());
        resp.setCancellationReason(booking.getCancellationReason());

        List<BookingPassenger> bps = bookingPassengerRepository.findByBookingId(booking.getId());
        List<Map<String, Object>> pList = bps.stream().map(bp -> {
            Map<String, Object> map = new HashMap<>();
            map.put("passengerId", bp.getPassenger().getId());
            map.put("fullName", bp.getPassenger().getFullName());
            map.put("gender", bp.getPassenger().getGender());
            map.put("dateOfBirth", bp.getPassenger().getDateOfBirth());
            map.put("passportNumber", bp.getPassenger().getPassportNumber());
            map.put("email", bp.getPassenger().getEmail() != null ? bp.getPassenger().getEmail() : booking.getUser().getEmail());
            map.put("phone", bp.getPassenger().getPhone() != null ? bp.getPassenger().getPhone() : booking.getUser().getPhone());
            map.put("seatNumber", bp.getSeat().getSeatNumber());
            map.put("seatClass", bp.getSeatClass());
            map.put("fare", bp.getFare());
            return map;
        }).collect(Collectors.toList());
        resp.setPassengers(pList);

        paymentRepository.findByBookingId(booking.getId()).ifPresent(pay -> {
            resp.setPaymentStatus(pay.getPaymentStatus());
            resp.setTransactionId(pay.getTransactionId());
        });

        return resp;
    }
}
