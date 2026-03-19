package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.NotificationResponse;
import com.example.financeTracker.Entity.NotificationType;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    List<NotificationResponse> getNotificationsByUserId(UUID userId);

    NotificationResponse getNotificationById(UUID notificationId, UUID userId);

    NotificationResponse markNotificationAsRead(UUID notificationId, UUID userId);

    void markAllNotificationsAsRead(UUID userId);

    void deleteNotification(UUID notificationId, UUID userId);

    void deleteAllNotificationsByUserId(UUID userId);

    NotificationResponse createNotification(UUID userId, String title, String message, NotificationType type);

    void createNotificationIfAbsent(UUID userId, String title, String message, NotificationType type);
}
