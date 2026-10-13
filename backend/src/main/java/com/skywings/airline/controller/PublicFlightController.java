package com.skywings.airline.controller;

import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.service.FlightService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Publicly accessible flight discovery and search REST APIs for passengers.
 */
@RestController
@RequestMapping("/api/flights")
public class PublicFlightController {

    private final FlightService flightService;
    private final com.skywings.airline.repository.SeatRepository seatRepository;

    public PublicFlightController(FlightService flightService,
                                  com.skywings.airline.repository.SeatRepository seatRepository) {
        this.flightService = flightService;
        this.seatRepository = seatRepository;
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFlightSeats(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);
        List<com.skywings.airline.entity.Seat> seats = seatRepository.findByFlightIdOrderByRowNumberAscColumnLetterAsc(id);

        List<com.skywings.airline.dto.response.SeatResponse> seatResponses = seats.stream().map(s -> {
            double price = "BUSINESS".equalsIgnoreCase(s.getSeatClass()) ? flight.getBusinessFare() : flight.getEconomyFare();
            return new com.skywings.airline.dto.response.SeatResponse(
                    s.getId(),
                    s.getSeatNumber(),
                    s.getSeatClass(),
                    s.getIsBooked(),
                    s.getRowNumber(),
                    s.getColumnLetter(),
                    price
            );
        }).collect(Collectors.toList());

        long bookedCount = seatResponses.stream().filter(com.skywings.airline.dto.response.SeatResponse::getIsBooked).count();
        long availableCount = seatResponses.size() - bookedCount;

        Map<String, Object> result = new HashMap<>();
        result.put("flightId", flight.getId());
        result.put("flightNumber", flight.getFlightNumber());
        result.put("aircraftModel", flight.getAircraftModel());
        result.put("totalSeats", seatResponses.size());
        result.put("availableSeats", availableCount);
        result.put("bookedSeats", bookedCount);
        result.put("seats", seatResponses);

        return ResponseEntity.ok(ApiResponse.ok("Seat map retrieved successfully", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightResponse>>> getAllPublicFlights() {
        List<FlightResponse> allFlights = flightService.getAllFlights().stream()
                .filter(f -> !"CANCELLED".equalsIgnoreCase(f.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All flights retrieved successfully", allFlights));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FlightResponse>>> searchFlights(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "1") Integer passengers,
            @RequestParam(required = false, defaultValue = "ECONOMY") String cabinClass,
            @RequestParam(required = false) String flightType) {

        List<FlightResponse> allFlights = flightService.getAllFlights();

        List<FlightResponse> filtered = allFlights.stream()
                // Must not be cancelled
                .filter(f -> !"CANCELLED".equalsIgnoreCase(f.getStatus()))
                // Flight type match if supplied (DOMESTIC / INTERNATIONAL / ALL)
                .filter(f -> {
                    if (flightType == null || flightType.isBlank() || "ALL".equalsIgnoreCase(flightType)) return true;
                    return flightType.equalsIgnoreCase(f.getFlightType());
                })
                // Source match (code or city - bidirectional to handle 'HYD', 'Hyderabad', or 'Hyderabad (HYD)')
                .filter(f -> {
                    if (source == null || source.isBlank()) return true;
                    String s = source.trim().toLowerCase();
                    String airport = f.getSourceAirport().toLowerCase();
                    String city = f.getSourceCity().toLowerCase();
                    return airport.contains(s) || s.contains(airport) || city.contains(s) || s.contains(city);
                })
                // Destination match (code or city - bidirectional)
                .filter(f -> {
                    if (destination == null || destination.isBlank()) return true;
                    String d = destination.trim().toLowerCase();
                    String airport = f.getDestinationAirport().toLowerCase();
                    String city = f.getDestinationCity().toLowerCase();
                    return airport.contains(d) || d.contains(airport) || city.contains(d) || d.contains(city);
                })
                // Date match if supplied
                .filter(f -> {
                    if (date == null) return true;
                    return f.getDepartureTime().toLocalDate().isEqual(date);
                })
                // Available seats match
                .filter(f -> f.getAvailableSeats() >= passengers)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Search completed. Found " + filtered.size() + " flights.", filtered));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightResponse>> getFlightDetails(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);
        return ResponseEntity.ok(ApiResponse.ok("Flight details retrieved", flight));
    }

    @GetMapping("/airports")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAirports() {
        List<FlightResponse> allFlights = flightService.getAllFlights();

        Map<String, String> airportMap = new HashMap<>();
        for (FlightResponse f : allFlights) {
            airportMap.put(f.getSourceAirport(), f.getSourceCity());
            airportMap.put(f.getDestinationAirport(), f.getDestinationCity());
        }

        List<Map<String, String>> airports = airportMap.entrySet().stream()
                .map(entry -> {
                    Map<String, String> item = new HashMap<>();
                    item.put("code", entry.getKey());
                    item.put("city", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> a.get("city").compareTo(b.get("city")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Airports retrieved", airports));
    }
}
