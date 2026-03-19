package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private Integer month;
    private Integer year;
    private BigDecimal amount;
    private BigDecimal currentSpent;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double spentPercent;
    private Integer alertThresholdPercent;
}
