package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.AccountRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountResponse;
import com.example.financeTracker.Entity.Account;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountService {

    AccountResponse createAccount(AccountRequest request, UUID userId);

    AccountResponse updateAccount(UUID accountId, AccountRequest request, UUID userId);

    Account saveAccount(Account account);

    List<AccountResponse> getAccountResponsesByUserId(UUID userId);

    List<Account> getAccountsByUserId(UUID userId);

    Optional<Account> getAccountByIdAndUserId(UUID accountId, UUID userId);

    void deleteAccount(UUID accountId, UUID userId);
}
