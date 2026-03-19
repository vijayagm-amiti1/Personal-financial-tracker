package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Notification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID notificationId, UUID userId);

    boolean existsByUserIdAndTypeAndTitle(UUID userId, com.example.financeTracker.Entity.NotificationType type, String title);

    boolean existsByUserIdAndTitle(UUID userId, String title);

    void deleteAllByUserId(UUID userId);
}
