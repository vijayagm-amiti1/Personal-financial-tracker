package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.Account;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findAllByUserId(UUID userId);

    List<Account> findAllByUserIdAndIsActiveTrue(UUID userId);

    Optional<Account> findByIdAndUserId(UUID id, UUID userId);

    Optional<Account> findByIdAndUserIdAndIsActiveTrue(UUID id, UUID userId);

    @Query("""
            select distinct a
            from Account a
            left join AccountMember am on am.account = a
            where a.isActive = true
              and (a.user.id = :userId or am.user.id = :userId)
            order by a.createdAt desc
            """)
    List<Account> findAllAccessibleByUserId(@Param("userId") UUID userId);

    @Query("""
            select distinct a
            from Account a
            left join AccountMember am on am.account = a
            where a.id = :accountId
              and a.isActive = true
              and (a.user.id = :userId or am.user.id = :userId)
            """)
    Optional<Account> findAccessibleByIdAndUserId(@Param("accountId") UUID accountId, @Param("userId") UUID userId);
}
