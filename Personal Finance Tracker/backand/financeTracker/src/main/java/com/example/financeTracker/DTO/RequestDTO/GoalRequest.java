package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class GoalRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "targetAmount is required")
    @DecimalMin(value = "0.01", message = "targetAmount must be greater than 0")
    private BigDecimal targetAmount;

    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    private LocalDate targetDate;

    @NotNull(message = "linkedAccountId is required")
    private UUID linkedAccountId;

    @Builder.Default
    private String status = "active";
}
