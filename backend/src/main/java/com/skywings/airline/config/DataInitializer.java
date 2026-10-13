package com.skywings.airline.config;

import com.skywings.airline.entity.*;
import com.skywings.airline.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DataInitializer executes on application startup.
 * Automatically seeds default roles, admin/passenger accounts, commercial aircraft,
 * scheduled flights, seat configurations, and initial bookings.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingPassengerRepository bookingPassengerRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           AircraftRepository aircraftRepository,
                           FlightRepository flightRepository,
                           SeatRepository seatRepository,
                           BookingRepository bookingRepository,
                           BookingPassengerRepository bookingPassengerRepository,
                           PaymentRepository paymentRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.aircraftRepository = aircraftRepository;
        this.flightRepository = flightRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingPassengerRepository = bookingPassengerRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Roles
        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        // 2. Seed Default Admin User
        if (!userRepository.existsByEmail("admin@skywings.com")) {
            User admin = new User(
                    "SkyWings Administrator",
                    "admin@skywings.com",
                    passwordEncoder.encode("admin123"),
                    "+1 (555) 019-2831",
                    adminRole
            );
            userRepository.save(admin);
            System.out.println("✅ Seeded Admin: admin@skywings.com / admin123");
        }

        // 3. Seed Default Passenger User
        User passenger = userRepository.findByEmail("passenger@skywings.com").orElse(null);
        if (passenger == null) {
            passenger = new User(
                    "Alex Morgan",
                    "passenger@skywings.com",
                    passwordEncoder.encode("user123"),
                    "+1 (555) 014-9982",
                    userRole
            );
            passenger = userRepository.save(passenger);
            System.out.println("✅ Seeded Passenger: passenger@skywings.com / user123");
        }

        // 4. Seed Aircraft Fleet
        Aircraft b737 = aircraftRepository.findByRegistrationNo("N737SW").orElseGet(() ->
                aircraftRepository.save(new Aircraft("Boeing 737-800", "N737SW", 60, 52, 8))
        );

        Aircraft a320 = aircraftRepository.findByRegistrationNo("N320SW").orElseGet(() ->
                aircraftRepository.save(new Aircraft("Airbus A320neo", "N320SW", 56, 48, 8))
        );

        Aircraft b787 = aircraftRepository.findByRegistrationNo("N787SW").orElseGet(() ->
                aircraftRepository.save(new Aircraft("Boeing 787-9 Dreamliner", "N787SW", 72, 60, 12))
        );

        // 5. Seed Scheduled Flights if none exist or if legacy USD data exists or HYD not yet seeded
        boolean needsReseed = flightRepository.count() == 0 ||
                flightRepository.findAll().stream().anyMatch(f -> f.getEconomyFare() != null && f.getEconomyFare() < 1000) ||
                flightRepository.findAll().stream().noneMatch(f -> "HYD".equalsIgnoreCase(f.getSourceAirport()));

        if (needsReseed) {
            // Clean legacy demo data if updating from old schema
            if (flightRepository.count() > 0) {
                notificationRepository.deleteAll();
                paymentRepository.deleteAll();
                bookingPassengerRepository.deleteAll();
                bookingRepository.deleteAll();
                seatRepository.deleteAll();
                flightRepository.deleteAll();
                System.out.println("🔄 Refreshing airline inventory to Indian Domestic & International routes with Hyderabad (HYD) in INR...");
            }

            LocalDateTime now = LocalDateTime.now();

            // --- DOMESTIC ROUTES (INDIA) ---
            Flight f1 = new Flight(
                    "SW-101", "SkyWings Airlines", a320,
                    "DEL", "BOM", "New Delhi", "Mumbai",
                    now.plusDays(1).withHour(7).withMinute(0).withSecond(0),
                    now.plusDays(1).withHour(9).withMinute(15).withSecond(0),
                    135, 4499.00, 12999.00,
                    "SCHEDULED", "T3-12A", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f2 = new Flight(
                    "SW-102", "SkyWings Airlines", a320,
                    "BOM", "DEL", "Mumbai", "New Delhi",
                    now.plusDays(1).withHour(11).withMinute(30).withSecond(0),
                    now.plusDays(1).withHour(13).withMinute(45).withSecond(0),
                    135, 4699.00, 13499.00,
                    "SCHEDULED", "T2-42B", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f3 = new Flight(
                    "SW-203", "SkyWings Airlines", a320,
                    "BOM", "GOI", "Mumbai", "Goa",
                    now.plusDays(1).withHour(14).withMinute(30).withSecond(0),
                    now.plusDays(1).withHour(15).withMinute(45).withSecond(0),
                    75, 3299.00, 8999.00,
                    "SCHEDULED", "T2-18", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f4 = new Flight(
                    "SW-204", "SkyWings Airlines", a320,
                    "GOI", "BOM", "Goa", "Mumbai",
                    now.plusDays(2).withHour(16).withMinute(30).withSecond(0),
                    now.plusDays(2).withHour(17).withMinute(45).withSecond(0),
                    75, 3499.00, 9299.00,
                    "SCHEDULED", "T1-04", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f5 = new Flight(
                    "SW-305", "SkyWings Airlines", b737,
                    "BLR", "DEL", "Bengaluru", "New Delhi",
                    now.plusDays(2).withHour(8).withMinute(15).withSecond(0),
                    now.plusDays(2).withHour(11).withMinute(0).withSecond(0),
                    165, 5999.00, 15499.00,
                    "SCHEDULED", "T1-31", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f6 = new Flight(
                    "SW-306", "SkyWings Airlines", b737,
                    "DEL", "BLR", "New Delhi", "Bengaluru",
                    now.plusDays(2).withHour(13).withMinute(0).withSecond(0),
                    now.plusDays(2).withHour(15).withMinute(45).withSecond(0),
                    165, 6199.00, 15999.00,
                    "SCHEDULED", "T3-08", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f7 = new Flight(
                    "SW-407", "SkyWings Airlines", a320,
                    "CCU", "DEL", "Kolkata", "New Delhi",
                    now.plusDays(3).withHour(9).withMinute(45).withSecond(0),
                    now.plusDays(3).withHour(12).withMinute(10).withSecond(0),
                    145, 4899.00, 13200.00,
                    "SCHEDULED", "T2-14", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight f8 = new Flight(
                    "SW-509", "SkyWings Airlines", a320,
                    "BLR", "MAA", "Bengaluru", "Chennai",
                    now.plusDays(3).withHour(6).withMinute(45).withSecond(0),
                    now.plusDays(3).withHour(7).withMinute(45).withSecond(0),
                    60, 2899.00, 7499.00,
                    "SCHEDULED", "T1-12", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            // --- HYDERABAD (HYD) DOMESTIC ROUTES ---
            Flight fHyd1 = new Flight(
                    "SW-511", "SkyWings Airlines", a320,
                    "HYD", "DEL", "Hyderabad", "New Delhi",
                    now.plusDays(1).withHour(8).withMinute(45).withSecond(0),
                    now.plusDays(1).withHour(10).withMinute(55).withSecond(0),
                    130, 4899.00, 12500.00,
                    "SCHEDULED", "T1-14", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd2 = new Flight(
                    "SW-512", "SkyWings Airlines", a320,
                    "DEL", "HYD", "New Delhi", "Hyderabad",
                    now.plusDays(1).withHour(14).withMinute(15).withSecond(0),
                    now.plusDays(1).withHour(16).withMinute(30).withSecond(0),
                    135, 4999.00, 12800.00,
                    "SCHEDULED", "T3-22", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd3 = new Flight(
                    "SW-611", "SkyWings Airlines", b737,
                    "HYD", "BOM", "Hyderabad", "Mumbai",
                    now.plusDays(2).withHour(7).withMinute(30).withSecond(0),
                    now.plusDays(2).withHour(9).withMinute(0).withSecond(0),
                    90, 3699.00, 9499.00,
                    "SCHEDULED", "T1-08", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd4 = new Flight(
                    "SW-612", "SkyWings Airlines", b737,
                    "BOM", "HYD", "Mumbai", "Hyderabad",
                    now.plusDays(2).withHour(18).withMinute(30).withSecond(0),
                    now.plusDays(2).withHour(19).withMinute(55).withSecond(0),
                    85, 3799.00, 9699.00,
                    "SCHEDULED", "T2-16", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd5 = new Flight(
                    "SW-715", "SkyWings Airlines", a320,
                    "HYD", "BLR", "Hyderabad", "Bengaluru",
                    now.plusDays(2).withHour(10).withMinute(30).withSecond(0),
                    now.plusDays(2).withHour(11).withMinute(40).withSecond(0),
                    70, 2799.00, 7299.00,
                    "SCHEDULED", "T1-05", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd6 = new Flight(
                    "SW-716", "SkyWings Airlines", a320,
                    "BLR", "HYD", "Bengaluru", "Hyderabad",
                    now.plusDays(2).withHour(16).withMinute(0).withSecond(0),
                    now.plusDays(2).withHour(17).withMinute(10).withSecond(0),
                    70, 2899.00, 7499.00,
                    "SCHEDULED", "T1-20", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            Flight fHyd7 = new Flight(
                    "SW-817", "SkyWings Airlines", a320,
                    "HYD", "GOI", "Hyderabad", "Goa",
                    now.plusDays(3).withHour(12).withMinute(15).withSecond(0),
                    now.plusDays(3).withHour(13).withMinute(35).withSecond(0),
                    80, 3499.00, 8999.00,
                    "SCHEDULED", "T1-09", "7 kg Cabin, 15 kg Check-in", "DOMESTIC"
            );

            // --- INTERNATIONAL ROUTES ---
            Flight f9 = new Flight(
                    "SW-801", "SkyWings Airlines", b787,
                    "DEL", "DXB", "New Delhi", "Dubai",
                    now.plusDays(2).withHour(9).withMinute(15).withSecond(0),
                    now.plusDays(2).withHour(11).withMinute(45).withSecond(0),
                    240, 19499.00, 45999.00,
                    "SCHEDULED", "T3-G19", "10 kg Cabin, 30 kg Check-in", "INTERNATIONAL"
            );

            Flight f10 = new Flight(
                    "SW-802", "SkyWings Airlines", b787,
                    "DXB", "DEL", "Dubai", "New Delhi",
                    now.plusDays(3).withHour(13).withMinute(30).withSecond(0),
                    now.plusDays(3).withHour(18).withMinute(15).withSecond(0),
                    225, 21299.00, 48500.00,
                    "SCHEDULED", "T1-24B", "10 kg Cabin, 30 kg Check-in", "INTERNATIONAL"
            );

            Flight fHyd8 = new Flight(
                    "SW-885", "SkyWings Airlines", b787,
                    "HYD", "DXB", "Hyderabad", "Dubai",
                    now.plusDays(3).withHour(10).withMinute(0).withSecond(0),
                    now.plusDays(3).withHour(12).withMinute(30).withSecond(0),
                    240, 18999.00, 44500.00,
                    "SCHEDULED", "T1-G28", "10 kg Cabin, 30 kg Check-in", "INTERNATIONAL"
            );

            Flight fHyd9 = new Flight(
                    "SW-886", "SkyWings Airlines", b787,
                    "DXB", "HYD", "Dubai", "Hyderabad",
                    now.plusDays(3).withHour(14).withMinute(30).withSecond(0),
                    now.plusDays(3).withHour(19).withMinute(45).withSecond(0),
                    225, 20499.00, 46800.00,
                    "SCHEDULED", "T1-12B", "10 kg Cabin, 30 kg Check-in", "INTERNATIONAL"
            );

            Flight f11 = new Flight(
                    "SW-901", "SkyWings Airlines", b787,
                    "BOM", "LHR", "Mumbai", "London",
                    now.plusDays(3).withHour(2).withMinute(30).withSecond(0),
                    now.plusDays(3).withHour(7).withMinute(45).withSecond(0),
                    555, 48999.00, 125000.00,
                    "SCHEDULED", "T2-G88", "10 kg Cabin, 2x 23 kg Check-in", "INTERNATIONAL"
            );

            Flight f12 = new Flight(
                    "SW-701", "SkyWings Airlines", b787,
                    "BLR", "SIN", "Bengaluru", "Singapore",
                    now.plusDays(4).withHour(23).withMinute(10).withSecond(0),
                    now.plusDays(5).withHour(6).withMinute(10).withSecond(0),
                    270, 23999.00, 58000.00,
                    "SCHEDULED", "T2-G05", "10 kg Cabin, 30 kg Check-in", "INTERNATIONAL"
            );

            Flight f13 = new Flight(
                    "SW-605", "SkyWings Airlines", b737,
                    "DEL", "BKK", "New Delhi", "Bangkok",
                    now.plusDays(4).withHour(13).withMinute(45).withSecond(0),
                    now.plusDays(4).withHour(19).withMinute(30).withSecond(0),
                    255, 16999.00, 42000.00,
                    "SCHEDULED", "T3-G14", "7 kg Cabin, 25 kg Check-in", "INTERNATIONAL"
            );

            Flight f14 = new Flight(
                    "SW-991", "SkyWings Airlines", b787,
                    "DEL", "JFK", "New Delhi", "New York",
                    now.plusDays(5).withHour(1).withMinute(30).withSecond(0),
                    now.plusDays(5).withHour(7).withMinute(20).withSecond(0),
                    920, 68500.00, 185000.00,
                    "SCHEDULED", "T3-G02", "10 kg Cabin, 2x 23 kg Check-in", "INTERNATIONAL"
            );

            List<Flight> flights = flightRepository.saveAll(List.of(
                    f1, f2, f3, f4, f5, f6, f7, f8,
                    fHyd1, fHyd2, fHyd3, fHyd4, fHyd5, fHyd6, fHyd7,
                    f9, f10, fHyd8, fHyd9, f11, f12, f13, f14
            ));
            System.out.println("✅ Seeded " + flights.size() + " scheduled commercial flights (including Hyderabad domestic & international routes) in INR.");

            // Generate Seats for each flight
            for (Flight flight : flights) {
                generateSeatsForFlight(flight);
            }

            // Seed an initial booking for demo passenger
            createSampleBooking(passenger, f1);

            // Seed Initial Notifications
            notificationRepository.save(new Notification(
                    null, null,
                    "Welcome to SkyWings Airlines",
                    "Fly across India and international destinations with seamless booking, instant e-tickets, and live updates.",
                    "WELCOME"
            ));

            notificationRepository.save(new Notification(
                    passenger, f1,
                    "Booking Confirmed: PNR SW92KL",
                    "Your flight SW-101 from New Delhi (DEL) to Mumbai (BOM) is confirmed for departure from Gate T3-12A.",
                    "BOOKING_CONFIRMED"
            ));

            System.out.println("✅ Seeded initial booking (₹4,499.00), payments, and passenger notifications.");
        }
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
                // Pre-mark a couple of seats as booked for realism
                boolean isBooked = (r == 4 && col.equals("B")) || (r == 7 && col.equals("E"));
                seats.add(new Seat(flight, r + col, "ECONOMY", isBooked, r, col));
            }
        }

        seatRepository.saveAll(seats);
    }

    private void createSampleBooking(User user, Flight flight) {
        Seat bookedSeat = seatRepository.findByFlightIdAndSeatNumber(flight.getId(), "3A").orElse(null);
        if (bookedSeat != null) {
            bookedSeat.setIsBooked(true);
            seatRepository.save(bookedSeat);
        }

        Booking booking = new Booking(
                "SW92KL",
                user,
                flight,
                flight.getEconomyFare(),
                "CONFIRMED",
                LocalDateTime.now().minusHours(2)
        );
        booking = bookingRepository.save(booking);

        Passenger passenger = new Passenger(
                user.getFullName(),
                "1994-05-18",
                "FEMALE",
                "P98240182",
                user.getEmail(),
                user.getPhone()
        );

        BookingPassenger bp = new BookingPassenger(
                booking,
                passenger,
                bookedSeat,
                "ECONOMY",
                flight.getEconomyFare()
        );
        bookingPassengerRepository.save(bp);

        Payment payment = new Payment(
                booking,
                "TXN-88492019",
                "CARD",
                flight.getEconomyFare(),
                "SUCCESS",
                LocalDateTime.now().minusHours(2)
        );
        paymentRepository.save(payment);
    }
}
