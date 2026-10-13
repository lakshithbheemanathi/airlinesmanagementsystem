package com.skywings.airline.controller;

import com.skywings.airline.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller to verify entity tables, relationships, and seed data counts.
 */
@RestController
@RequestMapping("/api/db-status")
public class DatabaseStatusController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public DatabaseStatusController(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    AircraftRepository aircraftRepository,
                                    FlightRepository flightRepository,
                                    SeatRepository seatRepository,
                                    BookingRepository bookingRepository,
                                    PaymentRepository paymentRepository,
                                    NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.aircraftRepository = aircraftRepository;
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("databaseConnected", true);
        status.put("rolesCount", roleRepository.count());
        status.put("usersCount", userRepository.count());
        status.put("aircraftCount", aircraftRepository.count());
        status.put("flightsCount", flightRepository.count());
        status.put("seatsCount", seatRepository.count());
        status.put("bookingsCount", bookingRepository.count());
        status.put("paymentsCount", paymentRepository.count());
        status.put("notificationsCount", notificationRepository.count());
        status.put("totalRevenue", bookingRepository.calculateTotalRevenue());
        return ResponseEntity.ok(status);
    }
}
