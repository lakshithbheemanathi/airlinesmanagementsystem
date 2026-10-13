package com.skywings.airline.controller;

import com.skywings.airline.dto.request.FlightRequest;
import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.entity.Aircraft;
import com.skywings.airline.service.FlightService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.skywings.airline.dto.request.ScheduleUpdateRequest;
import com.skywings.airline.service.NotificationService;

/**
 * Controller for Administrator flight management operations.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminFlightController {

    private final FlightService flightService;
    private final NotificationService notificationService;

    public AdminFlightController(FlightService flightService, NotificationService notificationService) {
        this.flightService = flightService;
        this.notificationService = notificationService;
    }

    @PutMapping("/flights/{id}/schedule")
    public ResponseEntity<ApiResponse<FlightResponse>> updateFlightSchedule(
            @PathVariable Long id,
            @RequestBody ScheduleUpdateRequest request) {
        FlightResponse updated = notificationService.updateFlightSchedule(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Flight schedule updated and passenger alerts broadcast successfully", updated));
    }

    @GetMapping("/flights")
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getAllFlights() {
        List<FlightResponse> flights = flightService.getAllFlights();
        return ResponseEntity.ok(ApiResponse.ok("All flights retrieved successfully", flights));
    }

    @GetMapping("/flights/{id}")
    public ResponseEntity<ApiResponse<FlightResponse>> getFlightById(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);
        return ResponseEntity.ok(ApiResponse.ok("Flight details retrieved", flight));
    }

    @PostMapping("/flights")
    public ResponseEntity<ApiResponse<FlightResponse>> createFlight(@Valid @RequestBody FlightRequest request) {
        FlightResponse created = flightService.createFlight(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Flight " + created.getFlightNumber() + " scheduled successfully with seat layout!", created));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<ApiResponse<FlightResponse>> updateFlight(@PathVariable Long id,
                                                                   @Valid @RequestBody FlightRequest request) {
        FlightResponse updated = flightService.updateFlight(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Flight " + updated.getFlightNumber() + " updated successfully", updated));
    }

    @DeleteMapping("/flights/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFlight(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean purge) {
        String msg = flightService.deleteFlight(id, purge);
        return ResponseEntity.ok(ApiResponse.ok(msg, msg));
    }

    @GetMapping("/aircraft")
    public ResponseEntity<ApiResponse<List<Aircraft>>> getAllAircraft() {
        List<Aircraft> fleet = flightService.getAllAircraft();
        return ResponseEntity.ok(ApiResponse.ok("Commercial aircraft fleet retrieved", fleet));
    }
}
