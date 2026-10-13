package com.skywings.airline.service.impl;

import com.skywings.airline.dto.request.BroadcastRequest;
import com.skywings.airline.dto.request.ScheduleUpdateRequest;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.dto.response.NotificationResponse;
import com.skywings.airline.entity.*;
import com.skywings.airline.repository.*;
import com.skywings.airline.service.FlightService;
import com.skywings.airline.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final FlightService flightService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a, MMM dd");

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   FlightRepository flightRepository,
                                   BookingRepository bookingRepository,
                                   SeatRepository seatRepository,
                                   FlightService flightService) {
        this.notificationRepository = notificationRepository;
        this.flightRepository = flightRepository;
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
        this.flightService = flightService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserOrBroadcast(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to access this notification.");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserOrBroadcast(userId);
        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Override
    @Transactional
    public FlightResponse updateFlightSchedule(Long flightId, ScheduleUpdateRequest request) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + flightId));

        String oldStatus = flight.getStatus();
        String oldGate = flight.getGate();

        if (request.getDepartureTime() != null) {
            flight.setDepartureTime(request.getDepartureTime());
        }
        if (request.getArrivalTime() != null) {
            flight.setArrivalTime(request.getArrivalTime());
        }
        if (request.getGate() != null && !request.getGate().trim().isEmpty()) {
            flight.setGate(request.getGate().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            flight.setStatus(request.getStatus().trim().toUpperCase());
        }

        // If status became CANCELLED, release seats on the flight
        if ("CANCELLED".equalsIgnoreCase(flight.getStatus()) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
            List<Seat> seats = seatRepository.findByFlightIdOrderByRowNumberAscColumnLetterAsc(flightId);
            for (Seat s : seats) {
                s.setIsBooked(false);
                seatRepository.save(s);
            }
        }

        Flight savedFlight = flightRepository.save(flight);

        // Determine title & alert type
        String alertType = "SCHEDULE_CHANGED";
        String alertTitle = "Flight Schedule Updated: " + flight.getFlightNumber();

        if ("DELAYED".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_DELAYED";
            alertTitle = "Flight Delayed: " + flight.getFlightNumber();
        } else if ("BOARDING".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_BOARDING";
            alertTitle = "Now Boarding: " + flight.getFlightNumber();
        } else if ("CANCELLED".equalsIgnoreCase(flight.getStatus())) {
            alertType = "FLIGHT_CANCELLED";
            alertTitle = "Flight Cancellation Notice: " + flight.getFlightNumber();
        } else if (request.getGate() != null && !request.getGate().equalsIgnoreCase(oldGate)) {
            alertType = "GATE_CHANGED";
            alertTitle = "Departure Gate Changed: " + flight.getFlightNumber();
        }

        StringBuilder msgBuilder = new StringBuilder();
        msgBuilder.append("Flight ").append(flight.getFlightNumber())
                .append(" (").append(flight.getSourceAirport()).append(" to ").append(flight.getDestinationAirport()).append(") ")
                .append("operational status is now ").append(flight.getStatus()).append(". ");

        if (flight.getDepartureTime() != null) {
            msgBuilder.append("Departure: ").append(flight.getDepartureTime().format(TIME_FMT)).append(". ");
        }
        if (flight.getGate() != null) {
            msgBuilder.append("Gate: ").append(flight.getGate()).append(". ");
        }

        if (request.getBroadcastMessage() != null && !request.getBroadcastMessage().trim().isEmpty()) {
            msgBuilder.append("Airline Note: ").append(request.getBroadcastMessage().trim());
        }

        String finalMessage = msgBuilder.toString();

        // Broadcast notification to all passengers with confirmed bookings on this flight
        List<Booking> bookings = bookingRepository.findByFlightId(flightId);
        Set<Long> notifiedUserIds = new HashSet<>();

        for (Booking b : bookings) {
            if ("CONFIRMED".equalsIgnoreCase(b.getBookingStatus()) && b.getUser() != null) {
                Long uid = b.getUser().getId();
                if (!notifiedUserIds.contains(uid)) {
                    notifiedUserIds.add(uid);
                    notificationRepository.save(new Notification(
                            b.getUser(),
                            savedFlight,
                            alertTitle,
                            finalMessage,
                            alertType
                    ));
                }
            }
        }

        return flightService.getFlightById(flightId);
    }

    @Override
    @Transactional
    public NotificationResponse broadcastNotification(BroadcastRequest request) {
        String type = request.getType() != null && !request.getType().trim().isEmpty()
                ? request.getType().trim().toUpperCase()
                : "OPERATIONAL_ALERT";

        Flight flight = null;
        if (request.getFlightId() != null) {
            flight = flightRepository.findById(request.getFlightId()).orElse(null);
        }

        if (flight != null) {
            // Notify passengers on this flight
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
                                request.getTitle().trim(),
                                request.getMessage().trim(),
                                type
                        ));
                    }
                }
            }
        }

        // Also record a broadcast notification
        Notification broadcast = new Notification(
                null,
                flight,
                request.getTitle().trim(),
                request.getMessage().trim(),
                type
        );
        Notification saved = notificationRepository.save(broadcast);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse resp = new NotificationResponse();
        resp.setId(n.getId());
        if (n.getUser() != null) {
            resp.setUserId(n.getUser().getId());
            resp.setRecipientName(n.getUser().getFullName());
        } else {
            resp.setRecipientName("All SkyWings Passengers");
        }
        if (n.getFlight() != null) {
            resp.setFlightId(n.getFlight().getId());
            resp.setFlightNumber(n.getFlight().getFlightNumber());
        }
        resp.setTitle(n.getTitle());
        resp.setMessage(n.getMessage());
        resp.setType(n.getType());
        resp.setIsRead(n.getIsRead());
        resp.setCreatedAt(n.getCreatedAt());
        return resp;
    }
}
