package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.TransactionResponse;
import com.example.financeTracker.Entity.Transaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest request, UUID userId);

    TransactionResponse updateTransaction(UUID transactionId, TransactionRequest request, UUID userId);

    Transaction saveTransaction(Transaction transaction);

    List<TransactionResponse> getTransactionResponsesByUserId(UUID userId);

    List<TransactionResponse> getTransactionResponsesByAccountId(UUID accountId, UUID userId);

    TransactionResponse getTransactionResponseById(UUID transactionId, UUID userId);

    List<Transaction> getTransactionsByUserId(UUID userId);

    List<Transaction> getTransactionsByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate);

    Optional<Transaction> getTransactionByIdAndUserId(UUID transactionId, UUID userId);

    void deleteTransaction(UUID transactionId, UUID userId);
}
