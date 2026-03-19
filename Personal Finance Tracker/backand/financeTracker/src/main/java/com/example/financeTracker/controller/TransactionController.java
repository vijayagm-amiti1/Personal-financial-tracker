package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.TransactionResponse;
import com.example.financeTracker.Service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByUserId(@PathVariable UUID userId) {
        log.info("Received get transactions by user request for user {}", userId);
        List<TransactionResponse> responses = transactionService.getTransactionResponsesByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByAccountId(@PathVariable UUID accountId,
                                                                                @RequestParam UUID userId) {
        log.info("Received get transactions by account request for user {} and account {}", userId, accountId);
        List<TransactionResponse> responses = transactionService.getTransactionResponsesByAccountId(accountId, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable UUID transactionId,
                                                                  @RequestParam UUID userId) {
        log.info("Received get transaction by id request for user {} and transaction {}", userId, transactionId);
        TransactionResponse response = transactionService.getTransactionResponseById(transactionId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request,
                                                                 @RequestParam UUID userId) {
        log.info("Received create transaction request for user {}", userId);
        TransactionResponse response = transactionService.createTransaction(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> updateTransaction(@PathVariable UUID transactionId,
                                                                 @Valid @RequestBody TransactionRequest request,
                                                                 @RequestParam UUID userId) {
        log.info("Received update transaction request for user {} and transaction {}", userId, transactionId);
        TransactionResponse response = transactionService.updateTransaction(transactionId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID transactionId,
                                                  @RequestParam UUID userId) {
        log.info("Received delete transaction request for user {} and transaction {}", userId, transactionId);
        transactionService.deleteTransaction(transactionId, userId);
        return ResponseEntity.noContent().build();
    }
}
