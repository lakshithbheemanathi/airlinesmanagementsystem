package com.skywings.airline.dto.response;

public class SeatResponse {

    private Long id;
    private String seatNumber;
    private String seatClass;
    private Boolean isBooked;
    private Integer rowNumber;
    private String columnLetter;
    private Double price;

    public SeatResponse() {
    }

    public SeatResponse(Long id, String seatNumber, String seatClass, Boolean isBooked, Integer rowNumber, String columnLetter, Double price) {
        this.id = id;
        this.seatNumber = seatNumber;
        this.seatClass = seatClass;
        this.isBooked = isBooked;
        this.rowNumber = rowNumber;
        this.columnLetter = columnLetter;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatClass() {
        return seatClass;
    }

    public void setSeatClass(String seatClass) {
        this.seatClass = seatClass;
    }

    public Boolean getIsBooked() {
        return isBooked;
    }

    public void setIsBooked(Boolean booked) {
        isBooked = booked;
    }

    public Integer getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(Integer rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getColumnLetter() {
        return columnLetter;
    }

    public void setColumnLetter(String columnLetter) {
        this.columnLetter = columnLetter;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
