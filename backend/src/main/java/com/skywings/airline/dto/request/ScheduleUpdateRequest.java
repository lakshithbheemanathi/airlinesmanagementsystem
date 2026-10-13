package com.skywings.airline.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.skywings.airline.config.FlexibleLocalDateTimeDeserializer;
import java.time.LocalDateTime;

public class ScheduleUpdateRequest {

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime departureTime;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime arrivalTime;
    private String gate;
    private String status; // SCHEDULED, DELAYED, BOARDING, DEPARTED, CANCELLED
    private String broadcastMessage;

    public ScheduleUpdateRequest() {
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

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBroadcastMessage() {
        return broadcastMessage;
    }

    public void setBroadcastMessage(String broadcastMessage) {
        this.broadcastMessage = broadcastMessage;
    }
}
