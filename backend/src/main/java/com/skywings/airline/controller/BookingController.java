package com.skywings.airline.controller;

import com.skywings.airline.dto.request.BookingRequest;
import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.security.UserDetailsImpl;
import com.skywings.airline.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller handling passenger reservations, PNR lookups, and booking cancellations.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Please sign in or create an account to complete your booking."));
        }

        try {
            BookingResponse response = bookingService.createBooking(request, userDetails);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Reservation confirmed with PNR " + response.getPnrNumber(), response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{pnr}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByPnr(@PathVariable String pnr) {
        try {
            BookingResponse response = bookingService.getBookingByPnr(pnr);
            return ResponseEntity.ok(ApiResponse.ok("Booking retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        List<BookingResponse> bookings = bookingService.getUserBookings(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok("User bookings retrieved", bookings));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String reason = body != null ? body.get("reason") : "Passenger requested cancellation";
        try {
            BookingResponse cancelled = bookingService.cancelBooking(id, reason, userDetails);
            return ResponseEntity.ok(ApiResponse.ok("Booking cancelled and seats released successfully", cancelled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/cancel/{pnr}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBookingByPnr(
            @PathVariable String pnr,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        String reason = body != null ? body.get("reason") : "Passenger requested cancellation";
        try {
            BookingResponse cancelled = bookingService.cancelBookingByPnr(pnr, reason, userDetails);
            return ResponseEntity.ok(ApiResponse.ok("Booking cancelled and seats released successfully", cancelled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
