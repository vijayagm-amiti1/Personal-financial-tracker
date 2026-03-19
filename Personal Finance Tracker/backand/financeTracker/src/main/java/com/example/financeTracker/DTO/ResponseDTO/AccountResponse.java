package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private String type;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private String institutionName;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
