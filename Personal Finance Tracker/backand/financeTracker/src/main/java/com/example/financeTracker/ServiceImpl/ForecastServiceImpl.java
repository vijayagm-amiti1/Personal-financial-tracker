package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.ForecastDailyPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.ForecastMonthResponseDTO;
import com.example.financeTracker.DTO.ResponseDTO.ForecastUpcomingItemDTO;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.RecurringTransaction;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.RecurringTransactionRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AccountSharingService;
import com.example.financeTracker.Service.ForecastService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ForecastServiceImpl implements ForecastService {

    private static final int LOOKBACK_MONTHS = 3;
    private static final BigDecimal NEW_USER_FALLBACK_DAILY_EXPENSE = new BigDecimal("5000.00");

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final AccountSharingService accountSharingService;

    @Override
    public ForecastMonthResponseDTO getMonthlyForecast(UUID userId) {
        ForecastComputation computation = computeForecast(userId);
        long remainingDays = computation.projectedDays;
        BigDecimal safeToSpend = computation.insufficientForRecurringPayments
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : maxZero(computation.projectedEndBalance);
        BigDecimal safeToSpendPerDay = remainingDays > 0
                ? safeToSpend.divide(BigDecimal.valueOf(remainingDays), 2, RoundingMode.HALF_UP)
                : safeToSpend;

        String riskMessage = buildRiskMessage(computation.firstNegativeDate, computation.projectedEndBalance);

        return ForecastMonthResponseDTO.builder()
                .month(computation.today.getMonthValue())
                .year(computation.today.getYear())
                .fromDate(computation.fromDate)
                .toDate(computation.endOfMonth)
                .currentBalance(computation.currentBalance)
                .projectedEndBalance(computation.projectedEndBalance)
                .safeToSpend(safeToSpend)
                .safeToSpendPerDay(safeToSpendPerDay)
                .averageDailyExpense(computation.averageDailyExpense)
                .estimatedPatternExpenseRemaining(computation.totalEstimatedExpense)
                .upcomingRecurringIncome(computation.upcomingRecurringIncome)
                .upcomingRecurringExpense(computation.upcomingRecurringExpense)
                .insufficientForRecurringPayments(computation.insufficientForRecurringPayments)
                .recurringPaymentAlert(computation.recurringPaymentAlert)
                .negativeBalanceLikely(computation.firstNegativeDate != null)
                .firstNegativeDate(computation.firstNegativeDate)
                .riskMessage(riskMessage)
                .upcomingKnownExpenses(computation.upcomingItems.stream().limit(8).toList())
                .build();
    }

    @Override
    public List<ForecastDailyPointDTO> getDailyForecast(UUID userId) {
        return computeForecast(userId).dailyPoints;
    }

    private ForecastComputation computeForecast(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalDate today = LocalDate.now();
        LocalDate endOfMonth = YearMonth.from(today).atEndOfMonth();
        LocalDate forecastStartDate = resolveForecastStartDate(user, today);

        List<Account> activeAccounts = accountRepository.findAllAccessibleByUserId(userId);
        BigDecimal currentBalance = activeAccounts.stream()
                .map(account -> account.getCurrentBalance() != null ? account.getCurrentBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageDailyExpense = calculateAverageDailyExpense(userId, user, today);
        List<Transaction> historicalTransactions = transactionRepository
                .findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        userId,
                        forecastStartDate,
                        today);
        BigDecimal openingBalance = currentBalance.subtract(calculateNetMovement(historicalTransactions));

        List<ScheduledForecastItem> recurringSchedule = buildRecurringSchedule(userId, today.plusDays(1), endOfMonth);
        BigDecimal upcomingRecurringIncome = recurringSchedule.stream()
                .filter(item -> "income".equalsIgnoreCase(item.type))
                .map(item -> item.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal upcomingRecurringExpense = recurringSchedule.stream()
                .filter(item -> "expense".equalsIgnoreCase(item.type))
                .map(item -> item.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal recurringCoverageBalance = currentBalance
                .add(upcomingRecurringIncome)
                .subtract(upcomingRecurringExpense);
        boolean insufficientForRecurringPayments = recurringCoverageBalance.signum() < 0;
        String recurringPaymentAlert = insufficientForRecurringPayments
                ? "Insufficient for recurring payments."
                : "Recurring payments are covered.";

        List<ForecastUpcomingItemDTO> upcomingItems = recurringSchedule.stream()
                .filter(item -> "expense".equalsIgnoreCase(item.type))
                .sorted(Comparator.comparing(item -> item.date))
                .map(item -> ForecastUpcomingItemDTO.builder()
                        .date(item.date)
                        .title(item.title)
                        .type(item.type)
                        .amount(item.amount)
                        .source("recurring")
                        .build())
                .toList();

        BigDecimal runningBalance = openingBalance;
        BigDecimal totalEstimatedExpense = BigDecimal.ZERO;
        LocalDate firstNegativeDate = null;
        List<ForecastDailyPointDTO> dailyPoints = new ArrayList<>();

        for (LocalDate cursor = forecastStartDate; !cursor.isAfter(today); cursor = cursor.plusDays(1)) {
            LocalDate historyDate = cursor;
            BigDecimal actualIncome = historicalTransactions.stream()
                    .filter(transaction -> transaction.getTransactionDate().isEqual(historyDate))
                    .filter(transaction -> "income".equalsIgnoreCase(transaction.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal actualExpense = historicalTransactions.stream()
                    .filter(transaction -> transaction.getTransactionDate().isEqual(historyDate))
                    .filter(transaction -> "expense".equalsIgnoreCase(transaction.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            runningBalance = runningBalance.add(actualIncome).subtract(actualExpense);

            dailyPoints.add(ForecastDailyPointDTO.builder()
                    .date(historyDate)
                    .projectedBalance(scale(runningBalance))
                    .recurringIncome(scale(actualIncome))
                    .recurringExpense(scale(actualExpense))
                    .estimatedExpense(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .negative(false)
                    .build());
        }

        int projectedDays = 0;
        for (LocalDate cursor = today.plusDays(1); !cursor.isAfter(endOfMonth); cursor = cursor.plusDays(1)) {
            LocalDate forecastDate = cursor;
            BigDecimal recurringIncome = recurringSchedule.stream()
                    .filter(item -> item.date.equals(forecastDate) && "income".equalsIgnoreCase(item.type))
                    .map(item -> item.amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal recurringExpense = recurringSchedule.stream()
                    .filter(item -> item.date.equals(forecastDate) && "expense".equalsIgnoreCase(item.type))
                    .map(item -> item.amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal estimatedExpense = averageDailyExpense;

            totalEstimatedExpense = totalEstimatedExpense.add(estimatedExpense);
            runningBalance = runningBalance
                    .add(recurringIncome)
                    .subtract(recurringExpense)
                    .subtract(estimatedExpense);
            projectedDays += 1;

            boolean negative = runningBalance.signum() < 0;
            if (negative && firstNegativeDate == null) {
                firstNegativeDate = forecastDate;
            }

            dailyPoints.add(ForecastDailyPointDTO.builder()
                    .date(forecastDate)
                    .projectedBalance(scale(runningBalance))
                    .recurringIncome(scale(recurringIncome))
                    .recurringExpense(scale(recurringExpense))
                    .estimatedExpense(scale(estimatedExpense))
                    .negative(negative)
                    .build());
        }

        return ForecastComputation.builder()
                .fromDate(forecastStartDate)
                .today(today)
                .endOfMonth(endOfMonth)
                .currentBalance(scale(currentBalance))
                .projectedEndBalance(scale(runningBalance))
                .averageDailyExpense(scale(averageDailyExpense))
                .upcomingRecurringIncome(scale(upcomingRecurringIncome))
                .upcomingRecurringExpense(scale(upcomingRecurringExpense))
                .insufficientForRecurringPayments(insufficientForRecurringPayments)
                .recurringPaymentAlert(recurringPaymentAlert)
                .totalEstimatedExpense(scale(totalEstimatedExpense))
                .firstNegativeDate(firstNegativeDate)
                .upcomingItems(upcomingItems)
                .projectedDays(projectedDays)
                .dailyPoints(dailyPoints)
                .build();
    }

    private LocalDate resolveForecastStartDate(User user, LocalDate today) {
        LocalDate lookbackCutoff = today.minusMonths(LOOKBACK_MONTHS).withDayOfMonth(1);
        LocalDate userCreatedDate = user.getCreatedAt().toLocalDate();
        return userCreatedDate.isAfter(lookbackCutoff) ? userCreatedDate : lookbackCutoff;
    }

    private BigDecimal calculateAverageDailyExpense(UUID userId, User user, LocalDate today) {
        long userAgeInDays = ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), today) + 1;
        if (userAgeInDays <= 7) {
            return NEW_USER_FALLBACK_DAILY_EXPENSE;
        }

        LocalDate observedEnd = today.minusDays(1);
        if (observedEnd.isBefore(user.getCreatedAt().toLocalDate())) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        LocalDate observedStart = resolveForecastStartDate(user, today);

        List<Transaction> transactions = transactionRepository
                .findAllAccessibleByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        userId,
                        observedStart,
                        observedEnd);

        BigDecimal nonRecurringExpenseTotal = transactions.stream()
                .filter(transaction -> "expense".equalsIgnoreCase(transaction.getType()))
                .filter(transaction -> !transaction.isRecurred())
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long observedDays = Math.max(ChronoUnit.DAYS.between(observedStart, observedEnd) + 1, 1);
        if (nonRecurringExpenseTotal.signum() == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return nonRecurringExpenseTotal.divide(BigDecimal.valueOf(observedDays), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateNetMovement(List<Transaction> transactions) {
        return transactions.stream()
                .map(transaction -> switch (transaction.getType().toLowerCase()) {
                    case "income" -> transaction.getAmount();
                    case "expense" -> transaction.getAmount().negate();
                    default -> BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ScheduledForecastItem> buildRecurringSchedule(UUID userId, LocalDate today, LocalDate endOfMonth) {
        List<ScheduledForecastItem> scheduledItems = new ArrayList<>();

        for (RecurringTransaction recurringTransaction : recurringTransactionRepository.findAllAccessibleByUserId(userId)) {
            LocalDate runDate = recurringTransaction.getNextRunDate();
            while (runDate != null
                    && !runDate.isAfter(endOfMonth)
                    && isWithinEndDate(recurringTransaction, runDate)) {
                if (!runDate.isBefore(today)) {
                    scheduledItems.add(ScheduledForecastItem.builder()
                            .date(runDate)
                            .title(recurringTransaction.getTitle())
                            .type(recurringTransaction.getType())
                            .amount(scale(recurringTransaction.getAmount()))
                            .build());
                }
                runDate = calculateNextRunDate(runDate, recurringTransaction.getFrequency());
            }
        }

        scheduledItems.sort(Comparator.comparing(item -> item.date));
        return scheduledItems;
    }

    private boolean isWithinEndDate(RecurringTransaction recurringTransaction, LocalDate candidateRunDate) {
        return recurringTransaction.getEndDate() == null || !candidateRunDate.isAfter(recurringTransaction.getEndDate());
    }

    private LocalDate calculateNextRunDate(LocalDate currentRunDate, String frequency) {
        return switch (frequency) {
            case "daily" -> currentRunDate.plusDays(1);
            case "weekly" -> currentRunDate.plusWeeks(1);
            case "monthly" -> currentRunDate.plusMonths(1);
            case "yearly" -> currentRunDate.plusYears(1);
            default -> currentRunDate.plusMonths(1);
        };
    }

    private String buildRiskMessage(LocalDate firstNegativeDate, BigDecimal projectedEndBalance) {
        if (firstNegativeDate != null) {
            return "Negative balance likely on " + firstNegativeDate + ".";
        }
        if (projectedEndBalance.signum() <= 0) {
            return "Projected balance is tight by month end.";
        }
        return "Projected to stay positive through month end.";
    }

    private BigDecimal maxZero(BigDecimal value) {
        return value.signum() < 0 ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : scale(value);
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    @Builder
    private record ScheduledForecastItem(LocalDate date, String title, String type, BigDecimal amount) {
    }

    @Builder
    private record ForecastComputation(
            LocalDate fromDate,
            LocalDate today,
            LocalDate endOfMonth,
            BigDecimal currentBalance,
            BigDecimal projectedEndBalance,
            BigDecimal averageDailyExpense,
            BigDecimal totalEstimatedExpense,
            BigDecimal upcomingRecurringIncome,
            BigDecimal upcomingRecurringExpense,
            boolean insufficientForRecurringPayments,
            String recurringPaymentAlert,
            LocalDate firstNegativeDate,
            List<ForecastUpcomingItemDTO> upcomingItems,
            int projectedDays,
            List<ForecastDailyPointDTO> dailyPoints
    ) {
    }
}
