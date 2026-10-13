package com.skywings.airline.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Flight entity representing scheduled flight operations.
 */
@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_number", nullable = false, length = 30)
    private String flightNumber;

    @Column(name = "airline_name", nullable = false, length = 100)
    private String airlineName = "SkyWings Airlines";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "source_airport", nullable = false, length = 10)
    private String sourceAirport;

    @Column(name = "destination_airport", nullable = false, length = 10)
    private String destinationAirport;

    @Column(name = "source_city", nullable = false, length = 100)
    private String sourceCity;

    @Column(name = "destination_city", nullable = false, length = 100)
    private String destinationCity;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "economy_fare", nullable = false)
    private Double economyFare;

    @Column(name = "business_fare", nullable = false)
    private Double businessFare;

    @Column(nullable = false, length = 30)
    private String status = "SCHEDULED"; // SCHEDULED, DELAYED, CANCELLED, COMPLETED

    @Column(length = 20)
    private String gate = "T2-G14";

    @Column(name = "baggage_allowance", length = 100)
    private String baggageAllowance = "7 kg Cabin, 20 kg Check-in";

    @Column(name = "flight_type", length = 30)
    private String flightType = "DOMESTIC"; // DOMESTIC, INTERNATIONAL

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Flight() {
    }

    public Flight(String flightNumber, String airlineName, Aircraft aircraft,
                  String sourceAirport, String destinationAirport,
                  String sourceCity, String destinationCity,
                  LocalDateTime departureTime, LocalDateTime arrivalTime,
                  Integer durationMinutes, Double economyFare, Double businessFare,
                  String status, String gate, String baggageAllowance) {
        this(flightNumber, airlineName, aircraft, sourceAirport, destinationAirport,
             sourceCity, destinationCity, departureTime, arrivalTime, durationMinutes,
             economyFare, businessFare, status, gate, baggageAllowance, "DOMESTIC");
    }

    public Flight(String flightNumber, String airlineName, Aircraft aircraft,
                  String sourceAirport, String destinationAirport,
                  String sourceCity, String destinationCity,
                  LocalDateTime departureTime, LocalDateTime arrivalTime,
                  Integer durationMinutes, Double economyFare, Double businessFare,
                  String status, String gate, String baggageAllowance, String flightType) {
        this.flightNumber = flightNumber;
        this.airlineName = airlineName;
        this.aircraft = aircraft;
        this.sourceAirport = sourceAirport;
        this.destinationAirport = destinationAirport;
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.durationMinutes = durationMinutes;
        this.economyFare = economyFare;
        this.businessFare = businessFare;
        this.status = status;
        this.gate = gate;
        this.baggageAllowance = baggageAllowance;
        this.flightType = flightType != null ? flightType : "DOMESTIC";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFlightNumber() {
        return flightNumber;
    }

    public void setFlightNumber(String flightNumber) {
        this.flightNumber = flightNumber;
    }

    public String getAirlineName() {
        return airlineName;
    }

    public void setAirlineName(String airlineName) {
        this.airlineName = airlineName;
    }

    public Aircraft getAircraft() {
        return aircraft;
    }

    public void setAircraft(Aircraft aircraft) {
        this.aircraft = aircraft;
    }

    public String getSourceAirport() {
        return sourceAirport;
    }

    public void setSourceAirport(String sourceAirport) {
        this.sourceAirport = sourceAirport;
    }

    public String getDestinationAirport() {
        return destinationAirport;
    }

    public void setDestinationAirport(String destinationAirport) {
        this.destinationAirport = destinationAirport;
    }

    public String getSourceCity() {
        return sourceCity;
    }

    public void setSourceCity(String sourceCity) {
        this.sourceCity = sourceCity;
    }

    public String getDestinationCity() {
        return destinationCity;
    }

    public void setDestinationCity(String destinationCity) {
        this.destinationCity = destinationCity;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getEconomyFare() {
        return economyFare;
    }

    public void setEconomyFare(Double economyFare) {
        this.economyFare = economyFare;
    }

    public Double getBusinessFare() {
        return businessFare;
    }

    public void setBusinessFare(Double businessFare) {
        this.businessFare = businessFare;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }

    public String getBaggageAllowance() {
        return baggageAllowance;
    }

    public void setBaggageAllowance(String baggageAllowance) {
        this.baggageAllowance = baggageAllowance;
    }

    public String getFlightType() {
        return flightType;
    }

    public void setFlightType(String flightType) {
        this.flightType = flightType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
