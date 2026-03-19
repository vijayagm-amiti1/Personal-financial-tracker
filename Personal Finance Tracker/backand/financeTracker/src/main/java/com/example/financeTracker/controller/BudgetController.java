package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.BudgetRequest;
import com.example.financeTracker.DTO.ResponseDTO.BudgetResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.BudgetService;
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
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request,
                                                       Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create budget request for user {}", userId);
        BudgetResponse response = budgetService.createBudget(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgetsByUserId(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get budgets request for user {}", userId);
        List<BudgetResponse> responses = budgetService.getBudgetResponsesByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable UUID budgetId,
                                                        Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get budget request for user {} and budget {}", userId, budgetId);
        BudgetResponse response = budgetService.getBudgetResponseById(budgetId, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable UUID budgetId,
                                                       @Valid @RequestBody BudgetRequest request,
                                                       Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update budget request for user {} and budget {}", userId, budgetId);
        BudgetResponse response = budgetService.updateBudget(budgetId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID budgetId,
                                             Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete budget request for user {} and budget {}", userId, budgetId);
        budgetService.deleteBudget(budgetId, userId);
        return ResponseEntity.noContent().build();
    }
}
