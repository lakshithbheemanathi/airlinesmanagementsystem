package com.skywings.airline.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BroadcastRequest {

    private Long flightId; // Optional: target flight, null for system-wide broadcast

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message content is required")
    private String message;

    private String type; // OPERATIONAL_ALERT, WEATHER_ADVISORY, SYSTEM_UPDATE, etc.

    public BroadcastRequest() {
    }

    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
