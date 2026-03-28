package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.ResponseDTO.FinancialHealthScoreResponseDTO;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.FinancialHealthService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/financial-health")
@RequiredArgsConstructor
@Slf4j
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<FinancialHealthScoreResponseDTO> getFinancialHealthScore(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received financial health score request for user {}", userId);
        return ResponseEntity.ok(financialHealthService.getFinancialHealthScore(userId));
    }
}
