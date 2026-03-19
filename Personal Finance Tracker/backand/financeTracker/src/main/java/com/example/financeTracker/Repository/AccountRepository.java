package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Account;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findAllByUserId(UUID userId);

    List<Account> findAllByUserIdAndIsActiveTrue(UUID userId);

    Optional<Account> findByIdAndUserId(UUID id, UUID userId);

    Optional<Account> findByIdAndUserIdAndIsActiveTrue(UUID id, UUID userId);
}
