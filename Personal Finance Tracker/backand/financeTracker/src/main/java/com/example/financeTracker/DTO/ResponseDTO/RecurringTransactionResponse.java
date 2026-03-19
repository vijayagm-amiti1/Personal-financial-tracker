package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTransactionResponse {

    private UUID id;
    private UUID userId;
    private String title;
    private String type;
    private BigDecimal amount;
    private UUID categoryId;
    private String categoryName;
    private UUID accountId;
    private String accountName;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextRunDate;
    private Boolean autoCreateTransaction;
}
