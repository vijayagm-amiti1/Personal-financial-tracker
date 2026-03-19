package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.PendingSignup;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingSignupRepository extends JpaRepository<PendingSignup, UUID> {

    Optional<PendingSignup> findByEmail(String email);

    void deleteByEmail(String email);
}
