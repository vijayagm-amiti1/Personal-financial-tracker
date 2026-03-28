package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.FinancialHealthScoreResponseDTO;
import java.util.UUID;

public interface FinancialHealthService {

    FinancialHealthScoreResponseDTO getFinancialHealthScore(UUID userId);
}
