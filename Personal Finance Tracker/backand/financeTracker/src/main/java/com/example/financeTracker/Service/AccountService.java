package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.Account;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountService {

    Account saveAccount(Account account);

    List<Account> getAccountsByUserId(UUID userId);

    Optional<Account> getAccountByIdAndUserId(UUID accountId, UUID userId);

    void deleteAccount(UUID accountId, UUID userId);
}
