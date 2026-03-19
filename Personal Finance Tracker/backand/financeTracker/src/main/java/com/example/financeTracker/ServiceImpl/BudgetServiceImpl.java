package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.BudgetRequest;
import com.example.financeTracker.DTO.ResponseDTO.BudgetResponse;
import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.BudgetRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.BudgetService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
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
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    @Override
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, UUID userId) {
        User user = getRequiredUser(userId);
        Category category = getRequiredCategory(request.getCategoryId(), userId);
        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                        userId, request.getCategoryId(), request.getMonth(), request.getYear())
                .ifPresent(existingBudget -> {
                    throw new BadRequestException("This category budget is already set for the selected month");
                });

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .build();

        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setAmount(request.getAmount());
        budget.setCurrentSpent(calculateCurrentSpentForBudget(userId, request.getCategoryId(), request.getMonth(), request.getYear()));
        budget.setAlertThresholdPercent(request.getAlertThresholdPercent() != null ? request.getAlertThresholdPercent() : 80);

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Saved budget {} for user {} and category {}", savedBudget.getId(), userId, request.getCategoryId());
        return mapToResponse(savedBudget);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(UUID budgetId, BudgetRequest request, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found for this user"));
        Category category = getRequiredCategory(request.getCategoryId(), userId);
        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, request.getCategoryId(), request.getMonth(), request.getYear())
                .filter(existingBudget -> !existingBudget.getId().equals(budgetId))
                .ifPresent(existingBudget -> {
                    throw new BadRequestException("This category budget is already set for the selected month");
                });

        budget.setCategory(category);
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setAmount(request.getAmount());
        budget.setCurrentSpent(calculateCurrentSpentForBudget(userId, request.getCategoryId(), request.getMonth(), request.getYear()));
        budget.setAlertThresholdPercent(request.getAlertThresholdPercent() != null ? request.getAlertThresholdPercent() : 80);

        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Updated budget {} for user {}", updatedBudget.getId(), userId);
        return mapToResponse(updatedBudget);
    }

    @Override
    @Transactional
    public Budget saveBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    @Override
    public List<BudgetResponse> getBudgetResponsesByUserId(UUID userId) {
        List<Budget> budgets = budgetRepository.findAllByUserId(userId);
        List<BudgetResponse> responses = new ArrayList<>();
        for (Budget budget : budgets) {
            responses.add(mapToResponse(budget));
        }
        return responses;
    }

    @Override
    public BudgetResponse getBudgetResponseById(UUID budgetId, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found for this user"));
        return mapToResponse(budget);
    }

    @Override
    public List<Budget> getBudgetsByUserId(UUID userId) {
        return budgetRepository.findAllByUserId(userId);
    }

    @Override
    public Optional<Budget> getBudgetByIdAndUserId(UUID budgetId, UUID userId) {
        return budgetRepository.findByIdAndUserId(budgetId, userId);
    }

    @Override
    public Optional<Budget> getBudgetByCategoryAndPeriod(UUID userId, UUID categoryId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year);
    }

    @Override
    @Transactional
    public List<BudgetResponse> copyPreviousMonthBudgets(UUID userId, Integer month, Integer year) {
        getRequiredUser(userId);
        YearMonth targetPeriod = YearMonth.of(year, month);

        if (!budgetRepository.findAllByUserIdAndMonthAndYear(userId, month, year).isEmpty()) {
            throw new BadRequestException("Budgets already exist for the selected month");
        }

        YearMonth previousPeriod = targetPeriod.minusMonths(1);
        List<Budget> previousBudgets = budgetRepository.findAllByUserIdAndMonthAndYear(
                userId, previousPeriod.getMonthValue(), previousPeriod.getYear());

        if (previousBudgets.isEmpty()) {
            throw new ResourceNotFoundException("No budgets found in the previous month to copy");
        }

        List<BudgetResponse> copiedResponses = new ArrayList<>();
        for (Budget previousBudget : previousBudgets) {
            Budget copiedBudget = Budget.builder()
                    .user(previousBudget.getUser())
                    .category(previousBudget.getCategory())
                    .month(month)
                    .year(year)
                    .amount(previousBudget.getAmount())
                    .alertThresholdPercent(previousBudget.getAlertThresholdPercent())
                    .build();
            copiedResponses.add(mapToResponse(budgetRepository.save(copiedBudget)));
        }

        log.info("Copied {} budgets for user {} into month {}, year {}",
                copiedResponses.size(), userId, month, year);
        return copiedResponses;
    }

    @Override
    @Transactional
    public void deleteBudget(UUID budgetId, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found for this user"));
        budgetRepository.delete(budget);
        log.info("Deleted budget {} for user {}", budgetId, userId);
    }

    private User getRequiredUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Category getRequiredCategory(UUID categoryId, UUID userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this user"));
    }

    private BudgetResponse mapToResponse(Budget budget) {
        BigDecimal actualCurrentSpent = calculateCurrentSpentForBudget(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                budget.getMonth(),
                budget.getYear());
        BigDecimal storedCurrentSpent = budget.getCurrentSpent() != null ? budget.getCurrentSpent() : BigDecimal.ZERO;

        if (storedCurrentSpent.compareTo(actualCurrentSpent) != 0) {
            budget.setCurrentSpent(actualCurrentSpent);
            budgetRepository.save(budget);
        }

        BigDecimal currentSpent = actualCurrentSpent;
        BigDecimal remainingAmount = budget.getAmount().subtract(currentSpent);
        double spentPercent = budget.getAmount().signum() == 0
                ? 0.0
                : currentSpent.multiply(BigDecimal.valueOf(100))
                        .divide(budget.getAmount(), 2, java.math.RoundingMode.HALF_UP)
                        .doubleValue();

        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUser() != null ? budget.getUser().getId() : null)
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : null)
                .categoryColor(budget.getCategory() != null ? budget.getCategory().getColor() : null)
                .categoryIcon(budget.getCategory() != null ? budget.getCategory().getIcon() : null)
                .month(budget.getMonth())
                .year(budget.getYear())
                .amount(budget.getAmount())
                .currentSpent(currentSpent)
                .spentAmount(currentSpent)
                .remainingAmount(remainingAmount)
                .spentPercent(spentPercent)
                .alertThresholdPercent(budget.getAlertThresholdPercent())
                .build();
    }

    private BigDecimal calculateCurrentSpentForBudget(UUID userId, UUID categoryId, Integer month, Integer year) {
        YearMonth period = YearMonth.of(year, month);
        LocalDate startDate = period.atDay(1);
        LocalDate endDate = period.atEndOfMonth();
        List<Transaction> transactions = transactionRepository
                .findAllByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);

        BigDecimal spentAmount = BigDecimal.ZERO;
        for (Transaction transaction : transactions) {
            if (!"expense".equalsIgnoreCase(transaction.getType())) {
                continue;
            }
            if (transaction.getCategory() == null || transaction.getCategory().getId() == null) {
                continue;
            }
            if (!categoryId.equals(transaction.getCategory().getId())) {
                continue;
            }
            spentAmount = spentAmount.add(transaction.getAmount());
        }
        return spentAmount;
    }
}
