package com.skywings.airline.service;

import com.skywings.airline.dto.request.PaymentRequest;
import com.skywings.airline.dto.response.PaymentResponse;
import com.skywings.airline.security.UserDetailsImpl;

public interface PaymentService {

    PaymentResponse simulatePayment(PaymentRequest request, UserDetailsImpl userDetails);

    PaymentResponse getPaymentByBookingId(Long bookingId);

    PaymentResponse getPaymentByPnr(String pnrNumber);
}
