package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.PasswordResetToken;
import com.example.financeTracker.Entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByIdAndUser(UUID id, User user);

    void deleteByUser(User user);
}
