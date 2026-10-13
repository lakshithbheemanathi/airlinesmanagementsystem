package com.skywings.airline.dto.response;

import java.util.List;

/**
 * Data Transfer Object containing system-wide KPI metrics and operational summaries
 * for the Administrator Dashboard.
 */
public class DashboardStatsResponse {

    private Double totalRevenue;
    private Double totalRefunds;
    private Double netRevenue;
    private Long totalFlights;
    private Long activeFlights;
    private Long cancelledFlights;
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private Double cancellationRate;
    private Long totalSeats;
    private Long bookedSeats;
    private Double loadFactor;
    private Long totalPassengers;
    private Long fleetSize;
    private List<BookingResponse> recentBookings;
    private List<FlightResponse> upcomingFlights;

    public DashboardStatsResponse() {
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Double getTotalRefunds() {
        return totalRefunds;
    }

    public void setTotalRefunds(Double totalRefunds) {
        this.totalRefunds = totalRefunds;
    }

    public Double getNetRevenue() {
        return netRevenue;
    }

    public void setNetRevenue(Double netRevenue) {
        this.netRevenue = netRevenue;
    }

    public Long getTotalFlights() {
        return totalFlights;
    }

    public void setTotalFlights(Long totalFlights) {
        this.totalFlights = totalFlights;
    }

    public Long getActiveFlights() {
        return activeFlights;
    }

    public void setActiveFlights(Long activeFlights) {
        this.activeFlights = activeFlights;
    }

    public Long getCancelledFlights() {
        return cancelledFlights;
    }

    public void setCancelledFlights(Long cancelledFlights) {
        this.cancelledFlights = cancelledFlights;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(Long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public Long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(Long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public Double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(Double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }

    public Long getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Long totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Long getBookedSeats() {
        return bookedSeats;
    }

    public void setBookedSeats(Long bookedSeats) {
        this.bookedSeats = bookedSeats;
    }

    public Double getLoadFactor() {
        return loadFactor;
    }

    public void setLoadFactor(Double loadFactor) {
        this.loadFactor = loadFactor;
    }

    public Long getTotalPassengers() {
        return totalPassengers;
    }

    public void setTotalPassengers(Long totalPassengers) {
        this.totalPassengers = totalPassengers;
    }

    public Long getFleetSize() {
        return fleetSize;
    }

    public void setFleetSize(Long fleetSize) {
        this.fleetSize = fleetSize;
    }

    public List<BookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }

    public List<FlightResponse> getUpcomingFlights() {
        return upcomingFlights;
    }

    public void setUpcomingFlights(List<FlightResponse> upcomingFlights) {
        this.upcomingFlights = upcomingFlights;
    }
}
