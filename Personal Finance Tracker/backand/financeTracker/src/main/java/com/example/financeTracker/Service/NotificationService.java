package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    List<NotificationResponse> getNotificationsByUserId(UUID userId);

    NotificationResponse getNotificationById(UUID notificationId, UUID userId);

    NotificationResponse markNotificationAsRead(UUID notificationId, UUID userId);

    void markAllNotificationsAsRead(UUID userId);

    void deleteNotification(UUID notificationId, UUID userId);

    void deleteAllNotificationsByUserId(UUID userId);
}
