package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.AccountRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.AccountMember;
import com.example.financeTracker.Entity.AccountMemberRole;
import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountMemberRepository;
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
    private final AccountMemberRepository accountMemberRepository;
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

        accountMemberRepository.save(AccountMember.builder()
                .account(savedAccount)
                .user(user)
                .role(AccountMemberRole.OWNER)
                .build());

        notificationService.createNotification(
                userId,
                "Account created: " + savedAccount.getName(),
                String.format("%s account was created with opening balance %s.",
                        savedAccount.getName(),
                        savedAccount.getOpeningBalance()),
                NotificationType.SYSTEM_UPDATE);

        return mapToResponse(savedAccount, userId);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(UUID accountId, AccountRequest request, UUID userId) {
        Account account = accountRepository.findAccessibleByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));

        AccountMemberRole accessRole = resolveRole(account, userId);
        if (accessRole == AccountMemberRole.VIEWER) {
            throw new ResourceNotFoundException("Account not found for this user");
        }

        account.setName(request.getName().trim());
        account.setType(request.getType().trim());
        account.setInstitutionName(request.getInstitutionName());

        return mapToResponse(accountRepository.save(account), userId);
    }

    @Override
    @Transactional
    public Account saveAccount(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public List<AccountResponse> getAccountResponsesByUserId(UUID userId) {
        return accountRepository.findAllAccessibleByUserId(userId).stream()
                .map(account -> mapToResponse(account, userId))
                .toList();
    }

    @Override
    public AccountResponse getAccountResponseById(UUID accountId, UUID userId) {
        Account account = accountRepository.findAccessibleByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));
        return mapToResponse(account, userId);
    }

    @Override
    public List<Account> getAccountsByUserId(UUID userId) {
        return accountRepository.findAllAccessibleByUserId(userId);
    }

    @Override
    public Optional<Account> getAccountByIdAndUserId(UUID accountId, UUID userId) {
        return accountRepository.findAccessibleByIdAndUserId(accountId, userId);
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

    private AccountResponse mapToResponse(Account account, UUID userId) {
        List<AccountMember> members = accountMemberRepository.findAllByAccountIdOrderByCreatedAtAsc(account.getId());
        long sharedMemberCount = members.stream()
                .map(member -> member.getUser().getId())
                .distinct()
                .count();
        if (account.getUser() != null && members.stream().noneMatch(member -> member.getUser().getId().equals(account.getUser().getId()))) {
            sharedMemberCount += 1;
        }

        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUser() != null ? account.getUser().getId() : null)
                .name(account.getName())
                .type(account.getType())
                .openingBalance(account.getOpeningBalance())
                .currentBalance(account.getCurrentBalance())
                .institutionName(account.getInstitutionName())
                .isActive(account.getIsActive())
                .accessRole(resolveRole(account, userId))
                .sharedMemberCount(sharedMemberCount)
                .ownerDisplayName(account.getUser() != null ? account.getUser().getDisplayName() : null)
                .createdAt(account.getCreatedAt())
                .build();
    }

    private AccountMemberRole resolveRole(Account account, UUID userId) {
        if (account.getUser() != null && account.getUser().getId().equals(userId)) {
            return AccountMemberRole.OWNER;
        }
        return accountMemberRepository.findByAccountIdAndUserId(account.getId(), userId)
                .map(AccountMember::getRole)
                .orElse(AccountMemberRole.VIEWER);
    }
}
