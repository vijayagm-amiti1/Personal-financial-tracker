package com.example.financeTracker.DTO.RequestDTO;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotBlank(message = "type is required")
    private String type;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "date is required")
    private LocalDate date;

    @NotNull(message = "accountId is required")
    private UUID accountId;

    @JsonAlias("toAcccountId")
    private UUID toAccountId;

    private UUID categoryId;

    private String merchant;

    private String note;

    private String paymentMethod;

    private List<String> tags;

    @AssertTrue(message = "toAccountId is required when type is transfer")
    public boolean isToAccountPresentForTransfer() {
        if (type == null) {
            return true;
        }
        return !"transfer".equalsIgnoreCase(type) || toAccountId != null;
    }

    @AssertTrue(message = "toAccountId is allowed only when type is transfer")
    public boolean isToAccountAllowedOnlyForTransfer() {
        if (type == null) {
            return true;
        }
        return "transfer".equalsIgnoreCase(type) || toAccountId == null;
    }

    @AssertTrue(message = "type must be expense, income, or transfer")
    public boolean isTypeSupported() {
        if (type == null || type.isBlank()) {
            return true;
        }
        return "expense".equalsIgnoreCase(type)
                || "income".equalsIgnoreCase(type)
                || "transfer".equalsIgnoreCase(type);
    }

    @AssertTrue(message = "toAccountId must be different from accountId")
    public boolean isTransferBetweenDifferentAccounts() {
        if (toAccountId == null || accountId == null) {
            return true;
        }
        return !toAccountId.equals(accountId);
    }
}
