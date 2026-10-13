package com.skywings.airline.repository;

import com.skywings.airline.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPnrNumber(String pnrNumber);

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    List<Booking> findAllByOrderByBookingDateDesc();

    List<Booking> findTop5ByOrderByBookingDateDesc();

    List<Booking> findByFlightId(Long flightId);

    long countByBookingStatus(String bookingStatus);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0.0) FROM Booking b WHERE b.bookingStatus = 'CONFIRMED'")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.refundAmount), 0.0) FROM Booking b WHERE b.bookingStatus = 'CANCELLED'")
    Double calculateTotalRefunds();

    @Query("SELECT b FROM Booking b WHERE " +
           "(:query IS NULL OR LOWER(b.pnrNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.user.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> searchBookings(@Param("query") String query);
}
