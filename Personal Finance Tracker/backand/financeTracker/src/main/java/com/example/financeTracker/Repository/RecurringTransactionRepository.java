package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.RecurringTransaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    List<RecurringTransaction> findAllByUserId(UUID userId);

    List<RecurringTransaction> findAllByNextRunDateLessThanEqual(LocalDate nextRunDate);

    Optional<RecurringTransaction> findByIdAndUserId(UUID id, UUID userId);

    List<RecurringTransaction> findAllByUserIdAndAccountId(UUID userId, UUID accountId);

    @Query("""
            select distinct r
            from RecurringTransaction r
            left join AccountMember am on am.account = r.account
            where r.account.isActive = true
              and (r.account.user.id = :userId or am.user.id = :userId)
            order by r.nextRunDate asc
            """)
    List<RecurringTransaction> findAllAccessibleByUserId(@Param("userId") UUID userId);
}
