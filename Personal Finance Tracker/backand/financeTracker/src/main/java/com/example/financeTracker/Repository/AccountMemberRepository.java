package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.AccountMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountMemberRepository extends JpaRepository<AccountMember, UUID> {

    List<AccountMember> findAllByAccountIdOrderByCreatedAtAsc(UUID accountId);

    List<AccountMember> findAllByUserId(UUID userId);

    Optional<AccountMember> findByAccountIdAndUserId(UUID accountId, UUID userId);

    boolean existsByAccountIdAndUserId(UUID accountId, UUID userId);

    long countByAccountId(UUID accountId);
}
