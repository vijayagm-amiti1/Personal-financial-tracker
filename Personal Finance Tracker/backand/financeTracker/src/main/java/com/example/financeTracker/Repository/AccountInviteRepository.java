package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.AccountInvite;
import com.example.financeTracker.Entity.AccountInviteStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountInviteRepository extends JpaRepository<AccountInvite, UUID> {

    Optional<AccountInvite> findByToken(String token);

    boolean existsByAccountIdAndRecipientEmailIgnoreCaseAndStatus(UUID accountId,
                                                                  String recipientEmail,
                                                                  AccountInviteStatus status);
}
