package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.InsightsResponseDTO;
import java.time.LocalDate;
import java.util.UUID;

public interface InsightsService {

    InsightsResponseDTO getInsights(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId, UUID categoryId);
}
