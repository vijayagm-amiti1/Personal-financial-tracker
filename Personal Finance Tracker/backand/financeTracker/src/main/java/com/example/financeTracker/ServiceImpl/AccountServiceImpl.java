package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.AccountRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.GoalRepository;
import com.example.financeTracker.Repository.RecurringTransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AccountService;
import com.example.financeTracker.Service.GoalService;
import com.example.financeTracker.Service.NotificationService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final GoalRepository goalRepository;
    private final GoalService goalService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AccountResponse createAccount(AccountRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account savedAccount = accountRepository.save(Account.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType().trim())
                .openingBalance(request.getOpeningBalance())
                .currentBalance(request.getOpeningBalance())
                .institutionName(request.getInstitutionName())
                .isActive(true)
                .build());

        notificationService.createNotification(
                userId,
                "Account created: " + savedAccount.getName(),
                String.format("%s account was created with opening balance %s.",
                        savedAccount.getName(),
                        savedAccount.getOpeningBalance()),
                NotificationType.SYSTEM_UPDATE);

        return mapToResponse(savedAccount);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(UUID accountId, AccountRequest request, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));

        account.setName(request.getName().trim());
        account.setType(request.getType().trim());
        account.setInstitutionName(request.getInstitutionName());

        return mapToResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public Account saveAccount(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public List<AccountResponse> getAccountResponsesByUserId(UUID userId) {
        return accountRepository.findAllByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
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
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));

        recurringTransactionRepository.findAllByUserIdAndAccountId(userId, accountId)
                .forEach(recurringTransactionRepository::delete);

        List<Goal> linkedGoals = goalRepository.findAllByUserIdAndLinkedAccountId(userId, accountId);
        for (Goal goal : linkedGoals) {
            goalService.deleteGoal(goal.getId(), userId);
        }

        account.setIsActive(false);
        accountRepository.save(account);
        log.info("Deactivated account {} for user {}", accountId, userId);
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUser() != null ? account.getUser().getId() : null)
                .name(account.getName())
                .type(account.getType())
                .openingBalance(account.getOpeningBalance())
                .currentBalance(account.getCurrentBalance())
                .institutionName(account.getInstitutionName())
                .isActive(account.getIsActive())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
