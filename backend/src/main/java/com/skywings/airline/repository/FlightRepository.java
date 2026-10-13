package com.skywings.airline.repository;

import com.skywings.airline.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    List<Flight> findByStatus(String status);

    long countByStatus(String status);

    @Query("SELECT f FROM Flight f WHERE " +
           "(:source IS NULL OR LOWER(f.sourceAirport) LIKE LOWER(CONCAT('%', :source, '%')) OR LOWER(f.sourceCity) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
           "(:destination IS NULL OR LOWER(f.destinationAirport) LIKE LOWER(CONCAT('%', :destination, '%')) OR LOWER(f.destinationCity) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
           "(cast(:startTime as timestamp) IS NULL OR f.departureTime >= :startTime) AND " +
           "(cast(:endTime as timestamp) IS NULL OR f.departureTime <= :endTime) AND " +
           "f.status <> 'CANCELLED' " +
           "ORDER BY f.departureTime ASC")
    List<Flight> searchFlights(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<Flight> findTop5ByOrderByDepartureTimeDesc();
}
