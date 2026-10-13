package com.skywings.airline.controller;

import com.skywings.airline.dto.request.BroadcastRequest;
import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.NotificationResponse;
import com.skywings.airline.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<NotificationResponse>> broadcastNotification(
            @Valid @RequestBody BroadcastRequest request) {
        NotificationResponse response = notificationService.broadcastNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Operational alert broadcast successfully to passengers", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications() {
        List<NotificationResponse> list = notificationService.getAllNotifications();
        return ResponseEntity.ok(ApiResponse.ok("All airline notification logs retrieved", list));
    }
}
