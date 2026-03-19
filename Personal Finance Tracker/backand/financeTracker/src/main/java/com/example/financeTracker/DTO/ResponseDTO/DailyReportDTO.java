package com.example.financeTracker.DTO.ResponseDTO;

import java.util.UUID;

public record DailyReportDTO(
        int day,
        UUID accountId,
        double income,
        double expense
) {
}
