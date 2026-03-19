package com.example.financeTracker.controller;

import com.example.financeTracker.Service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalJobController {

    @Value("${app.internal_api_key}")
    private String internalApiKey;

    private final RecurringTransactionService recurringTransactionService;

    @PostMapping("/process-recurring")
    public ResponseEntity<String> triggerRecurring(@RequestHeader("X-Internal-Key") String providedKey) {
        if (!internalApiKey.equals(providedKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid API Key");
        }

        int processedCount = recurringTransactionService.runDailyJob();
        return ResponseEntity.ok("Successfully processed " + processedCount + " transactions.");
    }
}
