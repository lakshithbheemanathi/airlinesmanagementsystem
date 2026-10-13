package com.skywings.airline.service.impl;

import com.skywings.airline.dto.request.PaymentRequest;
import com.skywings.airline.dto.response.PaymentResponse;
import com.skywings.airline.entity.Booking;
import com.skywings.airline.entity.Notification;
import com.skywings.airline.entity.Payment;
import com.skywings.airline.repository.BookingRepository;
import com.skywings.airline.repository.NotificationRepository;
import com.skywings.airline.repository.PaymentRepository;
import com.skywings.airline.security.UserDetailsImpl;
import com.skywings.airline.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;

    private static final String DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              BookingRepository bookingRepository,
                              NotificationRepository notificationRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public PaymentResponse simulatePayment(PaymentRequest request, UserDetailsImpl userDetails) {
        Booking booking = null;

        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        }

        if (booking == null && request.getPnrNumber() != null && !request.getPnrNumber().isBlank()) {
            booking = bookingRepository.findByPnrNumber(request.getPnrNumber().trim().toUpperCase()).orElse(null);
        }

        if (booking == null) {
            throw new RuntimeException("Booking not found for payment processing.");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new RuntimeException("Cannot process payment for a cancelled booking.");
        }

        // Check if already paid
        Payment existing = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (existing != null && "SUCCESS".equalsIgnoreCase(existing.getPaymentStatus())) {
            return mapToPaymentResponse(existing);
        }

        String txnId = generateTransactionId();

        Payment payment = new Payment(
                booking,
                txnId,
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD",
                booking.getTotalAmount(),
                "SUCCESS",
                LocalDateTime.now()
        );

        if (request.getCardLastFour() != null && !request.getCardLastFour().isBlank()) {
            payment.setCardLastFour(request.getCardLastFour());
        }
        payment.setGatewayResponse("SIMULATED_AUTH_APPROVED");

        Payment savedPayment = paymentRepository.save(payment);

        // Update booking status
        booking.setBookingStatus("CONFIRMED");
        bookingRepository.save(booking);

        // Dispatch in-app notification
        notificationRepository.save(new Notification(
                booking.getUser(),
                booking.getFlight(),
                "Payment Confirmed: PNR " + booking.getPnrNumber(),
                "Payment of $" + String.format("%.2f", savedPayment.getAmount()) + " received via " + savedPayment.getPaymentMethod() + ". Transaction ID: " + txnId,
                "PAYMENT_SUCCESS"
        ));

        return mapToPaymentResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for booking ID: " + bookingId));
        return mapToPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByPnr(String pnrNumber) {
        Booking booking = bookingRepository.findByPnrNumber(pnrNumber.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Booking not found for PNR: " + pnrNumber));

        return getPaymentByBookingId(booking.getId());
    }

    private String generateTransactionId() {
        StringBuilder sb = new StringBuilder("TXN-");
        for (int i = 0; i < 8; i++) {
            sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }

    private PaymentResponse mapToPaymentResponse(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getBooking().getId(),
                p.getBooking().getPnrNumber(),
                p.getTransactionId(),
                p.getPaymentMethod(),
                p.getAmount(),
                p.getPaymentStatus(),
                p.getPaidAt(),
                p.getCardLastFour(),
                p.getGatewayResponse()
        );
    }
}
