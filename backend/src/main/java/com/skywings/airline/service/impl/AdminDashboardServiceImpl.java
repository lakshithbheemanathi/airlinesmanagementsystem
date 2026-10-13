package com.skywings.airline.service.impl;

import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.dto.response.DashboardStatsResponse;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.repository.*;
import com.skywings.airline.service.AdminDashboardService;
import com.skywings.airline.service.BookingService;
import com.skywings.airline.service.FlightService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final AircraftRepository aircraftRepository;
    private final BookingService bookingService;
    private final FlightService flightService;

    public AdminDashboardServiceImpl(BookingRepository bookingRepository,
                                     FlightRepository flightRepository,
                                     SeatRepository seatRepository,
                                     UserRepository userRepository,
                                     AircraftRepository aircraftRepository,
                                     BookingService bookingService,
                                     FlightService flightService) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.aircraftRepository = aircraftRepository;
        this.bookingService = bookingService;
        this.flightService = flightService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // 1. Financial Analytics
        Double grossRevenue = bookingRepository.calculateTotalRevenue();
        if (grossRevenue == null) grossRevenue = 0.0;
        Double totalRefunds = bookingRepository.calculateTotalRefunds();
        if (totalRefunds == null) totalRefunds = 0.0;
        double netRevenue = Math.max(0.0, grossRevenue - totalRefunds);

        stats.setTotalRevenue(grossRevenue);
        stats.setTotalRefunds(totalRefunds);
        stats.setNetRevenue(netRevenue);

        // 2. Flight Operations
        long totalFlights = flightRepository.count();
        long activeFlights = flightRepository.countByStatus("SCHEDULED");
        long cancelledFlights = flightRepository.countByStatus("CANCELLED");

        stats.setTotalFlights(totalFlights);
        stats.setActiveFlights(activeFlights);
        stats.setCancelledFlights(cancelledFlights);

        // 3. Booking Metrics
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.countByBookingStatus("CONFIRMED");
        long cancelledBookings = bookingRepository.countByBookingStatus("CANCELLED");
        double cancellationRate = totalBookings > 0
                ? ((double) cancelledBookings / totalBookings) * 100.0
                : 0.0;

        stats.setTotalBookings(totalBookings);
        stats.setConfirmedBookings(confirmedBookings);
        stats.setCancelledBookings(cancelledBookings);
        stats.setCancellationRate(Math.round(cancellationRate * 10.0) / 10.0);

        // 4. Fleet Capacity & Load Factor
        long totalSeats = seatRepository.count();
        long bookedSeats = seatRepository.countByIsBookedTrue();
        double loadFactor = totalSeats > 0
                ? ((double) bookedSeats / totalSeats) * 100.0
                : 0.0;

        stats.setTotalSeats(totalSeats);
        stats.setBookedSeats(bookedSeats);
        stats.setLoadFactor(Math.round(loadFactor * 10.0) / 10.0);

        // 5. Fleet and Customer Base
        long totalPassengers = userRepository.countByRoleName("ROLE_USER");
        long fleetSize = aircraftRepository.count();

        stats.setTotalPassengers(totalPassengers);
        stats.setFleetSize(fleetSize);

        // 6. Recent reservations (top 8)
        List<BookingResponse> allBookings = bookingService.getAllBookings();
        stats.setRecentBookings(allBookings.stream().limit(8).collect(Collectors.toList()));

        // 7. Upcoming flight operations (top 6 scheduled)
        List<FlightResponse> allFlights = flightService.getAllFlights();
        stats.setUpcomingFlights(allFlights.stream()
                .filter(f -> "SCHEDULED".equalsIgnoreCase(f.getStatus()))
                .limit(6)
                .collect(Collectors.toList()));

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }
}
