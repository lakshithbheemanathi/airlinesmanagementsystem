package com.skywings.airline.entity;

import jakarta.persistence.*;

/**
 * Aircraft entity representing commercial fleet aircraft specifications.
 */
@Entity
@Table(name = "aircraft")
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "registration_no", nullable = false, unique = true, length = 50)
    private String registrationNo;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "economy_seats", nullable = false)
    private Integer economySeats;

    @Column(name = "business_seats", nullable = false)
    private Integer businessSeats;

    public Aircraft() {
    }

    public Aircraft(String modelName, String registrationNo, Integer totalSeats, Integer economySeats, Integer businessSeats) {
        this.modelName = modelName;
        this.registrationNo = registrationNo;
        this.totalSeats = totalSeats;
        this.economySeats = economySeats;
        this.businessSeats = businessSeats;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getEconomySeats() {
        return economySeats;
    }

    public void setEconomySeats(Integer economySeats) {
        this.economySeats = economySeats;
    }

    public Integer getBusinessSeats() {
        return businessSeats;
    }

    public void setBusinessSeats(Integer businessSeats) {
        this.businessSeats = businessSeats;
    }
}
