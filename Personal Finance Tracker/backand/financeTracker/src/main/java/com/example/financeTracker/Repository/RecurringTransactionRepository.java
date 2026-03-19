package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.RecurringTransaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    List<RecurringTransaction> findAllByUserId(UUID userId);

    List<RecurringTransaction> findAllByNextRunDateLessThanEqual(LocalDate nextRunDate);

    Optional<RecurringTransaction> findByIdAndUserId(UUID id, UUID userId);

    List<RecurringTransaction> findAllByUserIdAndAccountId(UUID userId, UUID accountId);
}
