package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Service.AccountService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public Account saveAccount(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findAllByUserId(userId);
    }

    @Override
    public Optional<Account> getAccountByIdAndUserId(UUID accountId, UUID userId) {
        return accountRepository.findByIdAndUserId(accountId, userId);
    }

    @Override
    @Transactional
    public void deleteAccount(UUID accountId, UUID userId) {
        accountRepository.findByIdAndUserId(accountId, userId)
                .ifPresent(accountRepository::delete);
    }
}
