package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastMonthResponseDTO {

    private int month;
    private int year;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal currentBalance;
    private BigDecimal projectedEndBalance;
    private BigDecimal safeToSpend;
    private BigDecimal safeToSpendPerDay;
    private BigDecimal averageDailyExpense;
    private BigDecimal estimatedPatternExpenseRemaining;
    private BigDecimal upcomingRecurringIncome;
    private BigDecimal upcomingRecurringExpense;
    private boolean insufficientForRecurringPayments;
    private String recurringPaymentAlert;
    private boolean negativeBalanceLikely;
    private LocalDate firstNegativeDate;
    private String riskMessage;
    private List<ForecastUpcomingItemDTO> upcomingKnownExpenses;
}
