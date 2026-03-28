package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.CategorySpendingReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.CategoryTrendPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.CategoryTrendSeriesDTO;
import com.example.financeTracker.DTO.ResponseDTO.DailyReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.NetWorthPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.NetWorthReportResponseDTO;
import com.example.financeTracker.DTO.ResponseDTO.TrendMetricPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.TrendReportResponseDTO;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AccountSharingService;
import com.example.financeTracker.Service.ReportService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter PERIOD_KEY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter PERIOD_LABEL_FORMAT = DateTimeFormatter.ofPattern("MMM yyyy");

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final AccountSharingService accountSharingService;

    @Override
    public List<DailyReportDTO> getMonthlyDailyReport(UUID userId, UUID accountId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        userRepository.existsById(userId);
        accountSharingService.requireAccessibleAccount(accountId, userId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow();

        LocalDate accountStartDate = account.getCreatedAt() == null
                ? startDate
                : account.getCreatedAt().toLocalDate();
        LocalDate transactionStartDate = accountStartDate.isBefore(startDate) ? accountStartDate : startDate;

        List<Transaction> transactions = transactionRepository
                .findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        userId,
                        transactionStartDate,
                        endDate);

        Map<Integer, BigDecimal[]> dailyTotals = new LinkedHashMap<>();
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            dailyTotals.put(day, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO});
        }

        BigDecimal runningBalance = account.getOpeningBalance() == null
                ? BigDecimal.ZERO
                : account.getOpeningBalance();

        LocalDate cursor = transactionStartDate;
        while (!cursor.isAfter(endDate)) {
            BigDecimal dailyIncome = BigDecimal.ZERO;
            BigDecimal dailyExpense = BigDecimal.ZERO;

            for (Transaction transaction : transactions) {
                if (!transaction.getTransactionDate().isEqual(cursor)) {
                    continue;
                }

                BigDecimal signedAmount = calculateSignedAmountForAccount(transaction, accountId);
                if (signedAmount.signum() > 0) {
                    dailyIncome = dailyIncome.add(signedAmount);
                } else if (signedAmount.signum() < 0) {
                    dailyExpense = dailyExpense.add(signedAmount.abs());
                }
            }

            runningBalance = runningBalance.add(dailyIncome).subtract(dailyExpense);

            if (!cursor.isBefore(startDate)) {
                BigDecimal[] totals = dailyTotals.get(cursor.getDayOfMonth());
                totals[0] = dailyIncome;
                totals[1] = dailyExpense;
                totals[2] = runningBalance;
            }

            cursor = cursor.plusDays(1);
        }

        List<DailyReportDTO> response = new ArrayList<>();
        for (Map.Entry<Integer, BigDecimal[]> entry : dailyTotals.entrySet()) {
            response.add(new DailyReportDTO(
                    entry.getKey(),
                    accountId,
                    entry.getValue()[0].doubleValue(),
                    entry.getValue()[1].doubleValue(),
                    entry.getValue()[2].doubleValue()
            ));
        }

        log.info("Generated monthly daily report for user {}, account {}, month {}, year {}",
                userId, accountId, month, year);
        return response;
    }

    private BigDecimal calculateSignedAmountForAccount(Transaction transaction, UUID accountId) {
        if ("income".equalsIgnoreCase(transaction.getType())
                && transaction.getAccount() != null
                && accountId.equals(transaction.getAccount().getId())) {
            return transaction.getAmount();
        }

        if ("expense".equalsIgnoreCase(transaction.getType())
                && transaction.getAccount() != null
                && accountId.equals(transaction.getAccount().getId())) {
            return transaction.getAmount().negate();
        }

        if ("transfer".equalsIgnoreCase(transaction.getType()) || "goal_contribution".equalsIgnoreCase(transaction.getType())) {
            if (transaction.getAccount() != null && accountId.equals(transaction.getAccount().getId())) {
                return transaction.getAmount().negate();
            }
            if (transaction.getToAccount() != null && accountId.equals(transaction.getToAccount().getId())) {
                return transaction.getAmount();
            }
        }

        return BigDecimal.ZERO;
    }

    @Override
    public List<CategorySpendingReportDTO> getMonthlyCategorySpendingReport(UUID userId, UUID accountId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        userRepository.existsById(userId);
        accountSharingService.requireAccessibleAccount(accountId, userId);

        List<Transaction> transactions = transactionRepository
                .findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);

        Map<UUID, CategorySpendingReportDTO> categoryTotals = new LinkedHashMap<>();

        for (Transaction transaction : transactions) {
            if (transaction.getCategory() == null || transaction.getAccount() == null) {
                continue;
            }
            if (!accountId.equals(transaction.getAccount().getId())) {
                continue;
            }
            if (!"expense".equalsIgnoreCase(transaction.getType())) {
                continue;
            }

            Category category = transaction.getCategory();
            UUID categoryId = category.getId();
            CategorySpendingReportDTO existing = categoryTotals.get(categoryId);
            double newExpense = transaction.getAmount().doubleValue();

            if (existing == null) {
                categoryTotals.put(categoryId, new CategorySpendingReportDTO(
                        categoryId,
                        category.getName(),
                        newExpense
                ));
            } else {
                categoryTotals.put(categoryId, new CategorySpendingReportDTO(
                        existing.categoryId(),
                        existing.categoryName(),
                        existing.expense() + newExpense
                ));
            }
        }

        log.info("Generated monthly category spending report for user {}, account {}, month {}, year {}",
                userId, accountId, month, year);
        return new ArrayList<>(categoryTotals.values());
    }

    @Override
    public TrendReportResponseDTO getTrendReport(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId, UUID categoryId) {
        User user = userRepository.findById(userId).orElseThrow();
        DateRange dateRange = normalizeDateRange(user, fromDate, toDate);
        List<Transaction> transactions = loadTransactions(userId, dateRange);
        Map<YearMonth, PeriodAccumulator> monthlyAccumulators = initializeMonthlyAccumulators(dateRange);
        Map<UUID, String> categoryNames = new HashMap<>();
        Map<UUID, Map<YearMonth, BigDecimal>> categoryExpenseSeries = new HashMap<>();

        for (Transaction transaction : transactions) {
            if (!matchesAccountFilter(transaction, accountId) || !matchesCategoryFilter(transaction, categoryId)) {
                continue;
            }

            YearMonth period = YearMonth.from(transaction.getTransactionDate());
            PeriodAccumulator accumulator = monthlyAccumulators.get(period);
            if (accumulator == null) {
                continue;
            }

            if (isIncomeTransaction(transaction)) {
                accumulator.income = accumulator.income.add(transaction.getAmount());
            } else if (isExpenseTransaction(transaction)) {
                accumulator.expense = accumulator.expense.add(transaction.getAmount());

                if (transaction.getCategory() != null) {
                    UUID transactionCategoryId = transaction.getCategory().getId();
                    categoryNames.put(transactionCategoryId, transaction.getCategory().getName());
                    categoryExpenseSeries
                            .computeIfAbsent(transactionCategoryId, ignored -> initializeEmptyCategorySeries(dateRange))
                            .merge(period, transaction.getAmount(), BigDecimal::add);
                }
            }
        }

        List<TrendMetricPointDTO> monthlySummary = monthlyAccumulators.entrySet().stream()
                .map(entry -> TrendMetricPointDTO.builder()
                        .periodKey(entry.getKey().format(PERIOD_KEY_FORMAT))
                        .periodLabel(entry.getKey().format(PERIOD_LABEL_FORMAT))
                        .income(entry.getValue().income.doubleValue())
                        .expense(entry.getValue().expense.doubleValue())
                        .savingsRate(calculateSavingsRate(entry.getValue().income, entry.getValue().expense))
                        .build())
                .toList();

        List<CategoryTrendSeriesDTO> categoryTrends = categoryExpenseSeries.entrySet().stream()
                .map(entry -> toCategoryTrendSeries(entry.getKey(), categoryNames.get(entry.getKey()), entry.getValue()))
                .sorted(Comparator.comparingDouble(CategoryTrendSeriesDTO::getTotalExpense).reversed())
                .limit(categoryId == null ? 5 : 1)
                .toList();

        return TrendReportResponseDTO.builder()
                .fromDate(dateRange.fromDate())
                .toDate(dateRange.toDate())
                .monthlySummary(monthlySummary)
                .categoryTrends(categoryTrends)
                .build();
    }

    @Override
    public NetWorthReportResponseDTO getNetWorthReport(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId) {
        User user = userRepository.findById(userId).orElseThrow();
        DateRange dateRange = normalizeDateRange(user, fromDate, toDate);
        List<Account> accounts = accountRepository.findAllAccessibleByUserId(userId).stream()
                .filter(account -> accountId == null || account.getId().equals(accountId))
                .toList();
        List<Transaction> transactions = loadTransactions(userId, dateRange);
        List<NetWorthPointDTO> points = new ArrayList<>();

        for (YearMonth period : enumerateMonths(dateRange)) {
            LocalDate pointDate = period.equals(YearMonth.from(dateRange.toDate()))
                    ? dateRange.toDate()
                    : period.atEndOfMonth();
            BigDecimal totalAssets = accounts.stream()
                    .map(account -> calculateAccountBalanceAt(account, transactions, pointDate, dateRange.toDate()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            points.add(NetWorthPointDTO.builder()
                    .periodKey(period.format(PERIOD_KEY_FORMAT))
                    .periodLabel(period.format(PERIOD_LABEL_FORMAT))
                    .date(pointDate)
                    .netWorth(totalAssets.doubleValue())
                    .totalAssets(totalAssets.doubleValue())
                    .build());
        }

        double currentNetWorth = points.isEmpty() ? 0 : points.get(points.size() - 1).getNetWorth();
        double changeAmount = points.size() > 1 ? currentNetWorth - points.get(0).getNetWorth() : currentNetWorth;

        return NetWorthReportResponseDTO.builder()
                .fromDate(dateRange.fromDate())
                .toDate(dateRange.toDate())
                .currentNetWorth(currentNetWorth)
                .changeAmount(changeAmount)
                .points(points)
                .build();
    }

    private List<Transaction> loadTransactions(UUID userId, DateRange dateRange) {
        return transactionRepository.findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                userId,
                dateRange.fromDate(),
                dateRange.toDate()
        );
    }

    private DateRange normalizeDateRange(User user, LocalDate fromDate, LocalDate toDate) {
        LocalDate resolvedToDate = toDate == null ? LocalDate.now() : toDate;
        LocalDate createdDate = resolveUserCreatedDate(user);
        LocalDate defaultFromDate = resolvedToDate.minusMonths(5).withDayOfMonth(1);
        LocalDate resolvedFromDate = fromDate == null ? defaultFromDate : fromDate;

        if (resolvedFromDate.isBefore(createdDate)) {
            resolvedFromDate = createdDate;
        }

        if (resolvedFromDate.isAfter(resolvedToDate)) {
            resolvedFromDate = resolvedToDate.withDayOfMonth(1);
        }

        return new DateRange(resolvedFromDate, resolvedToDate);
    }

    private LocalDate resolveUserCreatedDate(User user) {
        LocalDateTime createdAt = user.getCreatedAt();
        return createdAt == null ? LocalDate.now() : createdAt.toLocalDate();
    }

    private Map<YearMonth, PeriodAccumulator> initializeMonthlyAccumulators(DateRange dateRange) {
        Map<YearMonth, PeriodAccumulator> periods = new LinkedHashMap<>();
        for (YearMonth period : enumerateMonths(dateRange)) {
            periods.put(period, new PeriodAccumulator());
        }
        return periods;
    }

    private Map<YearMonth, BigDecimal> initializeEmptyCategorySeries(DateRange dateRange) {
        Map<YearMonth, BigDecimal> periods = new LinkedHashMap<>();
        for (YearMonth period : enumerateMonths(dateRange)) {
            periods.put(period, BigDecimal.ZERO);
        }
        return periods;
    }

    private List<YearMonth> enumerateMonths(DateRange dateRange) {
        List<YearMonth> periods = new ArrayList<>();
        YearMonth cursor = YearMonth.from(dateRange.fromDate());
        YearMonth end = YearMonth.from(dateRange.toDate());

        while (!cursor.isAfter(end)) {
            periods.add(cursor);
            cursor = cursor.plusMonths(1);
        }
        return periods;
    }

    private CategoryTrendSeriesDTO toCategoryTrendSeries(UUID categoryId, String categoryName, Map<YearMonth, BigDecimal> series) {
        List<CategoryTrendPointDTO> points = series.entrySet().stream()
                .map(entry -> CategoryTrendPointDTO.builder()
                        .periodKey(entry.getKey().format(PERIOD_KEY_FORMAT))
                        .periodLabel(entry.getKey().format(PERIOD_LABEL_FORMAT))
                        .expense(entry.getValue().doubleValue())
                        .build())
                .toList();

        double totalExpense = series.values().stream()
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        return CategoryTrendSeriesDTO.builder()
                .categoryId(categoryId)
                .categoryName(categoryName == null ? "Unknown category" : categoryName)
                .totalExpense(totalExpense)
                .points(points)
                .build();
    }

    private boolean matchesAccountFilter(Transaction transaction, UUID accountId) {
        if (accountId == null) {
            return true;
        }

        return (transaction.getAccount() != null && accountId.equals(transaction.getAccount().getId()))
                || (transaction.getToAccount() != null && accountId.equals(transaction.getToAccount().getId()));
    }

    private boolean matchesCategoryFilter(Transaction transaction, UUID categoryId) {
        if (categoryId == null) {
            return true;
        }

        return transaction.getCategory() != null && categoryId.equals(transaction.getCategory().getId());
    }

    private boolean isIncomeTransaction(Transaction transaction) {
        return "income".equalsIgnoreCase(transaction.getType());
    }

    private boolean isExpenseTransaction(Transaction transaction) {
        return "expense".equalsIgnoreCase(transaction.getType());
    }

    private double calculateSavingsRate(BigDecimal income, BigDecimal expense) {
        if (income == null || income.signum() <= 0) {
            return 0;
        }

        return income.subtract(expense)
                .multiply(BigDecimal.valueOf(100))
                .divide(income, 2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
    }

    private BigDecimal calculateAccountBalanceAt(Account account,
                                                 List<Transaction> transactions,
                                                 LocalDate pointDate,
                                                 LocalDate reportToDate) {
        if (account.getCreatedAt() != null && account.getCreatedAt().toLocalDate().isAfter(pointDate)) {
            return BigDecimal.ZERO;
        }

        // Use the persisted live balance for the latest point so insights match the dashboard's current balance.
        if (pointDate.equals(reportToDate)) {
            return account.getCurrentBalance() == null ? BigDecimal.ZERO : account.getCurrentBalance();
        }

        BigDecimal balance = account.getOpeningBalance() == null ? BigDecimal.ZERO : account.getOpeningBalance();

        for (Transaction transaction : transactions) {
            if (transaction.getTransactionDate().isAfter(pointDate)) {
                continue;
            }

            if ("income".equalsIgnoreCase(transaction.getType())
                    && transaction.getAccount() != null
                    && account.getId().equals(transaction.getAccount().getId())) {
                balance = balance.add(transaction.getAmount());
            } else if ("expense".equalsIgnoreCase(transaction.getType())
                    && transaction.getAccount() != null
                    && account.getId().equals(transaction.getAccount().getId())) {
                balance = balance.subtract(transaction.getAmount());
            } else if ("transfer".equalsIgnoreCase(transaction.getType()) || "goal_contribution".equalsIgnoreCase(transaction.getType())) {
                if (transaction.getAccount() != null && account.getId().equals(transaction.getAccount().getId())) {
                    balance = balance.subtract(transaction.getAmount());
                }
                if (transaction.getToAccount() != null && account.getId().equals(transaction.getToAccount().getId())) {
                    balance = balance.add(transaction.getAmount());
                }
            }
        }

        return balance;
    }

    private record DateRange(LocalDate fromDate, LocalDate toDate) {
    }

    private static final class PeriodAccumulator {
        private BigDecimal income = BigDecimal.ZERO;
        private BigDecimal expense = BigDecimal.ZERO;
    }
}
