package com.skywings.airline.controller;

import com.skywings.airline.dto.request.PaymentRequest;
import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.PaymentResponse;
import com.skywings.airline.entity.Payment;
import com.skywings.airline.repository.PaymentRepository;
import com.skywings.airline.security.UserDetailsImpl;
import com.skywings.airline.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for simulated safe payment processing and transaction queries.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentService paymentService, PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<PaymentResponse>> simulatePayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        try {
            PaymentResponse response = paymentService.simulatePayment(request, userDetails);
            return ResponseEntity.ok(ApiResponse.ok("Payment approved! Transaction ID: " + response.getTransactionId(), response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBooking(@PathVariable Long bookingId) {
        try {
            PaymentResponse response = paymentService.getPaymentByBookingId(bookingId);
            return ResponseEntity.ok(ApiResponse.ok("Payment details retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/pnr/{pnr}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByPnr(@PathVariable String pnr) {
        try {
            PaymentResponse response = paymentService.getPaymentByPnr(pnr);
            return ResponseEntity.ok(ApiResponse.ok("Payment details retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
