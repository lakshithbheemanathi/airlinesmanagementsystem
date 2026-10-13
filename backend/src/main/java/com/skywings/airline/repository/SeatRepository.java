package com.skywings.airline.repository;

import com.skywings.airline.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByFlightIdOrderByRowNumberAscColumnLetterAsc(Long flightId);

    Optional<Seat> findByFlightIdAndSeatNumber(Long flightId, String seatNumber);

    List<Seat> findByFlightIdAndSeatNumberIn(Long flightId, List<String> seatNumbers);

    long countByFlightIdAndIsBookedFalse(Long flightId);

    long countByFlightIdAndIsBookedTrue(Long flightId);

    long countByIsBookedFalse();

    long countByIsBookedTrue();
}
