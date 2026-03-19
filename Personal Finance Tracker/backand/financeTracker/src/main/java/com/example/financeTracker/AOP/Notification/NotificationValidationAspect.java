package com.example.financeTracker.AOP.Notification;

import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.NotificationRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationValidationAspect {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Before("(execution(* com.example.financeTracker.Service.NotificationService.getNotificationsByUserId(..)) && args(userId))"
            + " || (execution(* com.example.financeTracker.Service.NotificationService.markAllNotificationsAsRead(..)) && args(userId))"
            + " || (execution(* com.example.financeTracker.Service.NotificationService.deleteAllNotificationsByUserId(..)) && args(userId))")
    public void validateUserScopedNotificationOperations(JoinPoint joinPoint, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        log.debug("Validated notification user-scoped request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("(execution(* com.example.financeTracker.Service.NotificationService.getNotificationById(..)) && args(notificationId, userId))"
            + " || (execution(* com.example.financeTracker.Service.NotificationService.markNotificationAsRead(..)) && args(notificationId, userId))"
            + " || (execution(* com.example.financeTracker.Service.NotificationService.deleteNotification(..)) && args(notificationId, userId))")
    public void validateNotificationOperations(JoinPoint joinPoint, UUID notificationId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (notificationId == null) {
            throw new BadRequestException("notificationId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (notificationRepository.findByIdAndUserId(notificationId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }
        log.debug("Validated notification request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
