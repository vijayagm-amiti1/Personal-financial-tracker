package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.GoalContributionRequest;
import com.example.financeTracker.DTO.RequestDTO.GoalRequest;
import com.example.financeTracker.DTO.ResponseDTO.GoalResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.GoalRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.GoalService;
import java.time.LocalDate;
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
public class GoalServiceImpl implements GoalService {

    private static final String GOAL_CONTRIBUTION_TYPE = "goal_contribution";
    private static final String GOAL_FUNDING_CATEGORY_NAME = "Goal Funding";

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public GoalResponse createGoal(GoalRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Account linkedAccount = accountRepository.findByIdAndUserId(request.getLinkedAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Linked account not found for this user"));
        goalRepository.findByUserIdAndNameIgnoreCase(userId, request.getName().trim())
                .ifPresent(existingGoal -> {
                    throw new BadRequestException("A goal with this name already exists for this user");
                });

        Goal goal = Goal.builder()
                .user(user)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : java.math.BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .linkedAccount(linkedAccount)
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "active")
                .build();

        Goal savedGoal = goalRepository.save(goal);
        log.info("Created goal {} for user {}", savedGoal.getId(), userId);
        return mapToResponse(savedGoal);
    }

    @Override
    @Transactional
    public GoalResponse contributeToGoal(GoalContributionRequest request, UUID userId) {
        Goal goal = goalRepository.findByIdAndUserId(request.getGoalId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found for this user"));
        Account sourceAccount = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));
        Account linkedAccount = goal.getLinkedAccount();

        if (sourceAccount.getCurrentBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance in account");
        }

        boolean sameAccountTransfer = linkedAccount != null && linkedAccount.getId().equals(sourceAccount.getId());
        if (!sameAccountTransfer) {
            sourceAccount.setCurrentBalance(sourceAccount.getCurrentBalance().subtract(request.getAmount()));
            linkedAccount.setCurrentBalance(linkedAccount.getCurrentBalance().add(request.getAmount()));
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("completed");
        }

        accountRepository.save(sourceAccount);
        if (!sameAccountTransfer) {
            accountRepository.save(linkedAccount);
        }
        transactionRepository.save(buildGoalContributionTransaction(goal, sourceAccount, request.getAmount()));
        Goal updatedGoal = goalRepository.save(goal);
        log.info("Contributed {} to goal {} for user {}", request.getAmount(), request.getGoalId(), userId);
        return mapToResponse(updatedGoal);
    }

    @Override
    @Transactional
    public Goal saveGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    @Override
    public List<Goal> getGoalsByUserId(UUID userId) {
        return goalRepository.findAllByUserId(userId);
    }

    @Override
    public Optional<Goal> getGoalByIdAndUserId(UUID goalId, UUID userId) {
        return goalRepository.findByIdAndUserId(goalId, userId);
    }

    @Override
    @Transactional
    public void deleteGoal(UUID goalId, UUID userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found for this user"));

        List<Transaction> goalContributionTransactions = transactionRepository
                .findAllByGoalIdAndUserIdOrderByTransactionDateDesc(goalId, userId);

        for (Transaction goalContributionTransaction : goalContributionTransactions) {
            Account sourceAccount = goalContributionTransaction.getAccount();
            Account linkedAccount = goalContributionTransaction.getToAccount();
            if (sourceAccount != null && linkedAccount != null && !sourceAccount.getId().equals(linkedAccount.getId())) {
                sourceAccount.setCurrentBalance(
                        sourceAccount.getCurrentBalance().add(goalContributionTransaction.getAmount()));
                accountRepository.save(sourceAccount);
                linkedAccount.setCurrentBalance(
                        linkedAccount.getCurrentBalance().subtract(goalContributionTransaction.getAmount()));
                accountRepository.save(linkedAccount);
            }
        }

        if (!goalContributionTransactions.isEmpty()) {
            transactionRepository.deleteAll(goalContributionTransactions);
        }

        goalRepository.delete(goal);
        log.info("Deleted goal {} for user {}", goalId, userId);
    }

    private GoalResponse mapToResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser() != null ? goal.getUser().getId() : null)
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .linkedAccountId(goal.getLinkedAccount() != null ? goal.getLinkedAccount().getId() : null)
                .status(goal.getStatus())
                .build();
    }

    private Transaction buildGoalContributionTransaction(Goal goal, Account account, java.math.BigDecimal amount) {
        User user = goal.getUser();
        Category goalFundingCategory = categoryRepository
                .findByUserIdAndNameIgnoreCase(user.getId(), GOAL_FUNDING_CATEGORY_NAME)
                .orElse(null);

        return Transaction.builder()
                .user(user)
                .account(account)
                .toAccount(goal.getLinkedAccount())
                .category(goalFundingCategory)
                .goal(goal)
                .type(GOAL_CONTRIBUTION_TYPE)
                .amount(amount)
                .transactionDate(LocalDate.now())
                .merchant(goal.getName())
                .note("Goal contribution from " + account.getName())
                .paymentMethod("goal_contribution")
                .build();
    }
}
