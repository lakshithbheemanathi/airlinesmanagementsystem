package com.skywings.airline.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PassengerRequest {

    @NotBlank(message = "Passenger full name is required")
    private String fullName;

    private String dateOfBirth;
    private String gender = "OTHER";
    private String passportNumber;
    private String email;
    private String phone;

    @NotBlank(message = "Assigned seat number is required")
    private String seatNumber;

    public PassengerRequest() {
    }

    public PassengerRequest(String fullName, String dateOfBirth, String gender, String passportNumber, String email, String phone, String seatNumber) {
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.passportNumber = passportNumber;
        this.email = email;
        this.phone = phone;
        this.seatNumber = seatNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPassportNumber() {
        return passportNumber;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }
}
