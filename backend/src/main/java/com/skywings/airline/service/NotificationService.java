package com.skywings.airline.service;

import com.skywings.airline.dto.request.BroadcastRequest;
import com.skywings.airline.dto.request.ScheduleUpdateRequest;
import com.skywings.airline.dto.response.FlightResponse;
import com.skywings.airline.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getUserNotifications(Long userId);

    long getUnreadCount(Long userId);

    NotificationResponse markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    FlightResponse updateFlightSchedule(Long flightId, ScheduleUpdateRequest request);

    NotificationResponse broadcastNotification(BroadcastRequest request);

    List<NotificationResponse> getAllNotifications();
}
