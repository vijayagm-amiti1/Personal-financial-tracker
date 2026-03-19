package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.NotificationResponse;
import com.example.financeTracker.Entity.Notification;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.NotificationRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import com.example.financeTracker.Service.NotificationService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationResponse> getNotificationsByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        List<NotificationResponse> responses = new ArrayList<>();
        for (Notification notification : notifications) {
            responses.add(mapToResponse(notification));
        }
        return responses;
    }

    @Override
    public NotificationResponse getNotificationById(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found for this user"));
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse markNotificationAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found for this user"));
        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        log.info("Marked notification {} as read for user {}", notificationId, userId);
        return mapToResponse(updatedNotification);
    }

    @Override
    @Transactional
    public void markAllNotificationsAsRead(UUID userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
        log.info("Marked all notifications as read for user {}", userId);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found for this user"));
        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    @Override
    @Transactional
    public void deleteAllNotificationsByUserId(UUID userId) {
        notificationRepository.deleteAllByUserId(userId);
        log.info("Deleted all notifications for user {}", userId);
    }

    @Override
    @Transactional
    public NotificationResponse createNotification(UUID userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification savedNotification = notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build());
        log.info("Created {} notification {} for user {}", type, savedNotification.getId(), userId);
        return mapToResponse(savedNotification);
    }

    @Override
    @Transactional
    public void createNotificationIfAbsent(UUID userId, String title, String message, NotificationType type) {
        if (notificationRepository.existsByUserIdAndTitle(userId, title)) {
            log.info("Skipping notification for user {} because title already exists: {}", userId, title);
            return;
        }
        createNotification(userId, title, message, type);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
