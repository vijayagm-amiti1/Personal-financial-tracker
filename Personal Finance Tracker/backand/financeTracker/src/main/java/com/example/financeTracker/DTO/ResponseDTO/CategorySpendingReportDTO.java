package com.example.financeTracker.DTO.ResponseDTO;

import java.util.UUID;

public record CategorySpendingReportDTO(
        UUID categoryId,
        String categoryName,
        double expense
) {
}
