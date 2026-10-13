package com.skywings.airline.service;

import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.dto.response.DashboardStatsResponse;

import java.util.List;

public interface AdminDashboardService {

    DashboardStatsResponse getStats();

    List<BookingResponse> getAllBookings();
}
