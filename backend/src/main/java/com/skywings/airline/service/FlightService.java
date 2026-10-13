package com.skywings.airline.service;

import com.skywings.airline.dto.request.FlightRequest;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.entity.Aircraft;

import java.util.List;

public interface FlightService {

    List<FlightResponse> getAllFlights();

    FlightResponse getFlightById(Long id);

    FlightResponse createFlight(FlightRequest request);

    FlightResponse updateFlight(Long id, FlightRequest request);

    void deleteFlight(Long id);

    String deleteFlight(Long id, boolean purge);

    List<Aircraft> getAllAircraft();
}
