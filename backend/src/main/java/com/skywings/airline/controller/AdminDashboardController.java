package com.skywings.airline.controller;

import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.BookingResponse;
import com.skywings.airline.dto.response.DashboardStatsResponse;
import com.skywings.airline.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller providing administrative analytics, system KPIs, and booking overviews.
 * Secured under /api/admin/** (ROLE_ADMIN required).
 */
@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.ok("Operational metrics and analytics retrieved", stats));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = dashboardService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.ok("All passenger reservations retrieved", bookings));
    }
}
