package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTransactionRequest {

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "type is required")
    private String type;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "categoryId is required")
    private UUID categoryId;

    @NotNull(message = "accountId is required")
    private UUID accountId;

    @NotBlank(message = "frequency is required")
    private String frequency;

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private Boolean autoCreateTransaction = true;

    @AssertTrue(message = "type must be expense or income")
    public boolean isTypeSupported() {
        if (type == null || type.isBlank()) {
            return true;
        }
        String normalizedType = type.trim().toLowerCase(Locale.ROOT);
        return "expense".equals(normalizedType) || "income".equals(normalizedType);
    }

    @AssertTrue(message = "frequency must be daily, weekly, monthly, or yearly")
    public boolean isFrequencySupported() {
        if (frequency == null || frequency.isBlank()) {
            return true;
        }
        String normalizedFrequency = frequency.trim().toLowerCase(Locale.ROOT);
        return "daily".equals(normalizedFrequency)
                || "weekly".equals(normalizedFrequency)
                || "monthly".equals(normalizedFrequency)
                || "yearly".equals(normalizedFrequency);
    }

    @AssertTrue(message = "endDate must be on or after startDate")
    public boolean isEndDateValid() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return !endDate.isBefore(startDate);
    }
}
