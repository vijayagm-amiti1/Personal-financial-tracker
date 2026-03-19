package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.CategorySpendingReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.DailyReportDTO;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.ReportService;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<DailyReportDTO> getMonthlyDailyReport(UUID userId, UUID accountId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        userRepository.existsById(userId);
        accountRepository.findByIdAndUserIdAndIsActiveTrue(accountId, userId);

        List<Transaction> transactions = transactionRepository
                .findAllByUserIdAndAccountIsActiveTrueAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);

        Map<Integer, double[]> dailyTotals = new LinkedHashMap<>();
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            dailyTotals.put(day, new double[]{0.0, 0.0});
        }

        for (Transaction transaction : transactions) {
            int day = transaction.getTransactionDate().getDayOfMonth();
            double[] totals = dailyTotals.get(day);
            double amount = transaction.getAmount().doubleValue();

            if ("income".equalsIgnoreCase(transaction.getType())
                    && transaction.getAccount() != null
                    && accountId.equals(transaction.getAccount().getId())) {
                totals[0] += amount;
            } else if ("expense".equalsIgnoreCase(transaction.getType())
                    && transaction.getAccount() != null
                    && accountId.equals(transaction.getAccount().getId())) {
                totals[1] += amount;
            } else if ("goal_contribution".equalsIgnoreCase(transaction.getType())) {
                if (transaction.getAccount() != null
                        && accountId.equals(transaction.getAccount().getId())
                        && transaction.getToAccount() != null
                        && !accountId.equals(transaction.getToAccount().getId())) {
                    totals[1] += amount;
                }
                if (transaction.getToAccount() != null
                        && accountId.equals(transaction.getToAccount().getId())
                        && transaction.getAccount() != null
                        && !accountId.equals(transaction.getAccount().getId())) {
                    totals[0] += amount;
                }
            } else if ("transfer".equalsIgnoreCase(transaction.getType())) {
                if (transaction.getAccount() != null && accountId.equals(transaction.getAccount().getId())) {
                    totals[1] += amount;
                }
                if (transaction.getToAccount() != null && accountId.equals(transaction.getToAccount().getId())) {
                    totals[0] += amount;
                }
            }
        }

        List<DailyReportDTO> response = new ArrayList<>();
        for (Map.Entry<Integer, double[]> entry : dailyTotals.entrySet()) {
            response.add(new DailyReportDTO(
                    entry.getKey(),
                    accountId,
                    entry.getValue()[0],
                    entry.getValue()[1]
            ));
        }

        log.info("Generated monthly daily report for user {}, account {}, month {}, year {}",
                userId, accountId, month, year);
        return response;
    }

    @Override
    public List<CategorySpendingReportDTO> getMonthlyCategorySpendingReport(UUID userId, UUID accountId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        userRepository.existsById(userId);
        accountRepository.findByIdAndUserIdAndIsActiveTrue(accountId, userId);

        List<Transaction> transactions = transactionRepository
                .findAllByUserIdAndAccountIsActiveTrueAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);

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
}
