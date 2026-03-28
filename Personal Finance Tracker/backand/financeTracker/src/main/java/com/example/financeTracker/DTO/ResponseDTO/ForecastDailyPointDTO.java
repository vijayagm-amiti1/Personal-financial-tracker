package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastDailyPointDTO {

    private LocalDate date;
    private BigDecimal projectedBalance;
    private BigDecimal recurringIncome;
    private BigDecimal recurringExpense;
    private BigDecimal estimatedExpense;
    private boolean negative;
}
