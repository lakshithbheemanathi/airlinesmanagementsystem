package com.skywings.airline.service;

import com.skywings.airline.dto.request.BookingRequest;
import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.security.UserDetailsImpl;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request, UserDetailsImpl userDetails);

    BookingResponse getBookingByPnr(String pnrNumber);

    List<BookingResponse> getUserBookings(Long userId);

    List<BookingResponse> getAllBookings();

    BookingResponse cancelBooking(Long bookingId, String reason);

    BookingResponse cancelBooking(Long bookingId, String reason, UserDetailsImpl userDetails);

    BookingResponse cancelBookingByPnr(String pnrNumber, String reason, UserDetailsImpl userDetails);
}
