package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Transaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select distinct t
            from Transaction t
            where (
                    t.account.id in (
                        select a.id
                        from Account a
                        where a.isActive = true
                          and a.user.id = :userId
                    )
                    or t.account.id in (
                        select am.account.id
                        from AccountMember am
                        where am.user.id = :userId
                          and am.account.isActive = true
                    )
                    or (
                        t.toAccount is not null
                        and t.toAccount.id in (
                            select a.id
                            from Account a
                            where a.isActive = true
                              and a.user.id = :userId
                        )
                    )
                    or (
                        t.toAccount is not null
                        and t.toAccount.id in (
                            select am.account.id
                            from AccountMember am
                            where am.user.id = :userId
                              and am.account.isActive = true
                        )
                    )
                )
            order by t.transactionDate desc, t.createdAt desc
            """)
    List<Transaction> findAllAccessibleByUserIdOrderByTransactionDateDesc(@Param("userId") UUID userId);

    @Query("""
            select distinct t
            from Transaction t
            where t.transactionDate between :startDate and :endDate
              and (
                    t.account.id in (
                        select a.id
                        from Account a
                        where a.isActive = true
                          and a.user.id = :userId
                    )
                    or t.account.id in (
                        select am.account.id
                        from AccountMember am
                        where am.user.id = :userId
                          and am.account.isActive = true
                    )
                    or (
                        t.toAccount is not null
                        and t.toAccount.id in (
                            select a.id
                            from Account a
                            where a.isActive = true
                              and a.user.id = :userId
                        )
                    )
                    or (
                        t.toAccount is not null
                        and t.toAccount.id in (
                            select am.account.id
                            from AccountMember am
                            where am.user.id = :userId
                              and am.account.isActive = true
                        )
                    )
                )
            order by t.transactionDate desc, t.createdAt desc
            """)
    List<Transaction> findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Transaction> findAllByAccountIdOrToAccountIdAndAccountIsActiveTrueOrderByTransactionDateDesc(UUID accountId, UUID toAccountId);
}
