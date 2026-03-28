package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.ResponseDTO.InsightsResponseDTO;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.InsightsService;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Slf4j
public class InsightsController {

    private final InsightsService insightsService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<InsightsResponseDTO> getInsights(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) UUID categoryId
    ) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received insights request for user {}, account {}, category {}, from {}, to {}",
                userId, accountId, categoryId, from, to);
        return ResponseEntity.ok(insightsService.getInsights(userId, from, to, accountId, categoryId));
    }
}
