package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Transaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findAllByUserIdOrderByTransactionDateDesc(UUID userId);

    List<Transaction> findAllByUserIdAndAccountIsActiveTrueOrderByTransactionDateDesc(UUID userId);

    List<Transaction> findAllByAccountIdAndUserIdOrderByTransactionDateDesc(UUID accountId, UUID userId);

    List<Transaction> findAllByAccountIdAndUserIdAndAccountIsActiveTrueOrderByTransactionDateDesc(UUID accountId, UUID userId);

    List<Transaction> findAllByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            UUID userId, LocalDate startDate, LocalDate endDate);

    List<Transaction> findAllByUserIdAndAccountIsActiveTrueAndTransactionDateBetweenOrderByTransactionDateDesc(
            UUID userId, LocalDate startDate, LocalDate endDate);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    Optional<Transaction> findByIdAndUserIdAndAccountIsActiveTrue(UUID id, UUID userId);

    List<Transaction> findAllByGoalIdAndUserIdOrderByTransactionDateDesc(UUID goalId, UUID userId);
}
