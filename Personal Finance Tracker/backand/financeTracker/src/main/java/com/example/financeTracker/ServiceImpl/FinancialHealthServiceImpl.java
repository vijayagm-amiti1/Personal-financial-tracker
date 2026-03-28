package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.FinancialHealthComponentDTO;
import com.example.financeTracker.DTO.ResponseDTO.FinancialHealthScoreResponseDTO;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.BudgetRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.FinancialHealthService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FinancialHealthServiceImpl implements FinancialHealthService {

    private static final int LOOKBACK_MONTHS = 6;
    private static final int SAVINGS_WEIGHT = 30;
    private static final int BUDGET_WEIGHT = 30;
    private static final int CASH_BUFFER_WEIGHT = 25;
    private static final int STABILITY_WEIGHT = 15;
    private static final BigDecimal THREE = new BigDecimal("3");

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AccountRepository accountRepository;

    @Override
    public FinancialHealthScoreResponseDTO getFinancialHealthScore(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate today = LocalDate.now();
        LocalDate startDate = resolveStartDate(user, today);

        List<Transaction> transactions = transactionRepository
                .findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        userId,
                        startDate,
                        today);

        YearMonth currentMonth = YearMonth.from(today);
        List<Budget> currentBudgets = budgetRepository.findAllByUserIdAndMonthAndYear(
                userId,
                currentMonth.getMonthValue(),
                currentMonth.getYear());

        List<Account> activeAccounts = accountRepository.findAllAccessibleByUserId(userId);
        BigDecimal currentBalance = activeAccounts.stream()
                .map(account -> account.getCurrentBalance() != null ? account.getCurrentBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<YearMonth, MonthlyTotals> monthlyTotals = buildMonthlyTotals(startDate, today, transactions);
        BigDecimal averageMonthlyExpense = calculateAverageMonthlyExpense(monthlyTotals);
        BigDecimal currentMonthIncome = monthlyTotals.getOrDefault(currentMonth, MonthlyTotals.empty()).income;
        BigDecimal currentMonthExpense = monthlyTotals.getOrDefault(currentMonth, MonthlyTotals.empty()).expense;

        ComponentScore savingsRate = buildSavingsRateScore(currentMonthIncome, currentMonthExpense);
        ComponentScore budgetAdherence = buildBudgetAdherenceScore(currentBudgets);
        ComponentScore cashBuffer = buildCashBufferScore(currentBalance, averageMonthlyExpense);
        ComponentScore expenseStability = buildExpenseStabilityScore(monthlyTotals);

        int overallScore = weightedScore(List.of(savingsRate, budgetAdherence, cashBuffer, expenseStability));
        String band = toBand(overallScore);
        String summary = buildSummary(overallScore, band, cashBuffer, savingsRate);

        return FinancialHealthScoreResponseDTO.builder()
                .score(overallScore)
                .band(band)
                .summary(summary)
                .components(List.of(
                        savingsRate.toDto(),
                        budgetAdherence.toDto(),
                        cashBuffer.toDto(),
                        expenseStability.toDto()))
                .build();
    }

    private LocalDate resolveStartDate(User user, LocalDate today) {
        LocalDate lookbackStart = today.minusMonths(LOOKBACK_MONTHS - 1L).withDayOfMonth(1);
        LocalDate createdDate = user.getCreatedAt().toLocalDate();
        return createdDate.isAfter(lookbackStart) ? createdDate : lookbackStart;
    }

    private Map<YearMonth, MonthlyTotals> buildMonthlyTotals(LocalDate startDate,
                                                             LocalDate today,
                                                             List<Transaction> transactions) {
        Map<YearMonth, MonthlyTotals> totals = new LinkedHashMap<>();
        for (YearMonth month = YearMonth.from(startDate);
             !month.isAfter(YearMonth.from(today));
             month = month.plusMonths(1)) {
            totals.put(month, MonthlyTotals.empty());
        }

        for (Transaction transaction : transactions) {
            YearMonth month = YearMonth.from(transaction.getTransactionDate());
            MonthlyTotals existing = totals.getOrDefault(month, MonthlyTotals.empty());
            BigDecimal amount = transaction.getAmount() != null ? transaction.getAmount() : BigDecimal.ZERO;
            if ("income".equalsIgnoreCase(transaction.getType())) {
                totals.put(month, new MonthlyTotals(existing.income.add(amount), existing.expense));
            } else if ("expense".equalsIgnoreCase(transaction.getType())) {
                totals.put(month, new MonthlyTotals(existing.income, existing.expense.add(amount)));
            }
        }

        return totals;
    }

    private BigDecimal calculateAverageMonthlyExpense(Map<YearMonth, MonthlyTotals> monthlyTotals) {
        if (monthlyTotals.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalExpense = monthlyTotals.values().stream()
                .map(month -> month.expense)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalExpense.divide(BigDecimal.valueOf(monthlyTotals.size()), 2, RoundingMode.HALF_UP);
    }

    private ComponentScore buildSavingsRateScore(BigDecimal income, BigDecimal expense) {
        if (income.signum() <= 0) {
            return new ComponentScore(
                    "savingsRate",
                    "Savings rate",
                    35,
                    SAVINGS_WEIGHT,
                    "Add more income history to improve savings scoring.");
        }

        BigDecimal savingsRate = income.subtract(expense)
                .divide(income, 4, RoundingMode.HALF_UP)
                .max(BigDecimal.ZERO);
        int score = clampToScore(savingsRate.multiply(new BigDecimal("100")).intValue());
        return new ComponentScore(
                "savingsRate",
                "Savings rate",
                score,
                SAVINGS_WEIGHT,
                String.format("%s of this month's income is staying unspent.",
                        percentLabel(savingsRate)));
    }

    private ComponentScore buildBudgetAdherenceScore(List<Budget> budgets) {
        if (budgets.isEmpty()) {
            return new ComponentScore(
                    "budgetAdherence",
                    "Budget adherence",
                    50,
                    BUDGET_WEIGHT,
                    "Set monthly budgets to strengthen this score.");
        }

        BigDecimal totalBudgeted = budgets.stream()
                .map(Budget::getAmount)
                .filter(amount -> amount != null && amount.signum() > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBudgeted.signum() <= 0) {
            return new ComponentScore(
                    "budgetAdherence",
                    "Budget adherence",
                    50,
                    BUDGET_WEIGHT,
                    "Budgets are present but not yet funded with target amounts.");
        }

        BigDecimal weightedScore = budgets.stream()
                .filter(budget -> budget.getAmount() != null && budget.getAmount().signum() > 0)
                .map(budget -> {
                    BigDecimal spent = budget.getMoneySpent() != null ? budget.getMoneySpent() : BigDecimal.ZERO;
                    BigDecimal ratio = spent.signum() <= 0
                            ? BigDecimal.ONE
                            : budget.getAmount().divide(spent, 4, RoundingMode.HALF_UP);
                    BigDecimal adherence = ratio.min(BigDecimal.ONE).max(BigDecimal.ZERO);
                    return adherence.multiply(budget.getAmount());
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int score = clampToScore(weightedScore
                .divide(totalBudgeted, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue());

        return new ComponentScore(
                "budgetAdherence",
                "Budget adherence",
                score,
                BUDGET_WEIGHT,
                String.format("%d active budgets are %s on track.",
                        budgets.size(),
                        score >= 75 ? "mostly" : "partially"));
    }

    private ComponentScore buildCashBufferScore(BigDecimal currentBalance, BigDecimal averageMonthlyExpense) {
        if (averageMonthlyExpense.signum() <= 0) {
            return new ComponentScore(
                    "cashBuffer",
                    "Cash buffer",
                    65,
                    CASH_BUFFER_WEIGHT,
                    "Expense history is light, so buffer is estimated conservatively.");
        }

        BigDecimal monthsCovered = currentBalance.signum() <= 0
                ? BigDecimal.ZERO
                : currentBalance.divide(averageMonthlyExpense, 2, RoundingMode.HALF_UP);
        int score = clampToScore(monthsCovered
                .divide(THREE, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue());

        return new ComponentScore(
                "cashBuffer",
                "Cash buffer",
                score,
                CASH_BUFFER_WEIGHT,
                String.format("Current balances cover about %s of average monthly spend.",
                        monthsCoveredLabel(monthsCovered)));
    }

    private ComponentScore buildExpenseStabilityScore(Map<YearMonth, MonthlyTotals> monthlyTotals) {
        List<BigDecimal> monthlyExpenses = monthlyTotals.values().stream()
                .map(month -> month.expense)
                .toList();

        if (monthlyExpenses.size() < 2) {
            return new ComponentScore(
                    "expenseStability",
                    "Expense stability",
                    60,
                    STABILITY_WEIGHT,
                    "More monthly history will improve stability accuracy.");
        }

        double average = monthlyExpenses.stream()
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);

        if (average <= 0.0) {
            return new ComponentScore(
                    "expenseStability",
                    "Expense stability",
                    60,
                    STABILITY_WEIGHT,
                    "Expense activity is low, so stability is treated as neutral.");
        }

        double variance = monthlyExpenses.stream()
                .mapToDouble(value -> Math.pow(value.doubleValue() - average, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);
        double coefficient = stdDev / average;
        int score = clampToScore((int) Math.round((1.0 - Math.min(coefficient, 1.0)) * 100));

        return new ComponentScore(
                "expenseStability",
                "Expense stability",
                score,
                STABILITY_WEIGHT,
                String.format("Monthly spend variation is %s.", stabilityLabel(coefficient)));
    }

    private int weightedScore(List<ComponentScore> components) {
        return clampToScore((int) Math.round(components.stream()
                .mapToDouble(component -> component.score * (component.weight / 100.0))
                .sum()));
    }

    private String toBand(int score) {
        if (score >= 80) {
            return "Excellent";
        }
        if (score >= 65) {
            return "Good";
        }
        if (score >= 45) {
            return "Fair";
        }
        return "Needs attention";
    }

    private String buildSummary(int overallScore,
                                String band,
                                ComponentScore cashBuffer,
                                ComponentScore savingsRate) {
        if (overallScore < 45) {
            return "Financial health needs attention. Focus on protecting buffer and reducing monthly pressure.";
        }
        if (cashBuffer.score < 50) {
            return "Your score is " + band.toLowerCase() + ", but cash reserves are still thin.";
        }
        if (savingsRate.score < 50) {
            return "Your score is " + band.toLowerCase() + ", but savings rate can improve this month.";
        }
        return "Your overall financial health is " + band.toLowerCase() + " based on savings, budgets, buffer, and stability.";
    }

    private int clampToScore(int rawScore) {
        return Math.max(0, Math.min(100, rawScore));
    }

    private String percentLabel(BigDecimal value) {
        return value.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP) + "%";
    }

    private String monthsCoveredLabel(BigDecimal monthsCovered) {
        return monthsCovered.setScale(1, RoundingMode.HALF_UP) + " months";
    }

    private String stabilityLabel(double coefficient) {
        if (coefficient <= 0.2) {
            return "very steady";
        }
        if (coefficient <= 0.4) {
            return "moderately steady";
        }
        if (coefficient <= 0.7) {
            return "fairly uneven";
        }
        return "highly uneven";
    }

    private record MonthlyTotals(BigDecimal income, BigDecimal expense) {
        private static MonthlyTotals empty() {
            return new MonthlyTotals(BigDecimal.ZERO, BigDecimal.ZERO);
        }
    }

    private record ComponentScore(String key, String label, int score, int weight, String summary) {
        private FinancialHealthComponentDTO toDto() {
            return FinancialHealthComponentDTO.builder()
                    .key(key)
                    .label(label)
                    .score(score)
                    .weight(weight)
                    .summary(summary)
                    .build();
        }
    }
}
