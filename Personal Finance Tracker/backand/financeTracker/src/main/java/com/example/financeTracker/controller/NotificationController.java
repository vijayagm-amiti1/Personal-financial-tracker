package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.ResponseDTO.NotificationResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.NotificationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAllNotificationsByUserId(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get all notifications request for user {}", userId);
        List<NotificationResponse> responses = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable UUID notificationId,
                                                                    Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get notification request for user {} and notification {}", userId, notificationId);
        NotificationResponse response = notificationService.getNotificationById(notificationId, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(@PathVariable UUID notificationId,
                                                                       Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received mark notification as read request for user {} and notification {}", userId, notificationId);
        NotificationResponse response = notificationService.markNotificationAsRead(notificationId, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received mark all notifications as read request for user {}", userId);
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID notificationId,
                                                   Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete notification request for user {} and notification {}", userId, notificationId);
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotificationsByUserId(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete all notifications request for user {}", userId);
        notificationService.deleteAllNotificationsByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}
