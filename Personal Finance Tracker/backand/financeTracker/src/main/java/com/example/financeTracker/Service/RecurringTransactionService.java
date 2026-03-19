package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.RecurringTransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.RecurringTransactionResponse;
import com.example.financeTracker.Entity.RecurringTransaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionService {

    RecurringTransactionResponse createRecurringTransaction(RecurringTransactionRequest request, UUID userId);

    RecurringTransactionResponse updateRecurringTransaction(UUID recurringTransactionId,
                                                           RecurringTransactionRequest request,
                                                           UUID userId);

    RecurringTransaction saveRecurringTransaction(RecurringTransaction recurringTransaction);

    List<RecurringTransactionResponse> getRecurringTransactionResponsesByUserId(UUID userId);

    List<RecurringTransaction> getRecurringTransactionsByUserId(UUID userId);

    List<RecurringTransaction> getRecurringTransactionsDueByDate(LocalDate nextRunDate);

    Optional<RecurringTransaction> getRecurringTransactionByIdAndUserId(UUID recurringTransactionId, UUID userId);

    int runDailyJob();

    void deleteRecurringTransaction(UUID recurringTransactionId, UUID userId);
}
