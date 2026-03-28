package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.ForecastDailyPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.ForecastMonthResponseDTO;
import java.util.List;
import java.util.UUID;

public interface ForecastService {

    ForecastMonthResponseDTO getMonthlyForecast(UUID userId);

    List<ForecastDailyPointDTO> getDailyForecast(UUID userId);
}
