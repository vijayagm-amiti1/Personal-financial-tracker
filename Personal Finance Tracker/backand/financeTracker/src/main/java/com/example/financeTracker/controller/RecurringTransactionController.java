package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.RecurringTransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.RecurringTransactionResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.RecurringTransactionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getRecurringTransactions(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get recurring transactions request for user {}", userId);
        return ResponseEntity.ok(recurringTransactionService.getRecurringTransactionResponsesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> createRecurringTransaction(
            @Valid @RequestBody RecurringTransactionRequest request,
            Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create recurring transaction request for user {}", userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringTransactionService.createRecurringTransaction(request, userId));
    }

    @PutMapping("/{recurringTransactionId}")
    public ResponseEntity<RecurringTransactionResponse> updateRecurringTransaction(
            @PathVariable UUID recurringTransactionId,
            @Valid @RequestBody RecurringTransactionRequest request,
            Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update recurring transaction request for user {} and recurring {}", userId, recurringTransactionId);
        return ResponseEntity.ok(recurringTransactionService.updateRecurringTransaction(recurringTransactionId, request, userId));
    }

    @DeleteMapping("/{recurringTransactionId}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable UUID recurringTransactionId,
                                                           Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete recurring transaction request for user {} and recurring {}", userId, recurringTransactionId);
        recurringTransactionService.deleteRecurringTransaction(recurringTransactionId, userId);
        return ResponseEntity.noContent().build();
    }
}
