package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.ResponseDTO.ForecastDailyPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.ForecastMonthResponseDTO;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.ForecastService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
@Slf4j
public class ForecastController {

    private final ForecastService forecastService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/month")
    public ResponseEntity<ForecastMonthResponseDTO> getMonthlyForecast(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received monthly forecast request for user {}", userId);
        return ResponseEntity.ok(forecastService.getMonthlyForecast(userId));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<ForecastDailyPointDTO>> getDailyForecast(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received daily forecast request for user {}", userId);
        return ResponseEntity.ok(forecastService.getDailyForecast(userId));
    }
}
