package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.TransactionResponse;
import com.example.financeTracker.Service.TransactionService;
import com.example.financeTracker.Security.CurrentUserContext;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request) {
        UUID userId = CurrentUserContext.getUserId();
        log.info("Received create transaction request for user {}", userId);
        TransactionResponse response = transactionService.createTransaction(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> updateTransaction(@PathVariable UUID transactionId,
                                                                 @Valid @RequestBody TransactionRequest request) {
        UUID userId = CurrentUserContext.getUserId();
        log.info("Received update transaction request for user {} and transaction {}", userId, transactionId);
        TransactionResponse response = transactionService.updateTransaction(transactionId, request, userId);
        return ResponseEntity.ok(response);
    }
}
